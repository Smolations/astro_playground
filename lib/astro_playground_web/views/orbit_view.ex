defmodule AstroPlaygroundWeb.OrbitView do
  use AstroPlaygroundWeb, :view
  alias AstroPlaygroundWeb.{SpiceObjectView, OrbitView}

  def render("index.json", %{orbits: orbits}) do
    %{data: render_many(orbits, OrbitView, "orbit.json")}
  end

  def render("orbits_index.json", %{orbits: orbits}) do
    %{data: render_many(orbits, OrbitView, "orbit_barycenter.json")}
  end

  def render("orbiting_index.json", %{orbiting: orbiting}) do
    %{data: render_many(orbiting, OrbitView, "orbit_orbiting.json")}
  end

  # def render("show.json", %{orbit: orbit}) do
  #   %{data: render_one(orbit, OrbitView, "orbit.json")}
  # end

  def render("orbit.json", %{orbit: orbit}) do
    %{
      id: orbit.id,
      barycenter_id: orbit.barycenter_id,
      orbiting_id: orbit.orbiting_id,
    }
  end

  def render("orbit_barycenter.json", %{orbit: orbit}) do
    barycenter = render_one(orbit.barycenter, SpiceObjectView, "object.json")
    %{
      id: orbit.id,
      barycenter: barycenter,
      orbiting_id: orbit.orbiting_id,
    }
  end

  def render("orbit_orbiting.json", %{orbit: orbit}) do
    orbiting = render_one(orbit.orbiting, SpiceObjectView, "object.json")
    %{
      id: orbit.id,
      barycenter_id: orbit.barycenter_id,
      orbiting: orbiting,
    }
  end
end
