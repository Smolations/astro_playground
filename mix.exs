defmodule AstroPlayground.MixProject do
  use Mix.Project

  def project do
    [
      app: :astro_playground,
      version: "0.0.1",
      elixir: "~> 1.15",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  # Configuration for the OTP application.
  def application do
    [
      mod: {AstroPlayground.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  defp deps do
    [
      {:phoenix, "~> 1.7.14"},
      {:phoenix_pubsub, "~> 2.1"},
      {:phoenix_ecto, "~> 4.6"},
      {:ecto_sql, "~> 3.12"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_html, "~> 4.1"},
      # Keep the existing *View modules (JSON + the SPA shell) rendering via
      # Phoenix.View instead of rewriting them to 1.7 JSON/Component modules.
      {:phoenix_view, "~> 2.0"},
      {:phoenix_live_reload, "~> 1.5", only: :dev},
      {:gettext, "~> 0.24"},
      {:jason, "~> 1.4"},
      {:bandit, "~> 1.5"},
      {:ecto_enum, "~> 1.4"},
      # Used by seeds to fetch NAIF kernels. Replaces the legacy `download`
      # package, whose httpoison/hackney/ssl_verify_fun chain won't build on
      # modern OTP.
      {:req, "~> 0.5"},
      # OpenAPI 3 spec + Swagger UI for the JSON API (issue #2).
      {:open_api_spex, "~> 3.21"}
    ]
  end

  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs", "astro.manifest"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
