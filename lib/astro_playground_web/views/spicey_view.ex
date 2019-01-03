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

  def render("result.json", %{query: code, result: result}) do
    %{
      query: code,
      result: result,
    }
  end

  def render("size_and_shape.json", %{id: id, data: data}) do
    Map.put(data, :spice_id, id)
  end

  def render("state.json", %{state: state}) do
    state
  end
end
