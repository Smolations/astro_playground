defmodule AstroPlayground.Bodies.Texture do
  use Ecto.Schema
  import Ecto.Changeset


  schema "textures" do
    field :ambient_occlusion, :string
    field :bump, :string
    field :displacement, :string
    field :emissive, :string
    field :map, :string
    field :normal, :string
    field :body_id, :id

    timestamps()
  end

  @doc false
  def changeset(texture, attrs) do
    texture
    |> cast(attrs, [:ambient_occlusion, :bump, :displacement, :emissive, :map, :normal])
    |> validate_required([:map])
  end
end
