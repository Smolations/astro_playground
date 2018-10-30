defmodule AstroPlayground.Repo.Migrations.CreateBodies do
  use Ecto.Migration

  def change do
    create table(:bodies) do
      add :name, :string
      add :type, :string
      add :diameter, :integer
      add :orbital_radius, :bigint

      timestamps()
    end

  end
end
