defmodule AstroPlayground.Repo.Migrations.CreateBodies do
  use Ecto.Migration

  def change do
    create table(:bodies) do
      add :name, :string
      add :type, :string
      add :mass, :float
      add :volume, :float
      add :mean_density, :float
      add :equatorial_radius, :float
      add :polar_radius, :float
      add :volumetric_mean_radius, :float
      add :oblateness, :float
      add :axial_tilt, :float
      add :obliquity_to_orbit, :float
      add :sidereal_rotation_period, :float
      add :mu, :float

      timestamps()
    end

  end
end
