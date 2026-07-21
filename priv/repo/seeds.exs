# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     AstroPlayground.Repo.insert!(%AstroPlayground.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
alias AstroPlayground.Repo
alias AstroPlayground.Orbits.Orbit
alias AstroPlayground.SpiceObjects.SpiceObject
alias AstroPlayground.Textures.Texture


defmodule Seeds.Tex do
  @moduledoc false
  # Texture seeding with provenance. `license`/`attribution` are load-bearing,
  # not decoration: the Solar System Scope textures are CC BY 4.0 and legally
  # require credit wherever they are shown. See BODIES.md and
  # tools/textures/manifest.py, which this must stay in sync with.
  alias AstroPlayground.Repo
  alias AstroPlayground.Textures.Texture

  @sss %{
    source: "Solar System Scope (via Wikimedia Commons)",
    source_url: "https://www.solarsystemscope.com/textures/",
    license: "CC BY 4.0",
    attribution: "Solar System Scope / INOVE",
    resolution: "2048x1024"
  }

  # Solar System Scope textures — Sun and gas/ice giants (no solid surface, so
  # synthetic), plus the inner planets and Moon.
  def sss(spice_object, fields),
    do: insert(spice_object, Map.merge(@sss, Map.new(fields)))

  # USGS Astrogeology equirectangular previews — public domain, mission-derived.
  def usgs(spice_object, mission, fields) do
    base = %{
      source: "USGS Astrogeology (Astropedia) — #{mission}",
      source_url: "https://astrogeology.usgs.gov/search",
      license: "Public Domain (USGS/NASA)",
      attribution: "NASA / USGS (#{mission})",
      resolution: "1024x512"
    }

    insert(spice_object, Map.merge(base, Map.new(fields)))
  end

  defp insert(spice_object, attrs),
    do: Repo.insert!(struct(Texture, Map.put(attrs, :spice_object, spice_object)))
end


# barycenters
sol_bc = Repo.insert! %SpiceObject{ name: "Solar System Barycenter",
  spice_id: 0,
  spice_name: "Solar System Barycenter",
  type: :barycenter }
mercury_bc = Repo.insert! %SpiceObject{ name: "Mercury Barycenter",
  spice_id: 1,
  spice_name: "Mercury Barycenter",
  type: :barycenter }
venus_bc = Repo.insert! %SpiceObject{ name: "Venus Barycenter",
  spice_id: 2,
  spice_name: "Venus Barycenter",
  type: :barycenter }
earth_bc = Repo.insert! %SpiceObject{ name: "Earth Barycenter",
  spice_id: 3,
  spice_name: "Earth-Moon Barycenter",
  type: :barycenter }
mars_bc = Repo.insert! %SpiceObject{ name: "Mars Barycenter",
  spice_id: 4,
  spice_name: "Mars Barycenter",
  type: :barycenter }
jupiter_bc = Repo.insert! %SpiceObject{ name: "Jupiter Barycenter",
  spice_id: 5,
  spice_name: "Jupiter Barycenter",
  type: :barycenter }
saturn_bc = Repo.insert! %SpiceObject{ name: "Saturn Barycenter",
  spice_id: 6,
  spice_name: "Saturn Barycenter",
  type: :barycenter }
uranus_bc = Repo.insert! %SpiceObject{ name: "Uranus Barycenter",
  spice_id: 7,
  spice_name: "Uranus Barycenter",
  type: :barycenter }
neptune_bc = Repo.insert! %SpiceObject{ name: "Neptune Barycenter",
  spice_id: 8,
  spice_name: "Neptune Barycenter",
  type: :barycenter }
pluto_bc = Repo.insert! %SpiceObject{ name: "Pluto Barycenter",
  spice_id: 9,
  spice_name: "Pluto Barycenter",
  type: :barycenter }

# stars
sol = Repo.insert! %SpiceObject{ name: "Sol",
  spice_id: 10,
  spice_name: "Sun",
  type: :star }

