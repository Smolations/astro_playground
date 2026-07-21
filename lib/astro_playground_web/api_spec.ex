defmodule AstroPlaygroundWeb.ApiSpec do
  @moduledoc """
  Builds the OpenAPI 3 document for the JSON API (issue #2).

  Paths are collected from the router — only controller actions carrying an
  `operation` spec appear. Served as JSON at `/api/openapi` and rendered by the
  SwaggerUI at `/api/docs`.
  """
  alias OpenApiSpex.{Info, OpenApi, Paths, Server}
  alias AstroPlaygroundWeb.Router

  @behaviour OpenApi

  @impl OpenApi
  def spec do
    %OpenApi{
      # A relative server so SwaggerUI's "Try it out" targets the same origin as
      # the page it's served from — works both directly (:4000) and through the
      # Vite dev proxy (:5173) with no CORS setup.
      servers: [%Server{url: "/", description: "Same origin as this page"}],
      info: %Info{
        title: "AstroPlayground API",
        version: "1.0.0",
        description: """
        JSON API behind the AstroPlayground solar-system visualizer. Bodies,
        orbits, and textures come from a Postgres catalog; trajectories,
        orientation, and size/shape are computed live from real NAIF SPICE
        ephemerides. All responses are JSON. Reference frame is `ECLIPJ2000`
        (ecliptic) unless noted.
        """
      },
      paths: Paths.from_router(Router)
    }
    |> OpenApiSpex.resolve_schema_modules()
  end
end
