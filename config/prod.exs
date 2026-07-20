import Config

# Static file caching: the digested manifest is produced by `mix phx.digest`
# after the frontend is built. Production runtime config (secrets, DB URL, host,
# port) belongs in config/runtime.exs — deferred until a prod deploy is in scope.
config :astro_playground, AstroPlaygroundWeb.Endpoint,
  cache_static_manifest: "priv/static/cache_manifest.json"

# Do not print debug messages in production
config :logger, level: :info
