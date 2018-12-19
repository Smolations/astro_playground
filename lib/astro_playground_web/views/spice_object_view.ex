defmodule AstroPlaygroundWeb.SpiceObjectView do
  use AstroPlaygroundWeb, :view
  alias AstroPlaygroundWeb.{SpiceObjectView, TextureView}

  def render("index.json", %{objects: objects}) do
    %{data: render_many(objects, SpiceObjectView, "object.json")}
  end

  def render("show.json", %{object: object}) do
    %{data: render_one(object, SpiceObjectView, "object.json")}
  end

  def render("object.json", %{object: object}) do
    # IO.inspect object
    texture = render_one(object.texture, TextureView, "texture.json")
    %{
      id: object.id,
      spice_id: object.spice_id,
      name: object.name,
      spice_name: object.spice_name,
      texture: texture,
    }
  end
end
