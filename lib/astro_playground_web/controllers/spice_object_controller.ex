defmodule AstroPlaygroundWeb.SpiceObjectController do
  use AstroPlaygroundWeb, :controller

  alias AstroPlayground.SpiceObjects
  alias AstroPlayground.SpiceObjects.SpiceObject

  action_fallback AstroPlaygroundWeb.FallbackController

  def index(conn, _params) do
    objects = SpiceObjects.list_objects()
    render(conn, "index.json", objects: objects)
  end

  def create(conn, %{"object" => object_params}) do
    with {:ok, %SpiceObject{} = object} <- SpiceObjects.create_object(object_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", spice_object_path(conn, :show, object))
      |> render("show.json", object: object)
    end
  end

  def show(conn, %{"id" => id}) do
    object = SpiceObjects.get_object!(id)
    render(conn, "show.json", object: object)
  end

  def update(conn, %{"id" => id, "object" => object_params}) do
    object = SpiceObjects.get_object!(id)

    with {:ok, %SpiceObject{} = object} <- SpiceObjects.update_object(object, object_params) do
      render(conn, "show.json", object: object)
    end
  end

  def delete(conn, %{"id" => id}) do
    object = SpiceObjects.get_object!(id)
    with {:ok, %SpiceObject{}} <- SpiceObjects.delete_object(object) do
      send_resp(conn, :no_content, "")
    end
  end
end
