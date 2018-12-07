defmodule AstroPlayground.Textures.Texture do
  use Ecto.Schema
  import Ecto.Changeset


  schema "textures" do
    field :ambient_occlusion, :string
    field :bump, :string
    field :displacement, :string
    field :emissive, :string
    field :map, :string
    field :normal, :string

    belongs_to :spicey_object, AstroPlayground.Spicey.Object

    timestamps()
  end

  @doc false
  def changeset(texture, attrs) do
    texture
    |> cast(attrs, [:ambient_occlusion, :bump, :displacement, :emissive, :map, :normal])
    |> validate_required([:map])
  end
end
