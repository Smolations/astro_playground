defmodule Mix.Tasks.Astro.Kernels.Check do
  @shortdoc "Report newer NAIF kernel versions that still cover our bodies + epoch"
  @moduledoc """
  For each furnsh'd `.bsp` in the manifest, queries NAIF (the kernel's directory
  and `a_old_versions/`) for newer same-family solutions, then uses each
  candidate's `.cmt` to check whether it still covers the current kernel's bodies
  and a target epoch. Read-only — never downloads or changes anything.

      mix astro.kernels.check          # target epoch defaults to 2026
      mix astro.kernels.check 2030     # check coverage for a different year

  A candidate is only recommended when it is a superset of the current kernel's
  bodies AND its timespan covers the target epoch (a newer file is not always a
  superset — e.g. ura116xl dropped Uranus's major moons; nep105 has Nereid but
  not Triton). Adopt one with `mix astro.kernels.upgrade OLD NEW`.
  """
  use Mix.Task

  @impl Mix.Task
  def run(args) do
    {:ok, _} = Application.ensure_all_started(:req)
    year = parse_year(args)

    IO.puts("Checking for newer kernels (target epoch #{year})...\n")

    AstroPlayground.Kernels.upgrade_report(year)
    |> Enum.each(&report/1)
  end

  defp parse_year([y | _]) do
    case Integer.parse(y) do
      {n, _} -> n
      :error -> 2026
    end
  end

  defp parse_year(_), do: 2026

  defp report(%{file: file, error: err}) do
    IO.puts("#{file}\n  ! #{err}\n")
  end

  defp report(%{file: file, current: nil, candidates: _}) do
    IO.puts("#{file}\n  ! unrecognized kernel name (can't parse family/version)\n")
  end

  defp report(%{file: file, current: cur, current_bodies: bodies, candidates: cands}) do
    label = AstroPlayground.Kernels.family_name(cur.prefix)
    IO.puts("#{label}: #{file}  (#{cur.prefix} v#{cur.version}#{cur.suffix})")

    if MapSet.size(bodies) == 0 do
      IO.puts("  current bodies: unknown (no parsable .cmt — coverage unverified)")
    else
      IO.puts("  current bodies: #{fmt_bodies(bodies)}")
    end

    cond do
      cands == [] ->
        IO.puts("  up to date — no newer same-family kernel found.\n")

      Enum.any?(cands, & &1.recommended) ->
        Enum.each(cands, &candidate_line/1)
        best = Enum.find(cands, & &1.recommended)
        IO.puts("  -> upgrade available: mix astro.kernels.upgrade #{file} #{best.file}\n")

      true ->
        Enum.each(cands, &candidate_line/1)
        IO.puts("  -> newer kernels exist but none is a clean superset — review before upgrading.\n")
    end
  end

  defp candidate_line(c) do
    cover =
      case c.covers do
        true -> "covers current ✓"
        false -> "MISSING #{fmt_bodies(c.missing)}"
        :unknown -> "coverage unverified"
      end

    epoch = case c.epoch_ok do
      true -> "epoch ✓"
      false -> "epoch ✗ (#{elem(c.years, 0)}–#{elem(c.years, 1)})"
      nil -> "epoch ?"
    end
    gained = if MapSet.size(c.gained) > 0, do: ", +#{MapSet.size(c.gained)} more bodies", else: ""
    flag = if c.recommended, do: "  <== recommended", else: ""
    IO.puts("    #{Path.basename(c.file)}: #{cover}, #{epoch}#{gained}#{flag}")
  end

  defp fmt_bodies(set) do
    list = set |> MapSet.to_list() |> Enum.sort()

    case list do
      [] -> "(none parsed)"
      _ when length(list) <= 12 -> Enum.join(list, " ")
      _ -> "#{length(list)} bodies (#{Enum.join(Enum.take(list, 8), " ")} …)"
    end
  end
end
