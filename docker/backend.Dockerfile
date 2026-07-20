# Backend runtime: Elixir/Erlang + Python (for SPICE via spiceypy).
#
# Node is intentionally ABSENT. The frontend builds on the host via mise and
# this container only serves the compiled assets from priv/static. This is the
# hybrid dev stack: host node (mise) + containerized Elixir/Postgres, chosen to
# avoid a host C toolchain.
#
# NOTE: booting a Phoenix server from this image requires the Phoenix 1.3 -> 1.7
# dependency upgrade (next Phase 1b step). The image itself is upgrade-agnostic:
# it provides the runtime; mix.exs decides the framework versions.
FROM elixir:1.18-otp-27

# The Spicey module shells out to `python3` (System.cmd). spiceypy ships prebuilt
# CSPICE wheels for linux/x86_64, so no native SPICE build is needed here.
# python3 + spiceypy for SPICE; inotify-tools for Phoenix live-reload file watching.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 python3-pip inotify-tools \
 && rm -rf /var/lib/apt/lists/* \
 && pip3 install --no-cache-dir --break-system-packages spiceypy

RUN mix local.hex --force && mix local.rebar --force

WORKDIR /app
EXPOSE 4000

# For dev, deps fetch / db setup / server are driven from docker-compose.
CMD ["mix", "phx.server"]
