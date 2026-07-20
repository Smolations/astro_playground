defmodule Mix.Tasks.Astro.Preflight do
  @shortdoc "Check every NAIF kernel URL is reachable (HEAD only, no download)"
  @moduledoc """
  Runs the kernel-availability preflight without downloading anything or
  touching the database. Exits non-zero if a required kernel is unreachable,
  printing per-file guidance for finding the replacement.

  Use it before a fresh `mix ecto.setup`, or any time you suspect NAIF has
  renamed/superseded a pinned kernel.

      mix astro.preflight
  """
  use Mix.Task

  @requirements []

  @impl Mix.Task
  def run(_args) do
    {:ok, _} = Application.ensure_all_started(:req)

    case AstroPlayground.Kernels.preflight() do
      {:ok, _results} -> :ok
      {:error, _missing} -> Mix.raise("Preflight failed — see guidance above.")
    end
  end
end
