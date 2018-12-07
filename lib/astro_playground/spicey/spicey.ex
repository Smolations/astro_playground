defmodule AstroPlayground.Spicey do
  @cmd "python3"
  @script_path "priv/scripts/"

  # [, date, observer, target, frame] = args
  def get_state(date, observer, target, frame \\ "J2000") do
    # sys_cmd "get_state", [date, observer, target, "--frame " <> frame]
    sys_cmd "get_state", [date, observer, target]
  end

  def orbital_elements(date) do
    sys_cmd "orbital_elements", [date]
  end

  def str2et(date) do
    sys_cmd "str2et", [date]
  end


  defp sys_cmd(script_name, _params \\ []) do
    System.cmd(@cmd,
      [@script_path <> script_name <> ".py" | _params],
      stderr_to_stdout: true
    )
  end


  @moduledoc """
  The Example context.
  """

  import Ecto.Query, warn: false

  alias AstroPlayground.Repo
  alias AstroPlayground.Spicey.Object

  @doc """
  Returns the list of objects.

  ## Examples

      iex> list_objects()
      [%Object{}, ...]

  """
  def list_objects do
    Object
    |> Repo.all()
    |> Repo.preload(:texture)
  end

  @doc """
  Gets a single object.

  Raises `Ecto.NoResultsError` if the Object does not exist.

  ## Examples

      iex> get_object!(123)
      %Object{}

      iex> get_object!(456)
      ** (Ecto.NoResultsError)

  """
  def get_object!(id) do
    Object
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
    %Object{}
    |> Object.changeset(attrs)
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
  def update_object(%Object{} = object, attrs) do
    object
    |> Object.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes an Object.

  ## Examples

      iex> delete_body(body)
      {:ok, %Body{}}

      iex> delete_body(body)
      {:error, %Ecto.Changeset{}}

  """
  def delete_object(%Object{} = object) do
    Repo.delete(object)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking object changes.

  ## Examples

      iex> change_object(object)
      %Ecto.Changeset{source: %Object{}}

  """
  def change_object(%Object{} = object) do
    Object.changeset(object, %{})
  end
end
