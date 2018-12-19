defmodule AstroPlaygroundWeb.OrbitController do
  use AstroPlaygroundWeb, :controller

  alias AstroPlayground.Orbits

  action_fallback AstroPlaygroundWeb.FallbackController

  # /bodies/:body_id/orbits
  # find the orbits for which the body is the center
  def orbits_index(conn, %{"body_id" => body_id}) do
    orbits = Orbits.find_orbits(body_id)
    render(conn, "orbits_index.json", orbits: orbits)
  end

  # /bodies/:body_id/orbiting
  # find the bodies orbiting the given body
  def orbiting_index(conn, %{"body_id" => body_id}) do
    orbiting = Orbits.find_orbiting(body_id)
    # IO.puts "OrbitController.orbiting_index"
    # IO.inspect orbiting
    render(conn, "orbiting_index.json", orbiting: orbiting)
  end

  def index(conn, _params) do
    orbits = Orbits.list_orbits()
    render(conn, "index.json", orbits: orbits)
  end
end
