defmodule AstroPlaygroundWeb.Router do
  use AstroPlaygroundWeb, :router

  pipeline :browser do
    plug :accepts, ["html", "css"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  # OpenAPI/Swagger docs (issue #2) run on their own pipelines so a spec-build
  # problem can never take down the JSON API itself. The spec (JSON) needs
  # PutApiSpec; the SwaggerUI page is HTML, so it can't use the json-only stack.
  pipeline :openapi_spec do
    plug :accepts, ["json"]
    plug OpenApiSpex.Plug.PutApiSpec, module: AstroPlaygroundWeb.ApiSpec
  end

  pipeline :api_docs do
    plug :accepts, ["html"]
  end

  # No controller alias in these scopes: the OpenApiSpex plug modules are
  # top-level, and `scope "/api", AstroPlaygroundWeb` would rewrite them to
  # AstroPlaygroundWeb.OpenApiSpex.Plug.*.
  scope "/api" do
    pipe_through :api_docs
    get "/docs", OpenApiSpex.Plug.SwaggerUI, path: "/api/openapi"
  end

  scope "/api" do
    pipe_through :openapi_spec
    get "/openapi", OpenApiSpex.Plug.RenderSpec, []
  end

  # Other scopes may use custom stacks.
  scope "/api", AstroPlaygroundWeb do
    pipe_through :api

    get "/home_manifest", HomeManifestController, :show
    post "/get_state", SpiceyController, :show
    post "/trajectory", SpiceyController, :trajectory
    get "/identify_code/:code", SpiceyController, :identify_code
    get "/identify_name/:name", SpiceyController, :identify_name

    resources "/objects", SpiceObjectController, only: [:index, :show] do
      resources "/textures", TextureController, only: [:index]
      get "/size_and_shape", SpiceyController, :get_size_and_shape
      get "/orientation", SpiceyController, :get_orientation
      get "/orbits", OrbitController, :orbits_index
      get "/orbiting", OrbitController, :orbiting_index
    end

    resources "/textures", TextureController, except: [:new, :edit]
  end


  scope "/", AstroPlaygroundWeb do
    pipe_through :browser # Use the default browser stack

    get "/*path", PageController, :index
  end
end
