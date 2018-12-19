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



# textures

Repo.insert! %Texture{ spice_object: sol,
  map: "sun_2k_color.jpg",
  # displacement: "sun_2k_displacement.jpg",
  # normal: "sun_2k_normal.jpg"
}

Repo.insert! %Texture{ spice_object: mercury,
  map: "mercury_2k_color.jpg",
  # displacement: "mercury_2k_displacement.jpg",
  # normal: "mercury_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: venus,
  map: "venus_2k_color.jpg",
  # displacement: "venus_2k_displacement.jpg",
  # normal: "venus_2k_normal.jpg"
}

Repo.insert! %Texture{ spice_object: earth,
  map: "earth_daymap_2k_color.jpg",
  # displacement: "earth_2k_displacement.jpg",
  # normal: "earth_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: luna,
  map: "moon_2k_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}

Repo.insert! %Texture{ spice_object: mars,
  map: "mars_2k_color.jpg",
  # displacement: "mars_2k_displacement.jpg",
  # normal: "mars_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: phobos,
  map: "phobos_1440x720_gray.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: deimos,
  map: "deimos_1440x720_gray.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}

Repo.insert! %Texture{ spice_object: jupiter,
  map: "jupiter_2k_color.jpg",
  # displacement: "jupiter_2k_displacement.jpg",
  # normal: "jupiter_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: io,
  map: "io_2k_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: europa,
  map: "europa_2k_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: ganymede,
  map: "ganymede_1024x512_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: callisto,
  map: "callisto_1800x900_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: amalthea,
  map: "amalthea_2k_gray.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}

Repo.insert! %Texture{ spice_object: saturn,
  map: "saturn_2k_color.jpg",
  # displacement: "saturn_2k_displacement.jpg",
  # normal: "saturn_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: uranus,
  map: "uranus_2k_color.jpg",
  # displacement: "uranus_2k_displacement.jpg",
  # normal: "uranus_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: neptune,
  map: "neptune_2k_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ spice_object: pluto,
  map: "pluto_1k_grayscale.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}





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
    "fk/planets/earth_assoc_itrf93.tf",
    "fk/satellites/aareadme.txt",
    "fk/satellites/moon_080317.tf",
    "fk/satellites/moon_assoc_me.tf",
    "fk/satellites/moon_assoc_pa.tf",
    # "fk/stations/dss_17_prelim_itrf93_161110.tf",
    # "fk/stations/dss_35_36_prelim_itrf93_140620.tf",
    # "fk/stations/earth_topo_050714.tf",
    # "fk/stations/ndosl_140530_v01.tf",

    "lsk/aareadme.txt",
    "lsk/naif0012.tls",

    "pck/Gravity.tpc",
    "pck/aareadme.txt",
    "pck/de-403-masses.tpc",
    "pck/earth_000101_190227_181206.bpc",
    "pck/earth_070425_370426_predict.bpc",
    "pck/earth_720101_070426.bpc",
    "pck/earth_fixed.tf",
    "pck/earth_latest_high_prec.bpc",
    "pck/geophysical.ker",
    "pck/gm_de431.tpc",
    "pck/moon_pa_de403_1950-2198.bpc",
    "pck/moon_pa_de418_1950-2050.bpc",
    "pck/moon_pa_de421_1900-2050.bpc",
    "pck/pck00010.tpc",

    # "spk/asteroids/AAREADME_Asteroids_SPKs.txt",
    # "spk/asteroids/aa_spk_production_dates_by-alpha.txt",
    # "spk/asteroids/aa_spk_production_dates_by-date.txt",
    # "spk/asteroids/aa_summaries.txt",
    # "spk/asteroids/codes_300ast_20100725.bsp",
    # "spk/asteroids/codes_300ast_20100725.cmt",
    # "spk/asteroids/codes_300ast_20100725.tf",
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
    "spk/planets/aa_spk_production_dates_by-alpha.txt",
    "spk/planets/aa_spk_production_dates_by-date.txt",
    "spk/planets/aa_summaries.txt",
    "spk/planets/aareadme_de430-de431.txt",
    "spk/planets/aareadme_de432s.txt",
    "spk/planets/de432_tech-comments.txt",
    "spk/planets/de432s.bsp",
    "spk/satellites/AAREADME_Satellite_SPKs",
    "spk/satellites/aa_spk_production_by_alpha.txt",
    "spk/satellites/aa_summaries.txt",
    "spk/satellites/aa_summaries_by_date.txt",
    "spk/satellites/jup310.bsp",
    "spk/satellites/jup341.bsp",
    "spk/satellites/mar097.bsp",
    "spk/satellites/nep081.bsp",
    "spk/satellites/nep086.bsp",
    "spk/satellites/nep087.bsp",
    "spk/satellites/nep088.bsp",
    "spk/satellites/plu055.bsp",
    "spk/satellites/sat319.bsp",
    "spk/satellites/sat375.bsp",
    "spk/satellites/sat393-rocks_pan.bsp",
    "spk/satellites/sat393.bsp",
    "spk/satellites/sat393_daphnis.bsp",
    "spk/satellites/ura091-rocks-merge.bsp",
    "spk/satellites/ura111.bsp",
    "spk/satellites/ura112.bsp",
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
    pwd = File.cwd!
    url_root = "https://naif.jpl.nasa.gov/pub/naif/generic_kernels"
    dest_prefix = "priv/kernels"

    url = Path.join([url_root, file])
    dest = Path.join([pwd, dest_prefix, file])

    # IO.puts file <> "  -->  " <> dest
    result = Download.from(url, [path: dest, max_file_size: 1024 * 1024 * 1200])

    case result do
      {:ok, path} ->
        IO.puts "downloaded:  " <> path
      {:error, :download_failure} ->
        IO.puts "ERROR:   Download failed for " <> dest
      {:error, :eexist} ->
        IO.puts "exists:  " <> dest
      {:error, :file_size_is_too_big} ->
        IO.puts "ERROR:   Maximum size limit exceeded for " <> dest
      _ ->
        IO.puts "ERROR:   " <> dest
        IO.inspect result
    end
  end

end

IO.puts "\nDownloading NAIF files..."
NaifFiles.fetch
