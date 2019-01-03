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
    sys_cmd "size_and_shape", [Integer.to_string(id)]
  end

  def str2et(date) do
    sys_cmd "str2et", [date]
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
