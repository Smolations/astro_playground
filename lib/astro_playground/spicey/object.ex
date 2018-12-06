defmodule AstroPlayground.Spicey.Object do
  use Ecto.Schema
  import Ecto.Changeset


  schema "spicey_objects" do
    field :name, :string
    field :spice_id, :integer
    field :spice_name, :string
    field :type, :string

    timestamps()
  end

  @doc false
  def changeset(object, attrs) do
    object
    |> cast(attrs, [:spice_id, :spice_name, :type, :name])
    |> validate_required([:spice_id, :spice_name, :type, :name])
  end
end
