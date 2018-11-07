defmodule AstroPlaygroundWeb.TextureController do
  use AstroPlaygroundWeb, :controller

  alias AstroPlayground.Bodies
  alias AstroPlayground.Bodies.Texture

  action_fallback AstroPlaygroundWeb.FallbackController

  # /bodies/:body_id/textures
  # find the textures connected to a body
  def index(conn, %{"body_id" => body_id}) do
    textures = Bodies.find_textures(body_id)
    render(conn, "index.json", textures: textures)
  end

  def index(conn, _params) do
    textures = Bodies.list_textures()
    render(conn, "index.json", textures: textures)
  end

  def create(conn, %{"texture" => texture_params}) do
    with {:ok, %Texture{} = texture} <- Bodies.create_texture(texture_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", texture_path(conn, :show, texture))
      |> render("show.json", texture: texture)
    end
  end

  def show(conn, %{"id" => id}) do
    texture = Bodies.get_texture!(id)
    render(conn, "show.json", texture: texture)
  end

  def update(conn, %{"id" => id, "texture" => texture_params}) do
    texture = Bodies.get_texture!(id)

    with {:ok, %Texture{} = texture} <- Bodies.update_texture(texture, texture_params) do
      render(conn, "show.json", texture: texture)
    end
  end

  def delete(conn, %{"id" => id}) do
    texture = Bodies.get_texture!(id)
    with {:ok, %Texture{}} <- Bodies.delete_texture(texture) do
      send_resp(conn, :no_content, "")
    end
  end
end
