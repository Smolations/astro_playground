defmodule AstroPlaygroundWeb.SpiceObjectController do
  use AstroPlaygroundWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias AstroPlayground.Spicey
  alias AstroPlayground.SpiceObjects
  alias AstroPlayground.SpiceObjects.SpiceObject
  alias AstroPlaygroundWeb.Schemas

  action_fallback AstroPlaygroundWeb.FallbackController

  tags ["Objects"]

  operation :index,
    summary: "List bodies",
    description: "Every seeded body (planets, satellites, star, dwarf planet, barycenters). The filters are mutually exclusive; omit all to list everything.",
    parameters: [
      type: [in: :query, description: "Filter by type", type: %OpenApiSpex.Schema{type: :string, enum: ["star", "planet", "dwarf_planet", "satellite", "barycenter"]}, required: false],
      spice_id: [in: :query, description: "Filter by NAIF SPICE id", type: :integer, required: false, example: 606],
      spice_name: [in: :query, description: "Filter by SPICE name (partial match)", type: :string, required: false, example: "Titan"]
    ],
    responses: [ok: {"Objects", "application/json", Schemas.ObjectsResponse}]

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

  operation :show,
    summary: "Get one body",
    parameters: [id: [in: :path, description: "Database id", type: :integer, required: true, example: 37]],
    responses: [ok: {"Object", "application/json", Schemas.ObjectResponse}]

  def show(conn, %{"id" => id}) do
    object = SpiceObjects.get_object!(id)
    render(conn, "show.json", spice_object: object)
  end
end
