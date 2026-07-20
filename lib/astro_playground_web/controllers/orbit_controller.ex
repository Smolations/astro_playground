defmodule AstroPlaygroundWeb.OrbitController do
  use AstroPlaygroundWeb, :controller

  alias AstroPlayground.Orbits

  action_fallback AstroPlaygroundWeb.FallbackController

  # /objects/:spice_object_id/orbits
  # find the orbits for which the body is the center
  def orbits_index(conn, %{"spice_object_id" => spice_object_id}) do
    orbits = Orbits.find_orbits(spice_object_id)
    render(conn, "orbits_index.json", orbits: orbits)
  end

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
