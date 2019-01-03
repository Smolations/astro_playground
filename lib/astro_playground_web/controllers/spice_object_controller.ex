defmodule AstroPlaygroundWeb.SpiceObjectController do
  use AstroPlaygroundWeb, :controller

  alias AstroPlayground.Spicey
  alias AstroPlayground.SpiceObjects
  alias AstroPlayground.SpiceObjects.SpiceObject

  action_fallback AstroPlaygroundWeb.FallbackController


  def index(conn, %{"type" => type}) do
    objects = SpiceObjects.list_objects_by_type(type)
    render(conn, "index.json", spice_objects: objects)
  end

  def index(conn, %{"spice_id" => spice_id}) do
    objects = SpiceObjects.get_object_by_spice_id!(spice_id)
    render(conn, "index.json", spice_objects: objects)
  end

  def index(conn, %{"spice_name" => spice_name}) do
    objects = SpiceObjects.list_objects_by_spice_name(spice_name)
    render(conn, "index.json", spice_objects: objects)
  end

  def index(conn, _params) do
    objects = SpiceObjects.list_objects()
    render(conn, "index.json", spice_objects: objects)
  end

  def show(conn, %{"id" => id}) do
    object = SpiceObjects.get_object!(id)
    render(conn, "show.json", spice_object: object)
  end
end
