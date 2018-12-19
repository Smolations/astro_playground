defmodule AstroPlaygroundWeb.SpiceObjectController do
  use AstroPlaygroundWeb, :controller

  alias AstroPlayground.SpiceObjects
  alias AstroPlayground.SpiceObjects.SpiceObject

  action_fallback AstroPlaygroundWeb.FallbackController


  def index(conn, %{"type" => type}) do
    objects = SpiceObjects.list_objects_by_type(type)
    render(conn, "index.json", spice_objects: objects)
  end

  def index(conn, _params) do
    objects = SpiceObjects.list_objects()
    render(conn, "index.json", spice_objects: objects)
  end

  def create(conn, %{"spice_object" => spice_object_params}) do
    with {:ok, %SpiceObject{} = spice_object} <- SpiceObjects.create_object(spice_object_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", spice_object_path(conn, :show, spice_object))
      |> render("show.json", spice_object: spice_object)
    end
  end

  def show(conn, %{"id" => id}) do
    object = SpiceObjects.get_object!(id)
    render(conn, "show.json", spice_object: object)
  end

  def update(conn, %{"id" => id, "spice_object" => spice_object_params}) do
    spice_object = SpiceObjects.get_object!(id)

    with {:ok, %SpiceObject{} = spice_object} <- SpiceObjects.update_object(spice_object, spice_object_params) do
      render(conn, "show.json", spice_object: spice_object)
    end
  end

  def delete(conn, %{"id" => id}) do
    object = SpiceObjects.get_object!(id)
    with {:ok, %SpiceObject{}} <- SpiceObjects.delete_object(object) do
      send_resp(conn, :no_content, "")
    end
  end
end
