defmodule AstroPlaygroundWeb.BodyView do
  use AstroPlaygroundWeb, :view
  alias AstroPlaygroundWeb.BodyView

  def render("index.json", %{bodies: bodies}) do
    %{data: render_many(bodies, BodyView, "body.json")}
  end

  def render("show.json", %{body: body}) do
    %{data: render_one(body, BodyView, "body.json")}
  end

  def render("body.json", %{body: body}) do
    %{id: body.id,
      name: body.name,
      type: body.type,
      diameter: body.diameter}
  end
end
