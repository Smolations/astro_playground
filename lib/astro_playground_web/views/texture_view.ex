defmodule AstroPlaygroundWeb.TextureView do
  use AstroPlaygroundWeb, :view
  alias AstroPlaygroundWeb.TextureView

  def render("index.json", %{textures: textures}) do
    %{data: render_many(textures, TextureView, "texture.json")}
  end

  def render("show.json", %{texture: texture}) do
    %{data: render_one(texture, TextureView, "texture.json")}
  end

  def render("texture.json", %{texture: texture}) do
    %{id: texture.id,
      body_id: texture.body_id,
      ambient_occlusion: texture.ambient_occlusion,
      bump: texture.bump,
      displacement: texture.displacement,
      emissive: texture.emissive,
      map: texture.map,
      normal: texture.normal}
  end
end