# planets
mercury = Repo.insert! %SpiceObject{ name: "Mercury",
  spice_id: 199,
  spice_name: "Mercury",
  type: :planet }
venus = Repo.insert! %SpiceObject{ name: "Venus",
  spice_id: 299,
  spice_name: "Venus",
  type: :planet }
earth = Repo.insert! %SpiceObject{ name: "Earth",
  spice_id: 399,
  spice_name: "Earth",
  type: :planet }
mars = Repo.insert! %SpiceObject{ name: "Mars",
  spice_id: 499,
  spice_name: "Mars",
  type: :planet }
jupiter = Repo.insert! %SpiceObject{ name: "Jupiter",
  spice_id: 599,
  spice_name: "Jupiter",
  type: :planet }
saturn = Repo.insert! %SpiceObject{ name: "Saturn",
  spice_id: 699,
  spice_name: "Saturn",
  type: :planet }
uranus = Repo.insert! %SpiceObject{ name: "Uranus",
  spice_id: 799,
  spice_name: "Uranus",
  type: :planet }
neptune = Repo.insert! %SpiceObject{ name: "Neptune",
  spice_id: 899,
  spice_name: "Neptune",
  type: :planet }
pluto = Repo.insert! %SpiceObject{ name: "Pluto",
  spice_id: 999,
  spice_name: "Pluto",
  type: :dwarf_planet }

# moons (aka satellites)
# // earth
luna = Repo.insert! %SpiceObject{ name: "Luna",
  spice_id: 301,
  spice_name: "Moon",
  type: :satellite }

# // mars
phobos = Repo.insert! %SpiceObject{ name: "Phobos",
  spice_id: 401,
  spice_name: "Phobos",
  type: :satellite }
deimos = Repo.insert! %SpiceObject{ name: "Deimos",
  spice_id: 402,
  spice_name: "Deimos",
  type: :satellite }

# // jupiter
io = Repo.insert! %SpiceObject{ name: "Io",
  spice_id: 501,
  spice_name: "Io",
  type: :satellite }
europa = Repo.insert! %SpiceObject{ name: "Europa",
  spice_id: 502,
  spice_name: "Europa",
  type: :satellite }
ganymede = Repo.insert! %SpiceObject{ name: "Ganymede",
  spice_id: 503,
  spice_name: "Ganymede",
  type: :satellite }
callisto = Repo.insert! %SpiceObject{ name: "Callisto",
  spice_id: 504,
  spice_name: "Callisto",
  type: :satellite }
amalthea = Repo.insert! %SpiceObject{ name: "Amalthea",
  spice_id: 505,
  spice_name: "Amalthea",
  type: :satellite }
thebe = Repo.insert! %SpiceObject{ name: "Thebe",
  spice_id: 514,
  spice_name: "Thebe",
  type: :satellite }
adrastea = Repo.insert! %SpiceObject{ name: "Adrastea",
  spice_id: 515,
  spice_name: "Adrastea",
  type: :satellite }
metis = Repo.insert! %SpiceObject{ name: "Metis",
  spice_id: 516,
  spice_name: "Metis",
  type: :satellite }

# // saturn — the 14 named moons carried by sat427.bsp (9 majors + 5 co-orbitals).
# The ring/inner shepherds (janus, epimetheus, atlas, prometheus, pandora, pan,
# daphnis, pallene, anthe, aegaeon) are NOT in sat427 — they need a separate
# kernel, so they stay unseeded for now.
mimas = Repo.insert! %SpiceObject{ name: "Mimas",
  spice_id: 601,
  spice_name: "Mimas",
  type: :satellite }
enceladus = Repo.insert! %SpiceObject{ name: "Enceladus",
  spice_id: 602,
  spice_name: "Enceladus",
  type: :satellite }
