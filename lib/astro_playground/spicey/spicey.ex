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

  def str2et(date) do
    sys_cmd "str2et", [date]
  end


  defp sys_cmd(script_name, _params \\ []) do
    System.cmd(@cmd,
      [@script_path <> script_name <> ".py" | _params],
      stderr_to_stdout: true
    )
  end
end
