defmodule AstroPlaygroundWeb.SpiceyController do
  use AstroPlaygroundWeb, :controller
  use OpenApiSpex.ControllerSpecs
  alias AstroPlayground.Spicey
  alias AstroPlayground.SpiceObjects
  alias AstroPlaygroundWeb.Schemas

  action_fallback AstroPlaygroundWeb.FallbackController

  tags ["SPICE"]

  operation :show,
    summary: "Get a state vector",
    description: "Position + velocity of `target` relative to `observer` at one instant. Sending only `date` instead returns the ephemeris time (ET) for that UTC.",
    request_body: {"State query", "application/json", Schemas.GetStateRequest},
    responses: [
      ok: {"State vector (or {given, et})", "application/json",
           %OpenApiSpex.Schema{title: "State", description: "Values from spkezr (shape passes through the SPICE layer), or {given, et} for a date-only query."}}
    ]

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

  operation :identify_code,
    summary: "Name for a NAIF code",
    parameters: [code: [in: :path, description: "NAIF SPICE id", type: :integer, required: true, example: 606]],
    responses: [ok: {"Result", "application/json", Schemas.IdentifyResponse}]

  def identify_code(conn, %{"code" => code}) do
    result = Spicey.name_from_code(code)
    render conn, "result.json", %{query: code, result: result}
  end

  operation :identify_name,
    summary: "NAIF code for a name",
    parameters: [name: [in: :path, description: "Body name", type: :string, required: true, example: "Titan"]],
    responses: [ok: {"Result", "application/json", Schemas.IdentifyResponse}]

  def identify_name(conn, %{"name" => name}) do
    result = Spicey.code_from_name(name)
    render conn, "result.json", %{query: name, result: result}
  end

  operation :get_size_and_shape,
    summary: "Radii + mu for a body",
    parameters: [spice_object_id: [in: :path, description: "Database id", type: :integer, required: true, example: 37]],
    responses: [ok: {"Size and shape", "application/json", Schemas.SizeAndShape}]

  def get_size_and_shape(conn, %{"spice_object_id" => spice_object_id}) do
    object = SpiceObjects.get_object!(spice_object_id)
    {result, 0} = Spicey.size_and_shape(object.spice_id)
    data = Jason.decode!(result)
    json(conn, Map.put(data, "spice_id", object.spice_id))
  end

  operation :get_orientation,
    summary: "Body orientation",
    description: "Spin axis / prime meridian / rotation at the default epoch, in ECLIPJ2000.",
    parameters: [spice_object_id: [in: :path, description: "Database id", type: :integer, required: true, example: 37]],
    responses: [ok: {"Orientation", "application/json", Schemas.Orientation}]

  def get_orientation(conn, %{"spice_object_id" => spice_object_id}) do
    object = SpiceObjects.get_object!(spice_object_id)
    {result, 0} = Spicey.orientation(object.spice_id)
    json(conn, Jason.decode!(result))
  end

  operation :trajectory,
    summary: "Sample a trajectory",
    description: "Stream a body's path relative to an observer over a time window. Use a barycenter as observer for physically correct orbits.",
    request_body: {"Trajectory window", "application/json", Schemas.TrajectoryRequest},
    responses: [ok: {"Trajectory samples", "application/json", Schemas.TrajectoryResponse}]

  def trajectory(conn, %{"observer" => observer, "target" => target, "start" => start, "stop" => stop} = params) do
    steps = Map.get(params, "steps", 200)
    # Default to the ecliptic plane (ECLIPJ2000) so orbit inclinations are
    # expressed relative to the ecliptic, the natural reference for a
    # solar-system view. SPICE performs the frame rotation internally.
    frame = Map.get(params, "frame", "ECLIPJ2000")
    # Trim to exactly one revolution by default so orbit paths are clean loops.
    close = Map.get(params, "close", true)
    {result, 0} = Spicey.trajectory(observer, target, start, stop, steps, frame, close)
    json(conn, Jason.decode!(result))
  end
end
