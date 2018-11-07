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
    has_one :texture, AstroPlayground.Textures.Texture
    has_one :orbit, AstroPlayground.Orbits.Orbit, foreign_key: :orbiting_body_id
    has_many :orbiting, AstroPlayground.Orbits.Orbit, foreign_key: :center_body_id

    timestamps()
  end

  @doc false
  def changeset(body, attrs) do
    body
    |> cast(attrs, [:name, :type, :mass, :diameter, :oblateness, :axial_tilt, :rotation_period])
    |> validate_required([:name, :type, :mass, :diameter])
  end
end
