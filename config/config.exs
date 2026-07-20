# This file is responsible for configuring your application
# and its dependencies. It is loaded before any dependency and
# is restricted to this project.
import Config

# General application configuration
config :astro_playground,
  ecto_repos: [AstroPlayground.Repo]

# Configures the endpoint
config :astro_playground, AstroPlaygroundWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  secret_key_base: "Q7HOAUenon+hzoc2e9WuNgSrZRFvZ9fFL5ADyicAvn14g7rEKLb7hhcq+MZORdgi",
  render_errors: [
    formats: [json: AstroPlaygroundWeb.ErrorView, html: AstroPlaygroundWeb.ErrorView],
    layout: false
  ],
  pubsub_server: AstroPlayground.PubSub

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