tethys = Repo.insert! %SpiceObject{ name: "Tethys",
  spice_id: 603,
  spice_name: "Tethys",
  type: :satellite }
dione = Repo.insert! %SpiceObject{ name: "Dione",
  spice_id: 604,
  spice_name: "Dione",
  type: :satellite }
rhea = Repo.insert! %SpiceObject{ name: "Rhea",
  spice_id: 605,
  spice_name: "Rhea",
  type: :satellite }
titan = Repo.insert! %SpiceObject{ name: "Titan",
  spice_id: 606,
  spice_name: "Titan",
  type: :satellite }
hyperion = Repo.insert! %SpiceObject{ name: "Hyperion",
  spice_id: 607,
  spice_name: "Hyperion",
  type: :satellite }
iapetus = Repo.insert! %SpiceObject{ name: "Iapetus",
  spice_id: 608,
  spice_name: "Iapetus",
  type: :satellite }
phoebe = Repo.insert! %SpiceObject{ name: "Phoebe",
  spice_id: 609,
  spice_name: "Phoebe",
  type: :satellite }
helene = Repo.insert! %SpiceObject{ name: "Helene",
  spice_id: 612,
  spice_name: "Helene",
  type: :satellite }
telesto = Repo.insert! %SpiceObject{ name: "Telesto",
  spice_id: 613,
  spice_name: "Telesto",
  type: :satellite }
calypso = Repo.insert! %SpiceObject{ name: "Calypso",
  spice_id: 614,
  spice_name: "Calypso",
  type: :satellite }
methone = Repo.insert! %SpiceObject{ name: "Methone",
  spice_id: 632,
  spice_name: "Methone",
  type: :satellite }
polydeuces = Repo.insert! %SpiceObject{ name: "Polydeuces",
  spice_id: 634,
  spice_name: "Polydeuces",
  type: :satellite }

# // uranus
ariel = Repo.insert! %SpiceObject{ name: "Ariel",
  spice_id: 701,
  spice_name: "Ariel",
  type: :satellite }
umbriel = Repo.insert! %SpiceObject{ name: "Umbriel",
  spice_id: 702,
  spice_name: "Umbriel",
  type: :satellite }
titania = Repo.insert! %SpiceObject{ name: "Titania",
  spice_id: 703,
  spice_name: "Titania",
  type: :satellite }
oberon = Repo.insert! %SpiceObject{ name: "Oberon",
  spice_id: 704,
  spice_name: "Oberon",
  type: :satellite }
miranda = Repo.insert! %SpiceObject{ name: "Miranda",
  spice_id: 705,
  spice_name: "Miranda",
  type: :satellite }

# // neptune
triton = Repo.insert! %SpiceObject{ name: "Triton",
  spice_id: 801,
  spice_name: "Triton",
  type: :satellite }
nereid = Repo.insert! %SpiceObject{ name: "Nereid",
  spice_id: 802,
  spice_name: "Nereid",
  type: :satellite }

# // pluto
charon = Repo.insert! %SpiceObject{ name: "Charon",
  spice_id: 901,
  spice_name: "Charon",
  type: :satellite }
nix = Repo.insert! %SpiceObject{ name: "Nix",
  spice_id: 902,
  spice_name: "Nix",
  type: :satellite }
hydra = Repo.insert! %SpiceObject{ name: "Hydra",
  spice_id: 903,
  spice_name: "Hydra",
  type: :satellite }
kerberos = Repo.insert! %SpiceObject{ name: "Kerberos",
  spice_id: 904,
  spice_name: "Kerberos",
  type: :satellite }
styx = Repo.insert! %SpiceObject{ name: "Styx",
  spice_id: 905,
  spice_name: "Styx",
  type: :satellite }

# _ = Repo.insert! %SpiceObject{ name: "",
#   spice_id: 9,
#   spice_name: "",
#   type: "" }



