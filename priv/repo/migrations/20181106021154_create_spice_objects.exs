defmodule AstroPlayground.Repo.Migrations.CreateSpiceObjects do
  use Ecto.Migration
  alias AstroPlayground.EctoEnums.SpiceObjectTypeEnum

  def change do
    SpiceObjectTypeEnum.create_type

    create table(:spice_objects) do
      add :spice_id, :integer
      add :spice_name, :string
      add :type, SpiceObjectTypeEnum.type()
      add :name, :string

      timestamps()
    end

  end
end
