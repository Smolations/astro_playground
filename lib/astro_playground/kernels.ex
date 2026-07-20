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
end
