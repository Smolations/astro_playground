defmodule AstroPlaygroundWeb.BodyController do
  use AstroPlaygroundWeb, :controller

  alias AstroPlayground.Bodies
  alias AstroPlayground.Bodies.Body

  action_fallback AstroPlaygroundWeb.FallbackController

  def index(conn, _params) do
    bodies = Bodies.list_bodies()
    render(conn, "index.json", bodies: bodies)
  end

  def create(conn, %{"body" => body_params}) do
    with {:ok, %Body{} = body} <- Bodies.create_body(body_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", body_path(conn, :show, body))
      |> render("show.json", body: body)
    end
  end

  def show(conn, %{"id" => id}) do
    body = Bodies.get_body!(id)
    render(conn, "show.json", body: body)
  end

  def update(conn, %{"id" => id, "body" => body_params}) do
    body = Bodies.get_body!(id)

    with {:ok, %Body{} = body} <- Bodies.update_body(body, body_params) do
      render(conn, "show.json", body: body)
    end
  end

  def delete(conn, %{"id" => id}) do
    body = Bodies.get_body!(id)
    with {:ok, %Body{}} <- Bodies.delete_body(body) do
      send_resp(conn, :no_content, "")
    end
  end
end
