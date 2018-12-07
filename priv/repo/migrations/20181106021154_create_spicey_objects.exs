defmodule AstroPlayground.Repo.Migrations.CreateSpiceyObjects do
  use Ecto.Migration

  def change do
    create table(:spicey_objects) do
      add :spice_id, :integer
      add :spice_name, :string
      add :type, :string
      add :name, :string

      timestamps()
    end

  end
end
