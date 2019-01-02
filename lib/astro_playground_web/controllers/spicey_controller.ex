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

  def identify_code(conn, %{"code" => code}) do
    result = Spicey.name_from_code(code)
    render conn, "result.json", %{query: code, result: result}
  end

  def identify_name(conn, %{"name" => name}) do
    result = Spicey.code_from_name(name)
    render conn, "result.json", %{query: name, result: result}
  end
end
