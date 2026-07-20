defmodule AstroPlayground.Textures do
  @moduledoc """
  The Example context.
  """

  import Ecto.Query, warn: false
  alias AstroPlayground.Repo
  alias AstroPlayground.Textures.Texture

  @doc """
  Returns the list of textures.

  ## Examples

      iex> list_textures()
      [%Texture{}, ...]

  """
  def find_textures(object_id) do
    query = from t in Texture,
            where: t.spice_object_id == ^object_id
    Repo.all(query)
  end

  @doc """
  Returns the list of textures.

  ## Examples

      iex> list_textures()
      [%Texture{}, ...]

  """
  def list_textures do
    Repo.all(Texture)
  end

  @doc """
  Gets a single texture.

  Raises `Ecto.NoResultsError` if the Texture does not exist.

  ## Examples

      iex> get_texture!(123)
      %Texture{}

      iex> get_texture!(456)
      ** (Ecto.NoResultsError)

  """
  def get_texture!(id), do: Repo.get!(Texture, id)

  @doc """
  Creates a texture.

  ## Examples

      iex> create_texture(%{field: value})
      {:ok, %Texture{}}

      iex> create_texture(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_texture(attrs \\ %{}) do
    %Texture{}
    |> Texture.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a texture.

  ## Examples

      iex> update_texture(texture, %{field: new_value})
      {:ok, %Texture{}}

      iex> update_texture(texture, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_texture(%Texture{} = texture, attrs) do
    texture
    |> Texture.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Texture.

  ## Examples

      iex> delete_texture(texture)
      {:ok, %Texture{}}

      iex> delete_texture(texture)
      {:error, %Ecto.Changeset{}}

  """
  def delete_texture(%Texture{} = texture) do
    Repo.delete(texture)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking texture changes.

  ## Examples

      iex> change_texture(texture)
      %Ecto.Changeset{source: %Texture{}}

  """
  def change_texture(%Texture{} = texture) do
    Texture.changeset(texture, %{})
  end
end
