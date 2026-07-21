defmodule Mix.Tasks.Astro.Manifest do
  @shortdoc "Emit a UI-ready render manifest (systems, links, per-body renderability)"
  @moduledoc """
  Walks every seeded object and the orbit parent/child graph and, using SPICE,
  determines what each home-page link renders and whether it *can* render. It is
  both the automated answer to "validate every link" (issue #5, goal 1) and the
  data source for the grouped home page (goal 2).

      mix astro.manifest                 # write priv/render_manifest.json + print a report
      mix astro.manifest --out PATH      # write somewhere else
      mix astro.manifest --check         # exit non-zero if any system is broken (CI gate)

  Per body it records the frontend route (`/barycenters/:id` = animated *system*
  view; `/<type>s/:id` = single *body* view), whether its ephemeris resolves,
  its distance from its barycenter (to catch a body coincident with it), whether
  it has real RADII, and whether it has a texture.

  Each barycenter gets a `status` mirroring what `BarycenterModel` will actually
  do:

    * `ok`    — multiple bodies with orbital extent; the animated view is meaningful
    * `lone`  — a single body coincident with its barycenter (a moonless planet);
                renders, but framed as a lone body with no orbital motion (e.g.
                Mercury, Venus)
    * `empty` — no child's ephemeris resolves, so nothing renders (e.g. Saturn —
                no seeded satellite kernel, so the planet center 699 has no data)

  Requires the db (seeded) and the kernels on disk — same prerequisites as the
  app. Does not hit the network.
  """
  use Mix.Task

  @default_out "priv/render_manifest.json"
  @probe_script "priv/scripts/renderability.py"
  @epoch "2026-01-01T00:00:00"

  @impl Mix.Task
  def run(args) do
    {opts, _, _} = OptionParser.parse(args, strict: [out: :string, check: :boolean])
    out = opts[:out] || @default_out

    Mix.Task.run("app.start")

    manifest = build_manifest()
    File.write!(out, Jason.encode!(manifest, pretty: true))

    report(manifest, out)

    broken = Enum.filter(manifest.systems, &(&1.status == "empty"))

    if opts[:check] && broken != [] do
      Mix.raise("astro.manifest: #{length(broken)} system(s) not renderable — see above.")
    end
  end

  # ---- graph -> manifest ---------------------------------------------------

  defp build_manifest do
    import Ecto.Query, only: [from: 2]
    alias AstroPlayground.Repo
    alias AstroPlayground.SpiceObjects.SpiceObject
    alias AstroPlayground.Orbits.Orbit

    objects = Repo.all(from(o in SpiceObject, preload: [:texture]))
    orbits = Repo.all(Orbit)

    by_id = Map.new(objects, &{&1.id, &1})
    {barycenters, others} = Enum.split_with(objects, &(&1.type == :barycenter))

    # barycenter_id => [child object, ...]
    children =
      orbits
      |> Enum.group_by(& &1.barycenter_id, &Map.get(by_id, &1.orbiting_id))
      |> Map.new(fn {k, v} -> {k, Enum.reject(v, &is_nil/1)} end)

    child_ids = orbits |> Enum.map(& &1.orbiting_id) |> MapSet.new()

    probes = probe_pairs(barycenters, children)

    systems =
      barycenters
      |> Enum.sort_by(& &1.id)
      |> Enum.map(&system_entry(&1, Map.get(children, &1.id, []), probes))

    # Anything never listed as a child and not itself a barycenter (e.g. the Sun
    # when it isn't seeded under a system) is a standalone body-view link.
    ungrouped =
      others
      |> Enum.reject(&MapSet.member?(child_ids, &1.id))
      |> Enum.sort_by(& &1.id)
      |> Enum.map(&body_link/1)

    %{
      epoch: @epoch,
      systems: systems,
      ungrouped: ungrouped
    }
  end

  defp system_entry(bary, kids, probes) do
    bodies =
      Enum.map(kids, fn kid ->
        probe = Map.get(probes, {to_string(bary.spice_id), to_string(kid.spice_id)}, %{})

        body_link(kid)
        |> Map.merge(%{
          ephemeris_ok: Map.get(probe, "ephemeris_ok", false),
          dist_km: Map.get(probe, "dist_km"),
          has_radii: Map.get(probe, "has_radii", false),
          error: Map.get(probe, "error")
        })
      end)

    renderable = Enum.filter(bodies, & &1.ephemeris_ok)
    max_radius = renderable |> Enum.map(&(&1.dist_km || 0)) |> Enum.max(fn -> 0 end)

    {status, reason} =
      cond do
        renderable == [] ->
          {"empty", "no child body's ephemeris resolves"}

        # A moonless planet sits on its own barycenter (zero extent). The system
        # view frames it as a lone body (no orbital motion) — renderable, but
        # essentially the same as its body view.
        max_radius == 0 ->
          {"lone", "single body coincident with its barycenter — no orbital motion"}

        true ->
          {"ok", nil}
      end

    # The non-satellite anchor of the system (the planet/dwarf/star) — the row
    # that should carry both a "view body" and "view system" CTA.
    primary = Enum.find(bodies, &(&1.type in ["planet", "dwarf_planet", "star"]))

    %{
      barycenter: body_link(bary),
      status: status,
      reason: reason,
      renderable_count: length(renderable),
      max_radius_km: max_radius,
      primary_id: primary && primary.id,
      bodies: bodies
    }
  end

  defp body_link(obj) do
    %{
      id: obj.id,
      name: obj.name,
      type: to_string(obj.type),
      spice_id: obj.spice_id,
      spice_name: obj.spice_name,
      route: route_for(obj),
      has_texture: not is_nil(obj.texture) and not is_nil(obj.texture.map)
    }
  end

  # Mirror routes.jsx: barycenters open the system view, everything else a spheroid.
  defp route_for(%{type: :barycenter, id: id}), do: "/barycenters/#{id}"
  defp route_for(%{type: type, id: id}), do: "/#{type}s/#{id}"

  # ---- SPICE probe ---------------------------------------------------------

  defp probe_pairs(barycenters, children) do
    pairs =
      for bary <- barycenters, kid <- Map.get(children, bary.id, []) do
        %{observer: to_string(bary.spice_id), target: to_string(kid.spice_id)}
      end

    if pairs == [] do
      %{}
    else
      tmp = Path.join(System.tmp_dir!(), "render_probe_#{System.unique_integer([:positive])}.json")
      File.write!(tmp, Jason.encode!(pairs))

      try do
        {out, 0} =
          System.cmd("python3", [@probe_script, tmp, "--date", @epoch], stderr_to_stdout: false)

        out
        |> Jason.decode!()
        |> Map.new(&{{&1["observer"], &1["target"]}, &1})
      after
        File.rm(tmp)
      end
    end
  end

  # ---- report --------------------------------------------------------------

  defp report(manifest, out) do
    IO.puts("\nRender manifest — epoch #{manifest.epoch}\n")

    Enum.each(manifest.systems, fn s ->
      IO.puts("#{badge(s.status)}  #{s.barycenter.name}  (#{s.renderable_count}/#{length(s.bodies)} bodies render)")
      if s.reason, do: IO.puts("       ↳ #{s.reason}")

      Enum.each(s.bodies, fn b ->
        note =
          cond do
            not b.ephemeris_ok -> "  ✗ ephemeris (#{b.error})"
            b.dist_km == 0 -> "  · on barycenter"
            true -> ""
          end

        IO.puts("       - #{b.name} [#{b.type}]#{note}")
      end)
    end)

    if manifest.ungrouped != [] do
      IO.puts("\nUngrouped (body views): #{Enum.map_join(manifest.ungrouped, ", ", & &1.name)}")
    end

    broken = Enum.count(manifest.systems, &(&1.status == "empty"))

    IO.puts(
      "\n#{length(manifest.systems)} systems, #{broken} not renderable. Written to #{out}."
    )
  end

  defp badge("ok"), do: "OK  "
  defp badge("lone"), do: "LONE"
  defp badge("empty"), do: "EMPTY"
  defp badge(other), do: String.upcase(other)
end
