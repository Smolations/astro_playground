defmodule AstroPlayground.Repo.Migrations.CreateBodies do
  use Ecto.Migration

  def change do
    create table(:bodies) do
      add :name, :string
      add :type, :string
      add :diameter, :integer
      add :axial_tilt, :float
      add :rotation_duration, :float
      add :oblateness, :float

      timestamps()
    end

  end
end
