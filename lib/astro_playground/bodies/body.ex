defmodule AstroPlayground.Bodies.Body do
  use Ecto.Schema
  import Ecto.Changeset


  schema "bodies" do
    field :name, :string
    field :type, :string
    field :diameter, :integer

    timestamps()
  end

  @doc false
  def changeset(body, attrs) do
    body
    |> cast(attrs, [:name, :type, :diameter])
    |> validate_required([:name, :type, :diameter])
  end
end
