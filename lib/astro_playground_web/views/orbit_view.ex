defmodule AstroPlaygroundWeb.OrbitView do
  use AstroPlaygroundWeb, :view
  alias AstroPlaygroundWeb.{BodyView, OrbitView}

  def render("index.json", %{orbits: orbits}) do
    %{data: render_many(orbits, OrbitView, "orbit.json")}
  end

  def render("orbits_index.json", %{orbits: orbits}) do
    %{data: render_many(orbits, OrbitView, "orbit_center.json")}
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
      central_body_id: orbit.central_body_id,
      orbiting_body_id: orbit.orbiting_body_id,
      semi_major_axis: orbit.semi_major_axis,
      sidereal_period: orbit.sidereal_period,
      periapsis: orbit.periapsis,
      apoapsis: orbit.apoapsis,
      min_velocity: orbit.min_velocity,
      max_velocity: orbit.max_velocity,
      inclination: orbit.inclination,
      eccentricity: orbit.eccentricity,
      ascending_node: orbit.ascending_node,
    }
  end

  def render("orbit_center.json", %{orbit: orbit}) do
    central_body = render_one(orbit.central_body, BodyView, "body.json")
    %{
      id: orbit.id,
      central_body: central_body,
      orbiting_body_id: orbit.orbiting_body_id,
      semi_major_axis: orbit.semi_major_axis,
      sidereal_period: orbit.sidereal_period,
      periapsis: orbit.periapsis,
      apoapsis: orbit.apoapsis,
      min_velocity: orbit.min_velocity,
      max_velocity: orbit.max_velocity,
      inclination: orbit.inclination,
      eccentricity: orbit.eccentricity,
      ascending_node: orbit.ascending_node,
    }
  end

  def render("orbit_orbiting.json", %{orbit: orbit}) do
    orbiting_body = render_one(orbit.orbiting_body, BodyView, "body.json")
    %{
      id: orbit.id,
      central_body_id: orbit.central_body_id,
      orbiting_body: orbiting_body,
      semi_major_axis: orbit.semi_major_axis,
      sidereal_period: orbit.sidereal_period,
      periapsis: orbit.periapsis,
      apoapsis: orbit.apoapsis,
      min_velocity: orbit.min_velocity,
      max_velocity: orbit.max_velocity,
      inclination: orbit.inclination,
      eccentricity: orbit.eccentricity,
      ascending_node: orbit.ascending_node,
    }
  end
end
