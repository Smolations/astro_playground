defmodule AstroPlayground.Bodies do
  @moduledoc """
  The Example context.
  """

  import Ecto.Query, warn: false
  alias AstroPlayground.Repo

  alias AstroPlayground.Bodies.Body

  @doc """
  Returns the list of bodies.

  ## Examples

      iex> list_bodies()
      [%Body{}, ...]

  """
  def list_bodies do
    Repo.all(Body)
  end

  @doc """
  Gets a single body.

  Raises `Ecto.NoResultsError` if the Body does not exist.

  ## Examples

      iex> get_body!(123)
      %Body{}

      iex> get_body!(456)
      ** (Ecto.NoResultsError)

  """
  def get_body!(id), do: Repo.get!(Body, id)

  @doc """
  Creates a body.

  ## Examples

      iex> create_body(%{field: value})
      {:ok, %Body{}}

      iex> create_body(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_body(attrs \\ %{}) do
    %Body{}
    |> Body.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a body.

  ## Examples

      iex> update_body(body, %{field: new_value})
      {:ok, %Body{}}

      iex> update_body(body, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_body(%Body{} = body, attrs) do
    body
    |> Body.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Body.

  ## Examples

      iex> delete_body(body)
      {:ok, %Body{}}

      iex> delete_body(body)
      {:error, %Ecto.Changeset{}}

  """
  def delete_body(%Body{} = body) do
    Repo.delete(body)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking body changes.

  ## Examples

      iex> change_body(body)
      %Ecto.Changeset{source: %Body{}}

  """
  def change_body(%Body{} = body) do
    Body.changeset(body, %{})
  end
end
