defmodule AstroPlayground.Orbits.Orbit do
  use Ecto.Schema
  import Ecto.Changeset


  schema "orbits" do
    # field :eccentricity, :float
    field :inclination, :float
    field :period, :float
    field :min_velocity, :float
    field :max_velocity, :float
    field :semi_major_axis, :float
    belongs_to :center_body, AstroPlayground.Bodies.Body, foreign_key: :center_body_id
    belongs_to :orbiting_body, AstroPlayground.Bodies.Body, foreign_key: :orbiting_body_id

    timestamps()
  end

  @doc false
  def changeset(orbit, attrs) do
    orbit
    |> cast(attrs, [:inclination, :period, :min_velocity, :max_velocity, :semi_major_axis])
    |> validate_required([:inclination, :period])
    |> unique_constraint(:orbiting_body_id)
  end
end
