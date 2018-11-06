defmodule AstroPlayground.Bodies.Body do
  use Ecto.Schema
  import Ecto.Changeset


  schema "bodies" do
    field :name, :string
    field :type, :string
    field :diameter, :integer
    field :oblateness, :float
    field :axial_tilt, :float
    field :rotation_duration, :float

    timestamps()
  end

  @doc false
  def changeset(body, attrs) do
    body
    |> cast(attrs, [:name, :type, :diameter, :oblateness, :axial_tilt, :rotation_duration])
    |> validate_required([:name, :type, :diameter])
  end
end
