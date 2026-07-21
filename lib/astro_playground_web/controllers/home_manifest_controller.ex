defmodule AstroPlaygroundWeb.HomeManifestController do
  @moduledoc """
  Serves the precomputed render manifest that drives the grouped home page
  (systems, per-body links, and each system's renderability status). The file is
  generated offline by `mix astro.manifest` (run as part of `mix ecto.setup`) so
  the request path stays cheap — no SPICE work per request.
  """
  use AstroPlaygroundWeb, :controller

  def show(conn, _params) do
    case File.read(manifest_path()) do
      {:ok, body} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, body)

      {:error, _reason} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "render manifest not generated — run `mix astro.manifest`"})
    end
  end

  defp manifest_path do
    Path.join(:code.priv_dir(:astro_playground), "render_manifest.json")
  end
end
