defmodule AstroPlayground.Bodies.Body do
  use Ecto.Schema
  import Ecto.Changeset


  schema "bodies" do
    field :name, :string
    field :type, :string
    field :mass, :float                     # x 10^24 kg
    field :volume, :float                   # x 10^10 km^3
    field :mean_density, :float             # kg/m^3
    field :equatorial_radius, :float        # km
    field :polar_radius, :float             # km
    field :volumetric_mean_radius, :float   # km
    field :oblateness, :float
    field :axial_tilt, :float               # degrees
    field :obliquity_to_orbit, :float       # degrees
    field :sidereal_rotation_period, :float # hours
    field :mu, :float                       # x 10^6 km^3/s^2

    has_one :texture, AstroPlayground.Textures.Texture
    has_one :orbit, AstroPlayground.Orbits.Orbit, foreign_key: :orbiting_body_id
    has_many :orbiting, AstroPlayground.Orbits.Orbit, foreign_key: :central_body_id

    timestamps()
  end

  @doc false
  def changeset(body, attrs) do
    body
    |> cast(attrs, [
        :name,
        :type,
        :mass,
        :volume,
        :mean_density,
        :equatorial_radius,
        :polar_radius,
        :volumetric_mean_radius,
        :oblateness,
        :axial_tilt,
        :obliquity_to_orbit,
        :sidereal_rotation_period,
        :mu,
      ])
    |> validate_required([:name, :type, :mass])
  end
end
