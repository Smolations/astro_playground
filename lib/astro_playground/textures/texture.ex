defmodule AstroPlayground.Textures.Texture do
  use Ecto.Schema
  import Ecto.Changeset

  alias AstroPlayground.EctoEnums.TextureFidelityEnum


  schema "textures" do
    field :ambient_occlusion, :string
    field :bump, :string
    field :displacement, :string
    field :emissive, :string
    field :map, :string
    field :normal, :string

    # Provenance — see AddProvenanceToTextures migration.
    field :fidelity, TextureFidelityEnum
    field :source, :string
    field :source_url, :string
    field :license, :string
    field :attribution, :string
    field :resolution, :string

    belongs_to :spice_object, AstroPlayground.SpiceObjects.SpiceObject

    timestamps()
  end

  @doc false
  def changeset(texture, attrs) do
    texture
    |> cast(attrs, [
      :ambient_occlusion,
      :bump,
      :displacement,
      :emissive,
      :map,
      :normal,
      :fidelity,
      :source,
      :source_url,
      :license,
      :attribution,
      :resolution
    ])
    |> validate_required([:map])
  end
end
