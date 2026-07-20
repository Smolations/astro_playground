import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :astro_playground, AstroPlaygroundWeb.Endpoint,
  http: [ip: {0, 0, 0, 0}, port: 4001],
  secret_key_base: "Q7HOAUenon+hzoc2e9WuNgSrZRFvZ9fFL5ADyicAvn14g7rEKLb7hhcq+MZORdgi",
  server: false

# Configure your database
config :astro_playground, AstroPlayground.Repo,
  username: "postgres",
  password: "postgres",
  database: "astro_playground_test#{System.get_env("MIX_TEST_PARTITION")}",
  hostname: System.get_env("DATABASE_HOST") || "localhost",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
