defmodule AstroPlayground.Orbits.Orbit do
  use Ecto.Schema
  import Ecto.Changeset
  alias AstroPlayground.SpiceObjects.SpiceObject


  schema "orbits" do
    belongs_to :barycenter, SpiceObject, foreign_key: :barycenter_id
    belongs_to :orbiting, SpiceObject, foreign_key: :orbiting_id

    timestamps()
  end

  @doc false
  def changeset(orbit, attrs) do
    orbit
    |> unique_constraint([:barycenter_id, :orbiting_id])
  end
end
