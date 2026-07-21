defmodule AstroPlaygroundWeb.Schemas do
  @moduledoc """
  OpenAPI schema definitions for the JSON API (issue #2).

  Each nested module is an `OpenApiSpex.Schema` describing a request or response
  body. Controllers reference these from their `operation` specs; the SwaggerUI
  at `/api/docs` renders them and drives live "Try it out" requests.

  Some endpoints pass SPICE/Python output through with minimal shaping
  (`orientation`, `get_state`); those are typed loosely on purpose, with the
  known fields documented and additional properties allowed.
  """

  defmodule Texture do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema

    OpenApiSpex.schema(%{
      title: "Texture",
      description: "A surface map plus its provenance. Non-map columns are null when unused.",
      type: :object,
      properties: %{
        id: %Schema{type: :integer},
        spice_object_id: %Schema{type: :integer},
        map: %Schema{type: :string, nullable: true, description: "Colour map filename under /images", example: "titan_1k_grayscale.jpg"},
        normal: %Schema{type: :string, nullable: true},
        bump: %Schema{type: :string, nullable: true},
        displacement: %Schema{type: :string, nullable: true},
        emissive: %Schema{type: :string, nullable: true},
        ambient_occlusion: %Schema{type: :string, nullable: true},
        fidelity: %Schema{type: :string, enum: ["real", "partial", "synthetic"], description: "How faithful the map is to the real body"},
        source: %Schema{type: :string, nullable: true},
        source_url: %Schema{type: :string, nullable: true},
        license: %Schema{type: :string, nullable: true},
        attribution: %Schema{type: :string, nullable: true},
        resolution: %Schema{type: :string, nullable: true, example: "2048x1024"}
      }
    })
  end

  defmodule SpiceObject do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema

    OpenApiSpex.schema(%{
      title: "SpiceObject",
      description: "A solar-system body or barycenter.",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Database id (used in routes)", example: 37},
        name: %Schema{type: :string, example: "Titan"},
        type: %Schema{type: :string, enum: ["star", "planet", "dwarf_planet", "satellite", "barycenter"]},
        spice_id: %Schema{type: :integer, description: "NAIF SPICE id", example: 606},
        spice_name: %Schema{type: :string, example: "Titan"},
        texture: %Schema{type: :object, nullable: true, description: "The body's texture, or null. See Texture."}
      }
    })
  end

  defmodule ObjectsResponse do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema
    alias AstroPlaygroundWeb.Schemas.SpiceObject

    OpenApiSpex.schema(%{
      title: "ObjectsResponse",
      type: :object,
      properties: %{data: %Schema{type: :array, items: SpiceObject}},
      required: [:data]
    })
  end

  defmodule ObjectResponse do
    @moduledoc false
    require OpenApiSpex
    alias AstroPlaygroundWeb.Schemas.SpiceObject

    OpenApiSpex.schema(%{
      title: "ObjectResponse",
      type: :object,
      properties: %{data: SpiceObject},
      required: [:data]
    })
  end

  defmodule TexturesResponse do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema
    alias AstroPlaygroundWeb.Schemas.Texture

    OpenApiSpex.schema(%{
      title: "TexturesResponse",
      type: :object,
      properties: %{data: %Schema{type: :array, items: Texture}},
      required: [:data]
    })
  end

  defmodule Orbiting do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema
    alias AstroPlaygroundWeb.Schemas.SpiceObject

    OpenApiSpex.schema(%{
      title: "Orbiting",
      description: "An orbit edge with the orbiting body expanded.",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Orbit id"},
        barycenter_id: %Schema{type: :integer},
        orbiting: SpiceObject
      }
    })
  end

  defmodule OrbitingResponse do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema
    alias AstroPlaygroundWeb.Schemas.Orbiting

    OpenApiSpex.schema(%{
      title: "OrbitingResponse",
      type: :object,
      properties: %{data: %Schema{type: :array, items: Orbiting}},
      required: [:data]
    })
  end

  defmodule SizeAndShape do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema

    OpenApiSpex.schema(%{
      title: "SizeAndShape",
      description: "Radii (km) and gravitational parameter for a body. radii_measured is false when RADII were missing and a nominal placeholder was used; mu is 0 when GM is unknown.",
      type: :object,
      properties: %{
        spice_id: %Schema{type: :integer, example: 606},
        equatorial_radius_large: %Schema{type: :number, description: "km"},
        equatorial_radius_small: %Schema{type: :number, description: "km"},
        polar_radius: %Schema{type: :number, description: "km"},
        mu: %Schema{type: :number, description: "GM, km^3/s^2 (0 if unknown)"},
        radii_measured: %Schema{type: :boolean}
      },
      additionalProperties: true
    })
  end

  defmodule Orientation do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema

    OpenApiSpex.schema(%{
      title: "Orientation",
      description: "Real body orientation (spin axis / prime meridian / rotation) at the default epoch in ECLIPJ2000, computed from SPICE. Fields pass through from the Python layer; additional properties may appear.",
      type: :object,
      additionalProperties: true
    })
  end

  defmodule TrajectoryRequest do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema

    OpenApiSpex.schema(%{
      title: "TrajectoryRequest",
      description: "Sample a body's trajectory relative to an observer over a time window. Use a barycenter as observer for physically correct orbits.",
      type: :object,
      required: [:observer, :target, :start, :stop],
      properties: %{
        observer: %Schema{type: :string, description: "Observing body/barycenter (NAIF id or name)", example: "6"},
        target: %Schema{type: :string, description: "Orbiting body (NAIF id or name)", example: "606"},
        start: %Schema{type: :string, description: "UTC start", example: "2026-01-01T00:00:00"},
        stop: %Schema{type: :string, description: "UTC stop", example: "2026-02-10T00:00:00"},
        steps: %Schema{type: :integer, default: 200, description: "Number of samples"},
        frame: %Schema{type: :string, default: "ECLIPJ2000", description: "Reference frame"},
        close: %Schema{type: :boolean, default: true, description: "Trim to exactly one revolution for a clean loop"}
      }
    })
  end

  defmodule Sample do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema

    OpenApiSpex.schema(%{
      title: "Sample",
      description: "A state vector: position (km) and velocity (km/s) at an ephemeris time.",
      type: :object,
      properties: %{
        et: %Schema{type: :number}, x: %Schema{type: :number}, y: %Schema{type: :number}, z: %Schema{type: :number},
        vx: %Schema{type: :number}, vy: %Schema{type: :number}, vz: %Schema{type: :number}
      }
    })
  end

  defmodule TrajectoryResponse do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema
    alias AstroPlaygroundWeb.Schemas.Sample

    OpenApiSpex.schema(%{
      title: "TrajectoryResponse",
      type: :object,
      properties: %{
        observer: %Schema{type: :string},
        target: %Schema{type: :string},
        frame: %Schema{type: :string},
        abcorr: %Schema{type: :string},
        units: %Schema{type: :object, additionalProperties: true},
        count: %Schema{type: :integer},
        samples: %Schema{type: :array, items: Sample}
      }
    })
  end

  defmodule GetStateRequest do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema

    OpenApiSpex.schema(%{
      title: "GetStateRequest",
      description: "State vector of target relative to observer at a single instant. (Sending only `date` instead returns the ephemeris time for that UTC.)",
      type: :object,
      required: [:date],
      properties: %{
        date: %Schema{type: :string, example: "2026-01-01T00:00:00"},
        target: %Schema{type: :string, example: "606"},
        observer: %Schema{type: :string, example: "6"},
        frame: %Schema{type: :string, example: "ECLIPJ2000"}
      }
    })
  end

  defmodule IdentifyResponse do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema

    OpenApiSpex.schema(%{
      title: "IdentifyResponse",
      type: :object,
      properties: %{
        query: %Schema{type: :string},
        result: %Schema{nullable: true, description: "Resolved name or NAIF code; null if not found"}
      }
    })
  end

  defmodule HomeManifest do
    @moduledoc false
    require OpenApiSpex
    alias OpenApiSpex.Schema

    OpenApiSpex.schema(%{
      title: "HomeManifest",
      description: "Precomputed grouping + renderability for the home page (see `mix astro.manifest`). Systems are grouped by barycenter; status is ok/lone/empty.",
      type: :object,
      properties: %{
        epoch: %Schema{type: :string},
        systems: %Schema{type: :array, items: %Schema{type: :object, additionalProperties: true}},
        ungrouped: %Schema{type: :array, items: %Schema{type: :object, additionalProperties: true}}
      },
      additionalProperties: true
    })
  end
end
