defmodule AstroPlayground.Orbits.Orbit do
  use Ecto.Schema
  import Ecto.Changeset


  schema "orbits" do
    field :semi_major_axis, :float  # x 10^6 km
    field :sidereal_period, :float  # days
    field :periapsis, :float        # x 10^6 km
    field :apoapsis, :float         # x 10^6 km
    field :min_velocity, :float     # km/s
    field :max_velocity, :float     # km/s
    field :inclination, :float      # degrees
    field :eccentricity, :float

    belongs_to :central_body, AstroPlayground.Bodies.Body, foreign_key: :central_body_id
    belongs_to :orbiting_body, AstroPlayground.Bodies.Body, foreign_key: :orbiting_body_id

    timestamps()
  end

  @doc false
  def changeset(orbit, attrs) do
    orbit
    |> cast(attrs, [
        :semi_major_axis,
        :sidereal_period,
        :periapsis,
        :apoapsis,
        :min_velocity,
        :max_velocity,
        :inclination,
        :eccentricity,
      ])
    |> validate_required([:semi_major_axis, :inclination, :sidereal_period])
    |> unique_constraint(:orbiting_body_id)
  end
end
