defmodule AstroPlayground.Application do
  use Application

  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec

    render_service_path = "assets/js/server.js"
    pool_size = 4


    # Define workers and child supervisors to be supervised
    children = [
      # Start the Ecto repository
      supervisor(AstroPlayground.Repo, []),
      # Start the endpoint when the application starts
      supervisor(AstroPlaygroundWeb.Endpoint, []),
      # Start your own worker by calling: AstroPlayground.Worker.start_link(arg1, arg2, arg3)
      # worker(AstroPlayground.Worker, [arg1, arg2, arg3]),

      supervisor(ReactRender, [[render_service_path: render_service_path, pool_size: 4]])
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: AstroPlayground.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    AstroPlaygroundWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
