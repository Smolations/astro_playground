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
      spice_object_id: texture.spice_object_id,
      ambient_occlusion: texture.ambient_occlusion,
      bump: texture.bump,
      displacement: texture.displacement,
      emissive: texture.emissive,
      map: texture.map,
      normal: texture.normal,
      # Provenance — surfaced so the UI can credit sources (CC BY 4.0 requires
      # visible attribution) and flag non-real textures.
      fidelity: texture.fidelity,
      source: texture.source,
      source_url: texture.source_url,
      license: texture.license,
      attribution: texture.attribution,
      resolution: texture.resolution}
  end
end
