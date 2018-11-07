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

  # def create(conn, %{"orbit" => orbit_params}) do
  #   with {:ok, %Orbit{} = orbit} <- Orbits.create_orbit(orbit_params) do
  #     conn
  #     |> put_status(:created)
  #     |> put_resp_header("location", orbit_path(conn, :show, orbit))
  #     |> render("show.json", orbit: orbit)
  #   end
  # end

  # def show(conn, %{"id" => id}) do
  #   orbit = Orbits.get_orbit!(id)
  #   render(conn, "show.json", orbit: orbit)
  # end

  # def update(conn, %{"id" => id, "orbit" => orbit_params}) do
  #   orbit = Orbits.get_orbit!(id)

  #   with {:ok, %Orbit{} = orbit} <- Orbits.update_orbit(orbit, orbit_params) do
  #     render(conn, "show.json", orbit: orbit)
  #   end
  # end

  # def delete(conn, %{"id" => id}) do
  #   orbit = Orbits.get_orbit!(id)
  #   with {:ok, %Orbit{}} <- Orbits.delete_orbit(orbit) do
  #     send_resp(conn, :no_content, "")
  #   end
  # end
end
