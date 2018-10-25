# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :phoenix_react_playground,
  ecto_repos: [PhoenixReactPlayground.Repo]

# Configures the endpoint
config :phoenix_react_playground, PhoenixReactPlaygroundWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "Q7HOAUenon+hzoc2e9WuNgSrZRFvZ9fFL5ADyicAvn14g7rEKLb7hhcq+MZORdgi",
  render_errors: [view: PhoenixReactPlaygroundWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: PhoenixReactPlayground.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:user_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