# textures — sourced by tools/textures/fetch.py; see BODIES.md for rationale.
# fidelity: :real (imagery-derived global mosaic) | :partial (hemisphere-only or
# interpolated fill) | :synthetic (artistic composite; no solid surface to map).

# Sun + gas/ice giants: no surface exists to map, so these are composites.
Seeds.Tex.sss(sol,     map: "sun_2k_color.jpg",     fidelity: :synthetic)
Seeds.Tex.sss(jupiter, map: "jupiter_2k_color.jpg", fidelity: :synthetic)
Seeds.Tex.sss(saturn,  map: "saturn_2k_color.jpg",  fidelity: :synthetic)
Seeds.Tex.sss(uranus,  map: "uranus_2k_color.jpg",  fidelity: :synthetic)
Seeds.Tex.sss(neptune, map: "neptune_2k_color.jpg", fidelity: :synthetic)

# Inner planets + Moon (Solar System Scope, NASA-derived).
Seeds.Tex.sss(mercury, map: "mercury_2k_color.jpg", fidelity: :real)
# Venus is Magellan radar backscatter, not visible-light albedo (cloud-hidden).
Seeds.Tex.sss(venus,   map: "venus_2k_color.jpg",   fidelity: :real)
Seeds.Tex.sss(earth,   map: "earth_daymap_2k_color.jpg", normal: "earth_2k_normal.png", fidelity: :real)
Seeds.Tex.sss(luna,    map: "moon_2k_color.jpg",    fidelity: :real)
Seeds.Tex.sss(mars,    map: "mars_2k_color.jpg",    fidelity: :real)

# Phobos + Jovian moons (USGS mission mosaics).
Seeds.Tex.usgs(phobos,   "Mars Express SRC",      map: "phobos_1440x720_gray.jpg", fidelity: :real)
Seeds.Tex.usgs(io,       "Galileo SSI",           map: "io_2k_color.jpg",           fidelity: :real)
Seeds.Tex.usgs(europa,   "Voyager / Galileo SSI", map: "europa_2k_color.jpg",       fidelity: :real)
Seeds.Tex.usgs(ganymede, "Voyager / Galileo SSI", map: "ganymede_1024x512_color.jpg", fidelity: :real)
Seeds.Tex.usgs(callisto, "Voyager / Galileo SSI", map: "callisto_1800x900_color.jpg", fidelity: :real)

# Pluto system (New Horizons, 2015 — encounter hemisphere only).
Seeds.Tex.usgs(pluto,  "New Horizons LORRI/MVIC", map: "pluto_1k_grayscale.jpg", fidelity: :partial)
# Charon is the one added body with a real derived normal map (from its DEM).
Seeds.Tex.usgs(charon, "New Horizons LORRI/MVIC", map: "charon_1k_color.jpg", normal: "charon_1k_normal.png", fidelity: :partial)

# Triton (Voyager 2, 1989) — "GlobalFill": gaps interpolated from neighbours.
Seeds.Tex.usgs(triton, "Voyager 2", map: "triton_1k_color.jpg", fidelity: :partial)

# Deimos and Amalthea previously referenced textures we can no longer source
# (no global USGS mosaic exists; see UNOBTAINABLE in tools/textures/manifest.py).
# They render as bland spheres until a source is found, rather than pointing at
# files that will 404.





# orbits
Repo.insert! %Orbit{ barycenter: sol_bc, orbiting: sol,
}
Repo.insert! %Orbit{ barycenter: sol_bc, orbiting: mercury,
}
Repo.insert! %Orbit{ barycenter: sol_bc, orbiting: venus,
}
Repo.insert! %Orbit{ barycenter: sol_bc, orbiting: earth,
}
Repo.insert! %Orbit{ barycenter: sol_bc, orbiting: mars,
}
Repo.insert! %Orbit{ barycenter: sol_bc, orbiting: jupiter,
}
Repo.insert! %Orbit{ barycenter: sol_bc, orbiting: saturn,
}
Repo.insert! %Orbit{ barycenter: sol_bc, orbiting: uranus,
}
Repo.insert! %Orbit{ barycenter: sol_bc, orbiting: neptune,
}
Repo.insert! %Orbit{ barycenter: sol_bc, orbiting: pluto,
}


