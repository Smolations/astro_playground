defmodule AstroPlayground.Spicey do
  @cmd "python3"
  @script_path "priv/scripts/"

  # [, date, observer, target, frame] = args
  def get_state(date, observer, target, frame \\ "J2000") do
    # sys_cmd "get_state", [date, observer, target, "--frame " <> frame]
    sys_cmd "get_state", [date, observer, target]
  end

  def orbital_elements(date) do
    sys_cmd "orbital_elements", [date]
  end

  def size_and_shape(id) do
    # Clean invocation (stderr separate) so stdout is pure JSON.
    System.cmd(@cmd, [@script_path <> "size_and_shape.py", to_string(id)])
  end

  @doc """
  Real body orientation (spin axis, prime meridian, rotation rate) in the given
  frame. Returns `{json_string, 0}`; stderr is kept separate for clean JSON.
  """
  def orientation(id, date \\ "2026-01-01T00:00:00", frame \\ "ECLIPJ2000") do
    System.cmd(@cmd, [
      @script_path <> "orientation.py",
      to_string(id),
      "--date",
      date,
      "--frame",
      frame
    ])
  end

  def str2et(date) do
    sys_cmd "str2et", [date]
  end

  @doc """
  Samples the trajectory of `target` relative to `observer` (a barycenter, for
  physically correct orbits) over [start, stop]. Returns `{json_string, 0}`;
  stderr is kept separate so stdout is pure JSON for the caller to decode.
  """
  def trajectory(observer, target, start, stop, steps \\ 200, frame \\ "J2000", close \\ false) do
    args = [
      @script_path <> "trajectory.py",
      to_string(observer),
      to_string(target),
      start,
      stop,
      "--steps",
      to_string(steps),
      "--frame",
      frame
    ]

    args = if close, do: args ++ ["--close"], else: args
    System.cmd(@cmd, args)
  end

  def code_from_name(name) do
    {result, 0} = sys_cmd "code_from_name", [name]
    cond do
      Regex.match?(~r/^ERROR/, result) ->
        nil
      true ->
        {id, _} = Integer.parse(String.trim(result))
        id
    end
  end

  def name_from_code(code) do
    {result, 0} = sys_cmd "name_from_code", [code]
    if Regex.match?(~r/^ERROR/, result), do: nil, else: String.trim(result)
  end


  defp sys_cmd(script_name, _params \\ []) do
    System.cmd(@cmd,
      [@script_path <> script_name <> ".py" | _params],
      stderr_to_stdout: true
    )
  end
end
