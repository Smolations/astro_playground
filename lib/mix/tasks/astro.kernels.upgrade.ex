defmodule Mix.Tasks.Astro.Kernels.Upgrade do
  @shortdoc "Opt-in: adopt a newer NAIF kernel after verifying coverage"
  @moduledoc """
  Deliberately replace a pinned kernel with a newer one. Verifies (via `.cmt`)
  that the new kernel covers **all** of the current kernel's bodies and the
  target epoch, then downloads it and swaps the references in the meta-kernel and
  the manifest (`AstroPlayground.Kernels`). The old kernel file is left on disk.

  Those two swapped files are **git-tracked** (the kernel binary itself is not),
  so the command finishes by printing the exact `git`/`gh` commands to open a PR
  with just those changes — nothing is committed automatically.

      mix astro.kernels.upgrade OLD NEW [TARGET_YEAR]

  Both OLD and NEW are paths relative to the NAIF generic_kernels root, e.g.

      mix astro.kernels.upgrade spk/satellites/jup365.bsp spk/satellites/jup380.bsp

  Aborts if coverage would regress. Never runs automatically — find candidates
  with `mix astro.kernels.check` first, then recompile/test/commit afterwards.
  """
  use Mix.Task

  @impl Mix.Task
  def run([old, new | rest]) do
    {:ok, _} = Application.ensure_all_started(:req)
    year = case rest do
      [y | _] -> case Integer.parse(y) do
        {n, _} -> n
        :error -> 2026
      end
      _ -> 2026
    end

    AstroPlayground.Kernels.upgrade(old, new, year)
  end

  def run(_args) do
    Mix.raise("Usage: mix astro.kernels.upgrade OLD NEW [TARGET_YEAR]  (paths relative to the NAIF generic_kernels root)")
  end
end
