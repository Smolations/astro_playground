defmodule AstroPlaygroundWeb.SpiceObjectView do
  use AstroPlaygroundWeb, :view
  alias AstroPlaygroundWeb.{SpiceObjectView, TextureView}

  def render("index.json", %{spice_objects: spice_objects}) do
    %{data: render_many(spice_objects, SpiceObjectView, "object.json")}
  end

  def render("show.json", %{spice_object: spice_object}) do
    %{data: render_one(spice_object, SpiceObjectView, "object.json")}
  end

  def render("object.json", %{spice_object: spice_object}) do
    # IO.inspect object
    texture = render_one(spice_object.texture, TextureView, "texture.json")
    %{
      id: spice_object.id,
      name: spice_object.name,
      type: spice_object.type,
      spice_id: spice_object.spice_id,
      spice_name: spice_object.spice_name,
      texture: texture,
    }
  end
end
