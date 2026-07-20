defmodule AstroPlayground.Repo do
  use Ecto.Repo,
    otp_app: :astro_playground,
    adapter: Ecto.Adapters.Postgres
end
