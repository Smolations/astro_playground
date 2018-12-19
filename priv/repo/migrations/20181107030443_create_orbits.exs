defmodule AstroPlayground.Repo.Migrations.CreateOrbits do
  use Ecto.Migration

  def change do
    create table(:orbits) do
      add :barycenter_id, references(:spice_objects, on_delete: :delete_all), null: false
      add :orbiting_id, references(:spice_objects, on_delete: :delete_all), null: false

      timestamps()
    end

    create unique_index(:orbits, [:barycenter_id, :orbiting_id])
    create index(:orbits, [:barycenter_id])
  end
end
