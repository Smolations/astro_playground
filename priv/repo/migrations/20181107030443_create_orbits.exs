defmodule AstroPlayground.Repo.Migrations.CreateOrbits do
  use Ecto.Migration

  def change do
    create table(:orbits) do
      add :semi_major_axis, :float
      add :sidereal_period, :float
      add :periapsis, :float
      add :apoapsis, :float
      add :min_velocity, :float
      add :max_velocity, :float
      add :inclination, :float
      add :eccentricity, :float
      add :central_body_id, references(:bodies, on_delete: :delete_all), null: false
      add :orbiting_body_id, references(:bodies, on_delete: :delete_all), null: false

      timestamps()
    end

    create unique_index(:orbits, [:orbiting_body_id])
    create index(:orbits, [:central_body_id])
  end
end
