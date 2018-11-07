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

  # Other scopes may use custom stacks.
  scope "/api", AstroPlaygroundWeb do
    pipe_through :api

    resources "/bodies", BodyController, except: [:new, :edit] do
      resources "/textures", TextureController, only: [:index]
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
