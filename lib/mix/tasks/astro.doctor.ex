defmodule Mix.Tasks.Astro.Doctor do
  @shortdoc "On-demand health check: kernels on disk + DB seed counts"
  @moduledoc """
  A quick, local health check of a set-up environment. Reports whether the
  required kernels are present on disk and whether the database looks seeded.
  Does not hit the network — for URL reachability use `mix astro.preflight`.

      mix astro.doctor

  Exits non-zero if any required kernel is missing on disk or the database is
  unreachable/unseeded.
  """
  use Mix.Task

  @impl Mix.Task
  def run(_args) do
    kernels_ok = kernels_report()
    db_ok = db_report()

    if kernels_ok and db_ok do
      IO.puts("\nastro.doctor: all checks passed.")
    else
      Mix.raise("astro.doctor: one or more checks failed — see above.")
    end
  end

  defp kernels_report do
    required = Enum.filter(AstroPlayground.Kernels.files(), &AstroPlayground.Kernels.required?/1)

    {present, missing} =
      Enum.split_with(required, fn f -> File.exists?(AstroPlayground.Kernels.dest(f)) end)

    IO.puts("Kernels on disk: #{length(present)}/#{length(required)} required present.")

    Enum.each(missing, fn f ->
      IO.puts("  MISSING: #{AstroPlayground.Kernels.dest(f)}")
    end)

    if missing != [], do: IO.puts("  -> run `mix ecto.setup` (or `mix run priv/repo/seeds.exs`) to fetch them.")

    missing == []
  end

  defp db_report do
    Mix.Task.run("app.start")

    import Ecto.Query, only: [from: 2]
    alias AstroPlayground.Repo

    counts =
      for {label, table} <- [{"objects", "spice_objects"}, {"orbits", "orbits"}, {"textures", "textures"}] do
        {label, Repo.one(from(r in table, select: count()))}
      end

    summary = Enum.map_join(counts, " / ", fn {l, n} -> "#{n} #{l}" end)
    IO.puts("Database: #{summary}.")

    if Enum.all?(counts, fn {_l, n} -> n > 0 end) do
      true
    else
      IO.puts("  -> database looks unseeded; run `mix ecto.setup`.")
      false
    end
  rescue
    e ->
      IO.puts("Database: unreachable (#{Exception.message(e)}).")
      IO.puts("  -> is the db container up? try `docker compose up -d db`.")
      false
  end
end
