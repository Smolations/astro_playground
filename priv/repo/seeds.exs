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

# // saturn
# mimas
# enceladus
# tethys
# dione
# rhea
# titan
# hyperion
# iapetus
# phoebe
# janus
# epimetheus
# helene
# telesto
# calypso
# atlas
# prometheus
# pandora
# pan
# methone
# pallene
# polydeuces
# daphnis
# anthe
# aegaeon
# _ = Repo.insert! %SpiceObject{ name: "",
#   spice_id: 9,
#   spice_name: "",
#   type: "" }

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




defmodule NaifFiles do

  @files [
    "fk/planets/aareadme.txt",
    # "fk/planets/earth_assoc_itrf93.tf",
    "fk/satellites/aareadme.txt",
    # "fk/satellites/moon_080317.tf",
    # "fk/satellites/moon_assoc_me.tf",
    # "fk/satellites/moon_assoc_pa.tf",
    # "fk/stations/dss_17_prelim_itrf93_161110.tf",
    # "fk/stations/dss_35_36_prelim_itrf93_140620.tf",
    # "fk/stations/earth_topo_050714.tf",
    # "fk/stations/ndosl_140530_v01.tf",

    "lsk/aareadme.txt",
    "lsk/naif0012.tls",

    # "pck/Gravity.tpc",
    "pck/aareadme.txt",
    # "pck/de-403-masses.tpc",
    # "pck/earth_000101_190227_181206.bpc",
    # "pck/earth_070425_370426_predict.bpc",
    # "pck/earth_720101_070426.bpc",
    # "pck/earth_fixed.tf",
    # "pck/earth_latest_high_prec.bpc",
    # "pck/geophysical.ker",
    "pck/gm_de431.tpc",
    # "pck/moon_pa_de403_1950-2198.bpc",
    # "pck/moon_pa_de418_1950-2050.bpc",
    # "pck/moon_pa_de421_1900-2050.bpc",
    "pck/pck00010.tpc",

    # "spk/asteroids/AAREADME_Asteroids_SPKs.txt",
    # "spk/asteroids/aa_spk_production_dates_by-alpha.txt",
    # "spk/asteroids/aa_spk_production_dates_by-date.txt",
    # "spk/asteroids/aa_summaries.txt",
    # "spk/asteroids/codes_300ast_20100725.bsp",
    "spk/asteroids/codes_300ast_20100725.cmt",
    "spk/asteroids/codes_300ast_20100725.tf",
    # "spk/comets/C_G_1000012_2012_2017.bsp",
    # "spk/comets/aa_summaries.txt",
    # "spk/comets/c2013a1_s105_merged.bsp",
    # "spk/comets/ison.bsp",
    # "spk/comets/ison.lbl",
    # "spk/comets/siding_spring.lbl",
    # "spk/comets/siding_spring_8-19-14.bsp",
    # "spk/comets/siding_spring_s46.bsp",
    # "spk/lagrange_point/AAREADME_Lagrange_point_SPKs.txt",
    # "spk/lagrange_point/L1_de431.bsp",
    # "spk/lagrange_point/L2_de431.bsp",
    # "spk/lagrange_point/L4_de431.bsp",
    # "spk/lagrange_point/L5_de431.bsp",
    # "spk/lagrange_point/aa_spk_production_dates_by-alpha.txt",
    # "spk/lagrange_point/aa_spk_production_dates_by-date.txt",
    # "spk/lagrange_point/aa_summaries.txt",
    "spk/planets/aa_summaries_by_alpha.txt",
    "spk/planets/aa_summaries_by_date.txt",
    "spk/planets/aa_summaries.txt",
    "spk/planets/aareadme_de430-de431.txt",
    "spk/planets/aareadme_de432s.txt",
    "spk/planets/de432_tech-comments.txt",
    "spk/planets/de432s.bsp",
    "spk/satellites/AAREADME_Satellite_SPKs",
    "spk/satellites/aa_summaries_by_alpha.txt",
    "spk/satellites/aa_summaries.txt",
    "spk/satellites/aa_summaries_by_date.txt",
    # Satellite ephemerides loaded by the meta-kernel. The 2018 filenames
    # (jup310, mar097, plu055, ...) were superseded on the NAIF server.
    "spk/satellites/jup365.bsp",   # Jupiter: Galilean + inner moons
    "spk/satellites/mar099s.bsp",  # Mars: Phobos, Deimos
    "spk/satellites/plu060.bsp",   # Pluto: Charon, Nix, Hydra, Kerberos, Styx
    "spk/satellites/nep097.bsp",   # Neptune: Triton
    # ura111.bsp lives in a_old_versions/ — the current ura116xl.bsp holds only
    # the minor irregular moons (716-724), not the five majors (701-705). The
    # xl per-moon kernels are multi-GB; ura111 (majors + Puck, 1899-2100) is 162M.
    "spk/satellites/a_old_versions/ura111.bsp",  # Uranus: Ariel, Umbriel, Titania, Oberon, Miranda, Puck
    "spk/satellites/nep105.bsp",   # Neptune: Nereid (nep097 has only Triton)
    # "spk/stations/aa_spk_production_dates_by-alpha.txt",
    # "spk/stations/aa_spk_production_dates_by-date.txt",
    # "spk/stations/aa_summaries.txt",
    # "spk/stations/dss_17_prelim_itrf93_161110.bsp",
    # "spk/stations/dss_35_36_prelim_itrf93_140620.bsp",
    # "spk/stations/earthstns_fx_050714.bsp",
    # "spk/stations/earthstns_itrf93_050714.bsp",
    # "spk/stations/ndosl_140530_v01.bsp",
  ]


  def fetch() do
    Enum.map(@files, &get_file(&1))
  end

  def get_file(file) do
    url_root = "https://naif.jpl.nasa.gov/pub/naif/generic_kernels"
    dest = Path.join([File.cwd!(), "priv/kernels", file])

    if File.exists?(dest) do
      IO.puts "exists:  " <> dest
    else
      File.mkdir_p!(Path.dirname(dest))

      case Req.get(url_root <> "/" <> file,
             into: File.stream!(dest),
             receive_timeout: 600_000) do
        {:ok, %{status: 200}} ->
          IO.puts "downloaded:  " <> dest

        {:ok, %{status: status}} ->
          File.rm(dest)
          IO.puts "ERROR:   HTTP #{status} for " <> dest

        {:error, reason} ->
          File.rm(dest)
          IO.puts "ERROR:   Download failed for " <> dest
          IO.inspect reason
      end
    end
  end

end

IO.puts "\nDownloading NAIF files..."
NaifFiles.fetch
