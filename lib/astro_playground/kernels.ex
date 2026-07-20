defmodule AstroPlayground.Kernels do
  @moduledoc """
  NAIF SPICE kernel manifest, availability preflight, and downloader.

  `@files` is the canonical list of files first-time setup fetches from NAIF,
  mirrored under `priv/kernels/`. It is the single source of truth — the seed
  script and the `mix astro.*` tasks all read it here.

  Loaded kernels (`.bsp`/`.tls`/`.tpc`/`.bpc`) are **required**: if one is
  unreachable, `fetch/1` aborts *before* downloading anything, so setup fails
  fast with guidance instead of producing a partial, broken kernel set.
  Everything else (readmes, summaries, provenance `.cmt`/`.tf`) is **optional**
  — a 404 only warns.

  NAIF renames/supersedes filenames regularly (jup310 -> jup365, mar097 ->
  mar099s, plu055 -> plu060, ...). The preflight (HEAD requests, exposed via
  `mix astro.preflight`) is the fast early-warning that a pinned name has moved,
  and emits per-file suggestions for finding the replacement.
  """

  @url_root "https://naif.jpl.nasa.gov/pub/naif/generic_kernels"
  @kernel_dir "priv/kernels"

  # Extensions of kernels that actually get furnsh'd. A 404 on one of these is
  # fatal to setup; anything else is provenance/metadata and only warns.
  @required_exts ~w(.bsp .tls .tpc .bpc)

  @files [
    "fk/planets/aareadme.txt",
    "fk/satellites/aareadme.txt",

    "lsk/aareadme.txt",
    "lsk/naif0012.tls",

    "pck/aareadme.txt",
    "pck/gm_de431.tpc",
    "pck/pck00010.tpc",

    "spk/asteroids/codes_300ast_20100725.cmt",
    "spk/asteroids/codes_300ast_20100725.tf",
    "spk/planets/aa_summaries_by_alpha.txt",
    "spk/planets/aa_summaries_by_date.txt",
    "spk/planets/aa_summaries.txt",
    "spk/planets/aareadme_de430-de431.txt",
    "spk/planets/aareadme_de432s.txt",
    "spk/planets/de432_tech-comments.txt",
    "spk/planets/de432s.bsp",
    "spk/satellites/AAREADME_Satellite_SPKs",
    "spk/satellites/aa_summaries_by_alpha.txt",
    "spk/satellites/aa_summaries.txt",
    "spk/satellites/aa_summaries_by_date.txt",
    # Satellite ephemerides loaded by the meta-kernel. The 2018 filenames
    # (jup310, mar097, plu055, ...) were superseded on the NAIF server.
    "spk/satellites/jup365.bsp",   # Jupiter: Galilean + inner moons
    "spk/satellites/mar099s.bsp",  # Mars: Phobos, Deimos
    "spk/satellites/plu060.bsp",   # Pluto: Charon, Nix, Hydra, Kerberos, Styx
    "spk/satellites/nep097.bsp",   # Neptune: Triton
    # ura111.bsp lives in a_old_versions/ — the current ura116xl.bsp holds only
    # the minor irregular moons (716-724), not the five majors (701-705). The
    # xl per-moon kernels are multi-GB; ura111 (majors + Puck, 1899-2100) is 162M.
    "spk/satellites/a_old_versions/ura111.bsp",  # Uranus: Ariel, Umbriel, Titania, Oberon, Miranda, Puck
    "spk/satellites/nep105.bsp"    # Neptune: Nereid (nep097 has only Triton)
  ]

  @doc "The canonical NAIF file manifest (paths relative to the generic_kernels root)."
  def files, do: @files

  @doc "The NAIF generic_kernels URL root."
  def url_root, do: @url_root

  @doc "Local mirror path for a manifest entry."
  def dest(file), do: Path.join([File.cwd!(), @kernel_dir, file])

  @doc "True if `file` is a furnsh'd kernel (a 404 on it should abort setup)."
  def required?(file), do: Path.extname(file) in @required_exts

  @doc """
  HEAD-check every manifest file's reachability without downloading.

  Prints a report (warnings for missing optional files and unverifiable ones),
  and returns `{:ok, results}` when every required kernel is reachable, or
  `{:error, missing_required}` otherwise — with per-file guidance printed.
  """
  def preflight(files \\ @files) do
    IO.puts("Preflight: checking #{length(files)} NAIF files are reachable...")
    results = Enum.map(files, &check/1)

    unreachable = Enum.reject(results, & &1.ok)
    missing_required = Enum.filter(unreachable, &(&1.required and &1.status != :error))
    unverified = Enum.filter(unreachable, &(&1.status == :error))
    missing_optional = Enum.filter(unreachable, &(not &1.required and &1.status != :error))

    Enum.each(missing_optional, fn r ->
      IO.puts("  warning: optional file missing (HTTP #{r.status}): #{r.file}")
    end)

    Enum.each(unverified, fn r ->
      IO.puts("  warning: could not verify (network error), will still attempt: #{r.file}")
    end)

    reachable = length(results) - length(unreachable)

    if missing_required == [] do
      IO.puts("Preflight OK — #{reachable}/#{length(results)} reachable.")
      {:ok, results}
    else
      IO.puts("\nPreflight FAILED — #{length(missing_required)} required kernel(s) unreachable:\n")
      Enum.each(missing_required, &IO.puts(suggestion(&1)))
      {:error, missing_required}
    end
  end

  @doc """
  Run the preflight, then download every manifest file.

  Aborts (raises via `Mix.raise/1`) if a required kernel is unreachable, so a
  fresh setup never proceeds into a partial download. Existing files are left
  in place (idempotent re-run).
  """
  def fetch(files \\ @files) do
    case preflight(files) do
      {:ok, _} ->
        IO.puts("\nDownloading NAIF files...")
        Enum.each(files, &get_file/1)
        :ok

      {:error, _missing} ->
        Mix.raise("""
        NAIF kernel preflight failed — aborting before any download.

        See the per-file guidance above. Once you've updated the entry in
        AstroPlayground.Kernels @files (and priv/kernels/meta_kernels/meta_kernel.tm
        if a furnsh'd kernel moved), re-run. To re-check without downloading:

            mix astro.preflight
        """)
    end
  end

  @doc "Download a single manifest file into its local mirror path (skips if present)."
  def get_file(file) do
    dest = dest(file)

    if File.exists?(dest) do
      IO.puts("exists:  " <> dest)
    else
      File.mkdir_p!(Path.dirname(dest))

      case Req.get(@url_root <> "/" <> file, into: File.stream!(dest), receive_timeout: 600_000) do
        {:ok, %{status: 200}} ->
          IO.puts("downloaded:  " <> dest)

        {:ok, %{status: status}} ->
          File.rm(dest)
          IO.puts("ERROR:   HTTP #{status} for " <> dest)

        {:error, reason} ->
          File.rm(dest)
          IO.puts("ERROR:   Download failed for " <> dest)
          IO.inspect(reason)
      end
    end
  end

  defp check(file) do
    status = head_status(@url_root <> "/" <> file)
    %{file: file, status: status, ok: status == 200, required: required?(file)}
  end

  defp head_status(url) do
    case Req.head(url, retry: false, receive_timeout: 30_000) do
      {:ok, %{status: status}} -> status
      {:error, _reason} -> :error
    end
  end

  defp suggestion(%{file: file, status: status}) do
    dir = Path.dirname(file)

    """
      - #{file}  (HTTP #{status})
        The pinned filename is gone; NAIF likely renamed or superseded it.
          1. Browse #{@url_root}/#{dir}/
             (and #{@url_root}/#{dir}/a_old_versions/) for the current name.
          2. Confirm coverage via its .cmt (same name, .cmt extension): check
             "Bodies on the File" and the timespan cover what you need.
          3. Update the entry in AstroPlayground.Kernels @files — and
             priv/kernels/meta_kernels/meta_kernel.tm if this kernel is furnsh'd.
    """
  end

  # ——— Kernel version detection & opt-in upgrade (issue #7) ———

  @meta_kernel "priv/kernels/meta_kernels/meta_kernel.tm"
  @manifest_source "lib/astro_playground/kernels.ex"

  # human labels for the NAIF family prefixes we use
  @family_names %{
    "de" => "Planets (DE)", "jup" => "Jupiter", "mar" => "Mars",
    "plu" => "Pluto", "ura" => "Uranus", "nep" => "Neptune", "sat" => "Saturn"
  }

  @doc "Human label for a family prefix (e.g. \"jup\" -> \"Jupiter\")."
  def family_name(prefix), do: Map.get(@family_names, prefix, prefix)

  @doc """
  For every furnsh'd `.bsp` in the manifest, look for newer same-family kernels
  on NAIF and assess whether each still covers the current kernel's bodies and a
  target epoch year. Network-heavy (directory listings + a `.cmt` per candidate).
  Returns a list of assessment maps.
  """
  def upgrade_report(target_year \\ 2026) do
    @files
    |> Enum.filter(&(required?(&1) and Path.extname(&1) == ".bsp"))
    |> Enum.map(&assess(&1, target_year))
  end

  @doc """
  Opt-in upgrade: verify `new_rel` covers all of `old_rel`'s bodies (and the
  target epoch), then download it and swap the references in the meta-kernel and
  the manifest — leaving the old kernel file on disk. Aborts if coverage regresses.
  """
  def upgrade(old_rel, new_rel, target_year \\ 2026) do
    old_cmt = fetch_cmt(old_rel) || Mix.raise("No .cmt for current kernel #{old_rel}.")
    new_cmt = fetch_cmt(new_rel) || Mix.raise("No .cmt for #{new_rel} — cannot verify coverage; aborting.")

    old_bodies = cmt_bodies(old_cmt)
    new_bodies = cmt_bodies(new_cmt)
    missing = MapSet.difference(old_bodies, new_bodies)

    if MapSet.size(old_bodies) > 0 and MapSet.size(missing) > 0 do
      Mix.raise("""
      #{new_rel} does NOT cover all bodies currently provided by #{old_rel}.
      Missing: #{missing |> MapSet.to_list() |> Enum.sort() |> Enum.join(", ")}
      Refusing to regress coverage. (Some newer kernels are complements, not
      supersets — e.g. nep105/Nereid does not replace nep097/Triton.)
      """)
    end

    case cmt_years(new_cmt) do
      {a, b} when target_year < a or target_year > b ->
        Mix.raise("#{new_rel} timespan #{a}–#{b} does not cover target epoch #{target_year}; aborting.")
      _ -> :ok
    end

    IO.puts("Coverage verified: #{new_rel} ⊇ #{old_rel} bodies. Downloading...")
    get_file(new_rel)

    swap_in_file(@meta_kernel, old_rel, new_rel)
    swap_in_file(@manifest_source, old_rel, new_rel)

    IO.puts("""

    Upgraded #{old_rel} -> #{new_rel}
      - downloaded the new kernel (old kept on disk)
      - swapped references in #{@meta_kernel} and #{@manifest_source}
    Next: recompile, re-run the app, verify the affected system renders, then
    commit. To undo, revert those two files and delete the new .bsp.
    """)

    :ok
  end

  defp assess(file, target_year) do
    cur = parse_name(Path.basename(file))

    cur_bodies =
      case fetch_cmt(file) do
        nil -> MapSet.new()
        cmt -> cmt_bodies(cmt)
      end

    candidates =
      file
      |> candidate_files()
      |> Enum.filter(&newer_variant?(&1, cur))
      |> Enum.sort_by(&parse_name(Path.basename(&1)).version, :desc)
      |> Enum.take(6)
      |> Enum.map(&assess_candidate(&1, cur_bodies, target_year))

    %{file: file, current: cur, current_bodies: cur_bodies, candidates: candidates}
  end

  defp assess_candidate(cand, cur_bodies, target_year) do
    cmt = fetch_cmt(cand)
    bodies = if cmt, do: cmt_bodies(cmt), else: MapSet.new()
    years = cmt && cmt_years(cmt)

    covers =
      cond do
        MapSet.size(cur_bodies) == 0 -> :unknown
        MapSet.subset?(cur_bodies, bodies) -> true
        true -> false
      end

    epoch_ok = case years do {a, b} -> target_year >= a and target_year <= b; _ -> nil end

    %{
      file: cand,
      bodies: bodies,
      covers: covers,
      missing: MapSet.difference(cur_bodies, bodies),
      gained: MapSet.difference(bodies, cur_bodies),
      years: years,
      epoch_ok: epoch_ok,
      recommended: covers == true and epoch_ok == true
    }
  end

  @doc "Parse a NAIF kernel basename into %{prefix, version, suffix} (or nil)."
  def parse_name(name) do
    case Regex.run(~r/^([a-z]+)(\d+)([a-z]*)\.bsp$/i, name) do
      [_, pfx, ver, sfx] ->
        %{base: name, prefix: String.downcase(pfx), version: String.to_integer(ver), suffix: String.downcase(sfx)}

      _ ->
        nil
    end
  end

  defp newer_variant?(cand, cur) when is_map(cur) do
    case parse_name(Path.basename(cand)) do
      %{prefix: p, version: v, suffix: s} ->
        p == cur.prefix and Path.basename(cand) != cur.base and
          (v > cur.version or (v == cur.version and s != cur.suffix))

      _ ->
        false
    end
  end

  defp newer_variant?(_, _), do: false

  # Same-family .bsp files in the kernel's own dir and its a_old_versions sibling.
  defp candidate_files(file) do
    dir = Path.dirname(file)
    base_dir = String.replace_suffix(dir, "/a_old_versions", "")

    [base_dir, base_dir <> "/a_old_versions"]
    |> Enum.uniq()
    |> Enum.flat_map(&list_bsp/1)
    |> Enum.uniq()
  end

  defp list_bsp(dir) do
    case Req.get(@url_root <> "/" <> dir <> "/", retry: false, receive_timeout: 30_000) do
      {:ok, %{status: 200, body: body}} ->
        ~r/href="([a-z]+\d+[a-z]*\.bsp)"/i
        |> Regex.scan(to_string(body))
        |> Enum.map(fn [_, n] -> dir <> "/" <> n end)

      _ ->
        []
    end
  end

  defp fetch_cmt(file) do
    url = @url_root <> "/" <> String.replace_suffix(file, ".bsp", ".cmt")

    case Req.get(url, retry: false, receive_timeout: 30_000) do
      {:ok, %{status: 200, body: body}} -> to_string(body)
      _ -> nil
    end
  end

  # NAIF ID integers from the "Bodies on the File" table (2nd column).
  defp cmt_bodies(text) do
    text
    |> String.split("\n")
    |> Enum.drop_while(&(not String.contains?(&1, "Bodies on the File")))
    |> Enum.drop(1)
    |> Enum.drop_while(&(String.trim(&1) == ""))
    |> Enum.take_while(fn line ->
      String.trim(line) != "" and not String.contains?(line, "Additional Constants")
    end)
    |> Enum.flat_map(fn line ->
      case Regex.run(~r/^\s*\S+\s+(\d{2,6})\b/, line) do
        [_, n] -> [String.to_integer(n)]
        _ -> []
      end
    end)
    |> MapSet.new()
  end

  # {min_year, max_year} from the .cmt timespan (parenthesised dates, or BEGIN/END_TIME).
  defp cmt_years(text) do
    years =
      ~r/\((?:\d{1,2}-[A-Za-z]{3}-)?(\d{4})\)/
      |> Regex.scan(text)
      |> Enum.map(fn [_, y] -> String.to_integer(y) end)

    years =
      if length(years) >= 2 do
        years
      else
        ~r/(?:BEGIN|END)_TIME\s*=\s*(?:CAL-ET\s+)?(\d{4})/
        |> Regex.scan(text)
        |> Enum.map(fn [_, y] -> String.to_integer(y) end)
      end

    case years do
      [] -> nil
      ys -> {Enum.min(ys), Enum.max(ys)}
    end
  end

  defp swap_in_file(path, old_rel, new_rel) do
    contents = File.read!(path)

    unless String.contains?(contents, old_rel) do
      Mix.raise("Could not find #{old_rel} in #{path} to swap.")
    end

    File.write!(path, String.replace(contents, old_rel, new_rel))
  end
end
