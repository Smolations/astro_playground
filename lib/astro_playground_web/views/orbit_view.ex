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

  # field :inclination, :float
  #   field :period, :float
  #   field :min_velocity, :float
  #   field :max_velocity, :float
  #   field :semi_major_axis, :float
  #   belongs_to :center_body, AstroPlayground.Bodies.Body, foreign_key: :center_body_id
  #   belongs_to :orbiting_body, AstroPlayground.Bodies.Body, foreign_key: :orbiting_body_id

  def render("orbit.json", %{orbit: orbit}) do
    %{id: orbit.id,
      central_body_id: orbit.central_body_id,
      orbiting_body_id: orbit.orbiting_body_id,
      inclination: orbit.inclination,
      period: orbit.period,
      min_velocity: orbit.min_velocity,
      max_velocity: orbit.max_velocity,
      semi_major_axis: orbit.semi_major_axis}
  end

  def render("orbit_center.json", %{orbit: orbit}) do
    central_body = render_one(orbit.central_body, BodyView, "body.json")
    %{id: orbit.id,
      central_body: central_body,
      orbiting_body_id: orbit.orbiting_body_id,
      inclination: orbit.inclination,
      period: orbit.period,
      min_velocity: orbit.min_velocity,
      max_velocity: orbit.max_velocity,
      semi_major_axis: orbit.semi_major_axis}
  end

  def render("orbit_orbiting.json", %{orbit: orbit}) do
    orbiting_body = render_one(orbit.orbiting_body, BodyView, "body.json")
    %{id: orbit.id,
      central_body_id: orbit.central_body_id,
      orbiting_body: orbiting_body,
      inclination: orbit.inclination,
      period: orbit.period,
      min_velocity: orbit.min_velocity,
      max_velocity: orbit.max_velocity,
      semi_major_axis: orbit.semi_major_axis}
  end
end
