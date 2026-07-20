defmodule AstroPlaygroundWeb do
  @moduledoc """
  The entrypoint for defining your web interface, such as controllers, views,
  channels and so on.

  This can be used in your application as:

      use AstroPlaygroundWeb, :controller
      use AstroPlaygroundWeb, :view

  The definitions below will be executed for every view, controller, etc, so
  keep them short and clean, focused on imports, uses and aliases.
  """

  def controller do
    quote do
      use Phoenix.Controller, namespace: AstroPlaygroundWeb
      import Plug.Conn
      import AstroPlaygroundWeb.Gettext
      import AstroPlaygroundWeb.Router.Helpers
      alias AstroPlaygroundWeb.Router.Helpers, as: Routes
    end
  end

  def view do
    quote do
      use Phoenix.View,
        root: "lib/astro_playground_web/templates",
        namespace: AstroPlaygroundWeb

      # Import convenience functions from controllers
      import Phoenix.Controller, only: [view_module: 1, view_template: 1]

      # HTML escaping / safe helpers (forms moved to phoenix_html_helpers in v4;
      # unneeded here — this is a JSON API plus a single static SPA shell).
      import Phoenix.HTML

      import AstroPlaygroundWeb.ErrorHelpers
      import AstroPlaygroundWeb.Gettext
      alias AstroPlaygroundWeb.Router.Helpers, as: Routes
    end
  end

  def router do
    quote do
      use Phoenix.Router
      import Plug.Conn
      import Phoenix.Controller
    end
  end

  @doc """
  When used, dispatch to the appropriate controller/view/etc.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
