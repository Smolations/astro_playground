defmodule AstroPlaygroundWeb.SpiceyView do
  use AstroPlaygroundWeb, :view
  alias AstroPlaygroundWeb.SpiceyView


  # def render("index.json", %{orbits: orbits}) do
  #   %{data: render_many(orbits, OrbitView, "orbit.json")}
  # end

  # def render("show_et.json", %{et: et}) do
  #   %{data: render_one(et, SpiceyView, "et.json")}
  # end

  def render("et.json", %{et: et}) do
    %{
      given: et.given,
      et: et.et,
    }
  end

  def render("state.json", %{state: state}) do
    # %{
    #   given: et.given,
    #   et: et.et,
    # }
    state
  end
end
