defmodule AstroPlaygroundWeb.BodyView do
  use AstroPlaygroundWeb, :view
  alias AstroPlaygroundWeb.{BodyView, OrbitView, TextureView}

  def render("index.json", %{bodies: bodies}) do
    %{data: render_many(bodies, BodyView, "body.json")}
  end

  def render("show.json", %{body: body}) do
    %{data: render_one(body, BodyView, "body.json")}
  end

  def render("body.json", %{body: body}) do
    # IO.inspect body
    texture = render_one(body.texture, TextureView, "texture.json")
    %{
      id: body.id,
      name: body.name,
      type: body.type,
      mass: body.mass,
      volume: body.volume,
      mean_density: body.mean_density,
      equatorial_radius: body.equatorial_radius,
      polar_radius: body.polar_radius,
      volumetric_mean_radius: body.volumetric_mean_radius,
      oblateness: body.oblateness,
      axial_tilt: body.axial_tilt,
      obliquity_to_orbit: body.obliquity_to_orbit,
      sidereal_rotation_period: body.sidereal_rotation_period,
      mu: body.mu,
      texture: texture,
    }
  end
end