Repo.insert! %Orbit{ barycenter: mercury_bc, orbiting: mercury,
}

Repo.insert! %Orbit{ barycenter: venus_bc, orbiting: venus,
}

Repo.insert! %Orbit{ barycenter: earth_bc, orbiting: earth,
}
Repo.insert! %Orbit{ barycenter: earth_bc, orbiting: luna,
}

Repo.insert! %Orbit{ barycenter: mars_bc, orbiting: mars,
}
Repo.insert! %Orbit{ barycenter: mars_bc, orbiting: phobos,
}
Repo.insert! %Orbit{ barycenter: mars_bc, orbiting: deimos,
}

Repo.insert! %Orbit{ barycenter: jupiter_bc, orbiting: jupiter,
}
Repo.insert! %Orbit{ barycenter: jupiter_bc, orbiting: io,
}
Repo.insert! %Orbit{ barycenter: jupiter_bc, orbiting: europa,
}
Repo.insert! %Orbit{ barycenter: jupiter_bc, orbiting: ganymede,
}
Repo.insert! %Orbit{ barycenter: jupiter_bc, orbiting: callisto,
}
Repo.insert! %Orbit{ barycenter: jupiter_bc, orbiting: amalthea,
}
Repo.insert! %Orbit{ barycenter: jupiter_bc, orbiting: thebe,
}
Repo.insert! %Orbit{ barycenter: jupiter_bc, orbiting: adrastea,
}
Repo.insert! %Orbit{ barycenter: jupiter_bc, orbiting: metis,
}

Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: saturn,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: mimas,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: enceladus,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: tethys,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: dione,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: rhea,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: titan,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: hyperion,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: iapetus,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: phoebe,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: helene,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: telesto,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: calypso,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: methone,
}
Repo.insert! %Orbit{ barycenter: saturn_bc, orbiting: polydeuces,
}

Repo.insert! %Orbit{ barycenter: uranus_bc, orbiting: uranus,
}
Repo.insert! %Orbit{ barycenter: uranus_bc, orbiting: ariel,
}
Repo.insert! %Orbit{ barycenter: uranus_bc, orbiting: umbriel,
}
Repo.insert! %Orbit{ barycenter: uranus_bc, orbiting: titania,
}
Repo.insert! %Orbit{ barycenter: uranus_bc, orbiting: oberon,
}
Repo.insert! %Orbit{ barycenter: uranus_bc, orbiting: miranda,
}

Repo.insert! %Orbit{ barycenter: neptune_bc, orbiting: neptune,
}
Repo.insert! %Orbit{ barycenter: neptune_bc, orbiting: triton,
}
Repo.insert! %Orbit{ barycenter: neptune_bc, orbiting: nereid,
}

Repo.insert! %Orbit{ barycenter: pluto_bc, orbiting: pluto,
}
Repo.insert! %Orbit{ barycenter: pluto_bc, orbiting: charon,
}
Repo.insert! %Orbit{ barycenter: pluto_bc, orbiting: nix,
}
Repo.insert! %Orbit{ barycenter: pluto_bc, orbiting: hydra,
}
Repo.insert! %Orbit{ barycenter: pluto_bc, orbiting: kerberos,
}
Repo.insert! %Orbit{ barycenter: pluto_bc, orbiting: styx,
}




# NAIF kernel download is owned by AstroPlayground.Kernels (single source of
# truth for the file manifest). It runs an availability preflight first and
# aborts with guidance if a required kernel URL has moved — see also
# `mix astro.preflight` and `mix astro.doctor`.
AstroPlayground.Kernels.fetch()
