defmodule AstroPlayground.Repo.Migrations.CreateTextures do
  use Ecto.Migration

  def change do
    create table(:textures) do
      add :ambient_occlusion, :string
      add :bump, :string
      add :displacement, :string
      add :emissive, :string
      add :map, :string
      add :normal, :string
      add :spice_object_id, references(:spice_objects, on_delete: :delete_all), null: false

      timestamps()
    end

    create index(:textures, [:spice_object_id])
  end
end
