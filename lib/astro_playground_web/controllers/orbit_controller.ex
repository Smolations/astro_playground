defmodule AstroPlaygroundWeb.OrbitController do
  use AstroPlaygroundWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias AstroPlayground.Orbits
  alias AstroPlaygroundWeb.Schemas

  action_fallback AstroPlaygroundWeb.FallbackController

  tags ["Objects"]

  operation :orbits_index,
    summary: "Orbits this body anchors",
    description: "Orbit edges where this body is the barycenter/center, with each barycenter expanded.",
    parameters: [spice_object_id: [in: :path, description: "Database id", type: :integer, required: true, example: 7]],
    responses: [
      ok: {"Orbits", "application/json",
           %OpenApiSpex.Schema{type: :object, properties: %{data: %OpenApiSpex.Schema{type: :array, items: %OpenApiSpex.Schema{type: :object, additionalProperties: true}}}}}
    ]

  # /objects/:spice_object_id/orbits
  # find the orbits for which the body is the center
  def orbits_index(conn, %{"spice_object_id" => spice_object_id}) do
    orbits = Orbits.find_orbits(spice_object_id)
    render(conn, "orbits_index.json", orbits: orbits)
  end

  operation :orbiting_index,
    summary: "Bodies orbiting this one",
    description: "The children of a barycenter/body, each expanded to the full object (used to build a system view).",
    parameters: [spice_object_id: [in: :path, description: "Database id", type: :integer, required: true, example: 7]],
    responses: [ok: {"Orbiting bodies", "application/json", Schemas.OrbitingResponse}]

  # /objects/:spice_object_id/orbiting
  # find the objects orbiting the given object
  def orbiting_index(conn, %{"spice_object_id" => spice_object_id}) do
    orbiting = Orbits.find_orbiting(spice_object_id)
    # IO.puts "OrbitController.orbiting_index"
    # IO.inspect orbiting
    render(conn, "orbiting_index.json", orbiting: orbiting)
  end

  def index(conn, _params) do
    orbits = Orbits.list_orbits()
    render(conn, "index.json", orbits: orbits)
  end
end
