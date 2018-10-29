defmodule AstroPlaygroundWeb.PageController do
  use AstroPlaygroundWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
