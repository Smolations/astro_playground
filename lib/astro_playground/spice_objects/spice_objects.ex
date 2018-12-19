defmodule AstroPlayground.SpiceObjects do
  @moduledoc """
  The Example context.
  """

  import Ecto.Query, warn: false

  alias AstroPlayground.Repo
  alias AstroPlayground.Textures
  alias AstroPlayground.SpiceObjects.SpiceObject

  @doc """
  Returns the list of objects.

  ## Examples

      iex> list_objects()
      [%Object{}, ...]

  """
  def list_objects do
    SpiceObject
    |> Repo.all()
    |> Repo.preload(:texture)
  end

  @doc """
  Gets a single object.

  Raises `Ecto.NoResultsError` if the SpiceObject does not exist.

  ## Examples

      iex> get_object!(123)
      %Object{}

      iex> get_object!(456)
      ** (Ecto.NoResultsError)

  """
  def get_object!(id) do
    SpiceObject
    |> Repo.get!(id)
    |> Repo.preload(:texture)
  end

  @doc """
  Creates an object.

  ## Examples

      iex> create_object(%{field: value})
      {:ok, %Object{}}

      iex> create_object(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_object(attrs \\ %{}) do
    %SpiceObject{}
    |> SpiceObject.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates an object.

  ## Examples

      iex> update_object(object, %{field: new_value})
      {:ok, %Object{}}

      iex> update_object(object, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_object(%SpiceObject{} = object, attrs) do
    object
    |> SpiceObject.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes an SpiceObject.

  ## Examples

      iex> delete_body(body)
      {:ok, %Body{}}

      iex> delete_body(body)
      {:error, %Ecto.Changeset{}}

  """
  def delete_object(%SpiceObject{} = object) do
    Repo.delete(object)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking object changes.

  ## Examples

      iex> change_object(object)
      %Ecto.Changeset{source: %Object{}}

  """
  def change_object(%SpiceObject{} = object) do
    SpiceObject.changeset(object, %{})
  end
end
