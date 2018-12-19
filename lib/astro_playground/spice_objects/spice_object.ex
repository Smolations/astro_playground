defmodule AstroPlayground.SpiceObjects.SpiceObject do
  use Ecto.Schema
  import Ecto.Changeset


  schema "spice_objects" do
    field :name, :string
    field :spice_id, :integer
    field :spice_name, :string
    field :type, SpiceObjectTypeEnum

    has_one :texture, AstroPlayground.Textures.Texture
    has_many :orbit, AstroPlayground.Orbits.Orbit, foreign_key: :orbiting_id
    has_many :orbiting, AstroPlayground.Orbits.Orbit, foreign_key: :barycenter_id

    timestamps()
  end

  @doc false
  def changeset(object, attrs) do
    object
    |> cast(attrs, [:spice_id, :spice_name, :type, :name])
    |> validate_required([:spice_id, :spice_name, :type, :name])
  end
end
