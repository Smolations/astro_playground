defmodule AstroPlaygroundWeb.SpiceyController do
  use AstroPlaygroundWeb, :controller
  alias AstroPlayground.Spicey

  action_fallback AstroPlaygroundWeb.FallbackController


  def show(conn, %{"date" => date, "target" => target, "observer" => observer, "frame" => frame}) do
    {result, 0} = Spicey.get_state(date, target, observer, frame)
    {state, []} = Code.eval_string(result)
    render conn, "state.json", %{state: state}
  end

  def show(conn, %{"date" => date}) do
    {result, 0} = Spicey.str2et(date)
    et = %{given: date, et: String.trim(result)}
    render conn, "et.json", %{et: et}
  end
end
