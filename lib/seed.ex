defmodule Mix.Tasks.AstroPlayground.Seed do
  use Mix.Task
  alias AstroPlayground.Repo
  import Ecto

  def run(_) do
    Mix.Task.run "app.start", []
    seed(Mix.env)
  end

  def seed(:dev) do
    # Any data for development goes here
    # i.e. Repo.insert!(%MyApp.User{}, %{ first_name: "Alex, last_name: "Garibay" })
  end

  def seed(:prod) do
    # Proceed with caution for production
  end
end
