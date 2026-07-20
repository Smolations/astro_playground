defmodule AstroPlaygroundWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :astro_playground

  # The session will be stored in the cookie and signed, so its contents can be
  # read but not tampered with. Set :encryption_salt to also encrypt it.
  @session_options [
    store: :cookie,
    key: "_astro_playground_key",
    signing_salt: "fan+1EyE",
    same_site: "Lax"
  ]

  # Serve static files from "priv/static". Vite writes the SPA bundle here.
  plug Plug.Static,
    at: "/",
    from: :astro_playground,
    gzip: false,
    only: ~w(assets css fonts images js favicon.ico robots.txt)

  # Code reloading can be explicitly enabled under the :code_reloader
  # configuration of your endpoint.
  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
  end

  plug Plug.RequestId
  plug Plug.Logger

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Jason

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug AstroPlaygroundWeb.Router
end
