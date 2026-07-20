defmodule AstroPlayground.Repo.Migrations.AddProvenanceToTextures do
  use Ecto.Migration
  alias AstroPlayground.EctoEnums.TextureFidelityEnum

  def up do
    TextureFidelityEnum.create_type()

    alter table(:textures) do
      # How faithful this texture is to real observations (see TextureFidelityEnum).
      add :fidelity, TextureFidelityEnum.type()
      # Provenance. `license`/`attribution` are not decoration: the Solar System
      # Scope textures are CC BY 4.0 and legally require credit wherever shown.
      add :source, :string
      add :source_url, :string
      add :license, :string
      add :attribution, :string
      # Native resolution of the fetched asset, e.g. "2048x1024".
      add :resolution, :string
    end
  end

  def down do
    alter table(:textures) do
      remove :fidelity
      remove :source
      remove :source_url
      remove :license
      remove :attribution
      remove :resolution
    end

    TextureFidelityEnum.drop_type()
  end
end
