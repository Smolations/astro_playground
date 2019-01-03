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

    post "/get_state", SpiceyController, :show
    post "/get_state", SpiceyController, :show
    get "/identify_code/:code", SpiceyController, :identify_code
    get "/identify_name/:name", SpiceyController, :identify_name

    resources "/objects", SpiceObjectController, except: [:new, :edit] do
      resources "/textures", TextureController, only: [:index]
      get "/size_and_shape", SpiceyController, :get_size_and_shape
      # get "/size_and_shape", SpiceObjectController, :get_size_and_shape
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
