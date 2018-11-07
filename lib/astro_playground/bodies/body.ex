defmodule AstroPlayground.Bodies.Body do
  use Ecto.Schema
  import Ecto.Changeset


  schema "bodies" do
    field :name, :string
    field :type, :string
    field :mass, :float
    field :diameter, :integer
    field :oblateness, :float
    field :axial_tilt, :float
    field :rotation_period, :float

    timestamps()
  end

  @doc false
  def changeset(body, attrs) do
    body
    |> cast(attrs, [:name, :type, :mass, :diameter, :oblateness, :axial_tilt, :rotation_period])
    |> validate_required([:name, :type, :mass, :diameter])
  end
end
