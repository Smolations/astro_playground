defmodule AstroPlayground.Orbits.Orbit do
  use Ecto.Schema
  import Ecto.Changeset


  schema "orbits" do
    # field :semi_major_axis, :float  # x 10^6 km
    # field :sidereal_period, :float  # days
    # field :periapsis, :float        # x 10^6 km
    # field :apoapsis, :float         # x 10^6 km
    # field :min_velocity, :float     # km/s
    # field :max_velocity, :float     # km/s
    # field :inclination, :float      # degrees
    # field :eccentricity, :float
    # field :ascending_node, :float   # degrees

    belongs_to :barycenter, AstroPlayground.Spicey.Object, foreign_key: :barycenter_id
    belongs_to :orbiting, AstroPlayground.Spicey.Object, foreign_key: :orbiting_id

    timestamps()
  end

  @doc false
  def changeset(orbit, attrs) do
    orbit
    # |> cast(attrs, [
    #     :semi_major_axis,
    #     :sidereal_period,
    #     :periapsis,
    #     :apoapsis,
    #     :min_velocity,
    #     :max_velocity,
    #     :inclination,
    #     :eccentricity,
    #     :ascending_node,
    #   ])
    # |> validate_required([:semi_major_axis, :inclination, :sidereal_period])
    |> unique_constraint(:orbiting_id)
  end
end
