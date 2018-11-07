defmodule AstroPlaygroundWeb.TextureControllerTest do
  use AstroPlaygroundWeb.ConnCase

  alias AstroPlayground.Bodies
  alias AstroPlayground.Textures.Texture

  @create_attrs %{ambient_occlusion: "some ambient_occlusion", bump: "some bump", displacement: "some displacement", emissive: "some emissive", map: "some map", normal: "some normal"}
  @update_attrs %{ambient_occlusion: "some updated ambient_occlusion", bump: "some updated bump", displacement: "some updated displacement", emissive: "some updated emissive", map: "some updated map", normal: "some updated normal"}
  @invalid_attrs %{ambient_occlusion: nil, bump: nil, displacement: nil, emissive: nil, map: nil, normal: nil}

  def fixture(:texture) do
    {:ok, texture} = Bodies.create_texture(@create_attrs)
    texture
  end

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all textures", %{conn: conn} do
      conn = get conn, texture_path(conn, :index)
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create texture" do
    test "renders texture when data is valid", %{conn: conn} do
      conn = post conn, texture_path(conn, :create), texture: @create_attrs
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get conn, texture_path(conn, :show, id)
      assert json_response(conn, 200)["data"] == %{
        "id" => id,
        "ambient_occlusion" => "some ambient_occlusion",
        "bump" => "some bump",
        "displacement" => "some displacement",
        "emissive" => "some emissive",
        "map" => "some map",
        "normal" => "some normal"}
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, texture_path(conn, :create), texture: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update texture" do
    setup [:create_texture]

    test "renders texture when data is valid", %{conn: conn, texture: %Texture{id: id} = texture} do
      conn = put conn, texture_path(conn, :update, texture), texture: @update_attrs
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get conn, texture_path(conn, :show, id)
      assert json_response(conn, 200)["data"] == %{
        "id" => id,
        "ambient_occlusion" => "some updated ambient_occlusion",
        "bump" => "some updated bump",
        "displacement" => "some updated displacement",
        "emissive" => "some updated emissive",
        "map" => "some updated map",
        "normal" => "some updated normal"}
    end

    test "renders errors when data is invalid", %{conn: conn, texture: texture} do
      conn = put conn, texture_path(conn, :update, texture), texture: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete texture" do
    setup [:create_texture]

    test "deletes chosen texture", %{conn: conn, texture: texture} do
      conn = delete conn, texture_path(conn, :delete, texture)
      assert response(conn, 204)
      assert_error_sent 404, fn ->
        get conn, texture_path(conn, :show, texture)
      end
    end
  end

  defp create_texture(_) do
    texture = fixture(:texture)
    {:ok, texture: texture}
  end
end
