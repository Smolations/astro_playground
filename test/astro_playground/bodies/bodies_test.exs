defmodule AstroPlayground.BodiesTest do
  use AstroPlayground.DataCase

  alias AstroPlayground.Bodies

  describe "languages" do
    alias AstroPlayground.Bodies.Language

    @valid_attrs %{name: "some name", proverb: "some proverb"}
    @update_attrs %{name: "some updated name", proverb: "some updated proverb"}
    @invalid_attrs %{name: nil, proverb: nil}

    def language_fixture(attrs \\ %{}) do
      {:ok, language} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Example.create_language()

      language
    end

    test "list_languages/0 returns all languages" do
      language = language_fixture()
      assert Example.list_languages() == [language]
    end

    test "get_language!/1 returns the language with given id" do
      language = language_fixture()
      assert Example.get_language!(language.id) == language
    end

    test "create_language/1 with valid data creates a language" do
      assert {:ok, %Language{} = language} = Example.create_language(@valid_attrs)
      assert language.name == "some name"
      assert language.proverb == "some proverb"
    end

    test "create_language/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Example.create_language(@invalid_attrs)
    end

    test "update_language/2 with valid data updates the language" do
      language = language_fixture()
      assert {:ok, language} = Example.update_language(language, @update_attrs)
      assert %Language{} = language
      assert language.name == "some updated name"
      assert language.proverb == "some updated proverb"
    end

    test "update_language/2 with invalid data returns error changeset" do
      language = language_fixture()
      assert {:error, %Ecto.Changeset{}} = Example.update_language(language, @invalid_attrs)
      assert language == Example.get_language!(language.id)
    end

    test "delete_language/1 deletes the language" do
      language = language_fixture()
      assert {:ok, %Language{}} = Example.delete_language(language)
      assert_raise Ecto.NoResultsError, fn -> Example.get_language!(language.id) end
    end

    test "change_language/1 returns a language changeset" do
      language = language_fixture()
      assert %Ecto.Changeset{} = Example.change_language(language)
    end
  end

  describe "textures" do
    alias AstroPlayground.Textures.Texture

    @valid_attrs %{ambient_occlusion: "some ambient_occlusion", bump: "some bump", displacement: "some displacement", emissive: "some emissive", map: "some map", normal: "some normal"}
    @update_attrs %{ambient_occlusion: "some updated ambient_occlusion", bump: "some updated bump", displacement: "some updated displacement", emissive: "some updated emissive", map: "some updated map", normal: "some updated normal"}
    @invalid_attrs %{ambient_occlusion: nil, bump: nil, displacement: nil, emissive: nil, map: nil, normal: nil}

    def texture_fixture(attrs \\ %{}) do
      {:ok, texture} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Bodies.create_texture()

      texture
    end

    test "list_textures/0 returns all textures" do
      texture = texture_fixture()
      assert Bodies.list_textures() == [texture]
    end

    test "get_texture!/1 returns the texture with given id" do
      texture = texture_fixture()
      assert Bodies.get_texture!(texture.id) == texture
    end

    test "create_texture/1 with valid data creates a texture" do
      assert {:ok, %Texture{} = texture} = Bodies.create_texture(@valid_attrs)
      assert texture.ambient_occlusion == "some ambient_occlusion"
      assert texture.bump == "some bump"
      assert texture.displacement == "some displacement"
      assert texture.emissive == "some emissive"
      assert texture.map == "some map"
      assert texture.normal == "some normal"
    end

    test "create_texture/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Bodies.create_texture(@invalid_attrs)
    end

    test "update_texture/2 with valid data updates the texture" do
      texture = texture_fixture()
      assert {:ok, texture} = Bodies.update_texture(texture, @update_attrs)
      assert %Texture{} = texture
      assert texture.ambient_occlusion == "some updated ambient_occlusion"
      assert texture.bump == "some updated bump"
      assert texture.displacement == "some updated displacement"
      assert texture.emissive == "some updated emissive"
      assert texture.map == "some updated map"
      assert texture.normal == "some updated normal"
    end

    test "update_texture/2 with invalid data returns error changeset" do
      texture = texture_fixture()
      assert {:error, %Ecto.Changeset{}} = Bodies.update_texture(texture, @invalid_attrs)
      assert texture == Bodies.get_texture!(texture.id)
    end

    test "delete_texture/1 deletes the texture" do
      texture = texture_fixture()
      assert {:ok, %Texture{}} = Bodies.delete_texture(texture)
      assert_raise Ecto.NoResultsError, fn -> Bodies.get_texture!(texture.id) end
    end

    test "change_texture/1 returns a texture changeset" do
      texture = texture_fixture()
      assert %Ecto.Changeset{} = Bodies.change_texture(texture)
    end
  end
end
