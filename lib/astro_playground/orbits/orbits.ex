defmodule AstroPlayground.Orbits do
  @moduledoc """
  The Example context.
  """

  import Ecto.Query, warn: false
  alias AstroPlayground.Repo
  alias AstroPlayground.Orbits.Orbit

  @doc """
  Returns the list of orbits.

  ## Examples

      iex> find_orbits(2)
      [%Orbit{}, ...]

  """
  def find_orbits(object_id) do
    query = from o in Orbit,
            where: o.orbiting_id == ^object_id
    Repo.all(query)
    |> Repo.preload([barycenter: [:texture]])
  end

  @doc """
  Returns the list of orbits.

  ## Examples

      iex> find_orbiting(3)
      [%Orbit{}, ...]

  """
  def find_orbiting(object_id) do
    query = from o in Orbit,
            where: o.barycenter_id == ^object_id
    Repo.all(query)
    |> Repo.preload([orbiting: [:texture]])
  end

  @doc """
  Returns the list of orbits.

  ## Examples

      iex> list_orbits()
      [%Orbit{}, ...]

  """
  def list_orbits do
    Repo.all(Orbit)
  end

  @doc """
  Gets a single orbit.

  Raises `Ecto.NoResultsError` if the Orbit does not exist.

  ## Examples

      iex> get_orbit!(123)
      %Orbit{}

      iex> get_orbit!(456)
      ** (Ecto.NoResultsError)

  """
  def get_orbit!(id), do: Repo.get!(Orbit, id)

  @doc """
  Creates a orbit.

  ## Examples

      iex> create_orbit(%{field: value})
      {:ok, %Orbit{}}

      iex> create_orbit(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_orbit(attrs \\ %{}) do
    %Orbit{}
    |> Orbit.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a orbit.

  ## Examples

      iex> update_orbit(orbit, %{field: new_value})
      {:ok, %Orbit{}}

      iex> update_orbit(orbit, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_orbit(%Orbit{} = orbit, attrs) do
    orbit
    |> Orbit.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Orbit.

  ## Examples

      iex> delete_orbit(orbit)
      {:ok, %Orbit{}}

      iex> delete_orbit(orbit)
      {:error, %Ecto.Changeset{}}

  """
  def delete_orbit(%Orbit{} = orbit) do
    Repo.delete(orbit)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking orbit changes.

  ## Examples

      iex> change_orbit(orbit)
      %Ecto.Changeset{source: %Orbit{}}

  """
  def change_orbit(%Orbit{} = orbit) do
    Orbit.changeset(orbit, %{})
  end
end
