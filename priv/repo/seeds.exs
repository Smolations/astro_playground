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
alias AstroPlayground.Bodies.Body
alias AstroPlayground.Orbits.Orbit
alias AstroPlayground.Spicey.Object, as: SpiceObject
alias AstroPlayground.Textures.Texture



defmodule Elements do
  def get_json(filename) do
    with {:ok, body} <- File.read(filename),
         {:ok, json} <- Poison.decode(body), do: {:ok, json}
  end

  def by_name(list, name) do
    Enum.find(list, fn (obj) ->
      case obj["name"] do
        ^name -> obj
        _ -> false
      end
    end)
  end
end

{:ok, json} = Elements.get_json("elements.json");

bodies = get_in(json, ["bodies"])

mercuryElements = Elements.by_name(bodies, "Mercury")["elements"]
venusElements = Elements.by_name(bodies, "Venus")["elements"]

earthElements = Elements.by_name(bodies, "Earth")["elements"]
lunaElements = Elements.by_name(bodies, "Luna")["elements"]

marsElements = Elements.by_name(bodies, "Mars")["elements"]
phobosElements = Elements.by_name(bodies, "Phobos")["elements"]
deimosElements = Elements.by_name(bodies, "Deimos")["elements"]

jupiterElements = Elements.by_name(bodies, "Jupiter")["elements"]
ioElements = Elements.by_name(bodies, "Io")["elements"]
europaElements = Elements.by_name(bodies, "Europa")["elements"]
ganymedeElements = Elements.by_name(bodies, "Ganymede")["elements"]
callistoElements = Elements.by_name(bodies, "Callisto")["elements"]
amaltheaElements = Elements.by_name(bodies, "Amalthea")["elements"]
thebeElements = Elements.by_name(bodies, "Thebe")["elements"]
adrasteaElements = Elements.by_name(bodies, "Adrastea")["elements"]
metisElements = Elements.by_name(bodies, "Metis")["elements"]

saturnElements = Elements.by_name(bodies, "Saturn")["elements"]
uranusElements = Elements.by_name(bodies, "Uranus")["elements"]
neptuneElements = Elements.by_name(bodies, "Neptune")["elements"]
plutoElements = Elements.by_name(bodies, "Pluto")["elements"]

# barycenters
sol_bc = Repo.insert! %SpiceObject{ name: "Solar System Barycenter",
  spice_id: 0,
  spice_name: "Solar System Barycenter",
  type: "barycenter" }
mercury_bc = Repo.insert! %SpiceObject{ name: "Mercury Barycenter",
  spice_id: 1,
  spice_name: "Mercury Barycenter",
  type: "barycenter" }
venus_bc = Repo.insert! %SpiceObject{ name: "Venus Barycenter",
  spice_id: 2,
  spice_name: "Venus Barycenter",
  type: "barycenter" }
earth_bc = Repo.insert! %SpiceObject{ name: "Earth Barycenter",
  spice_id: 3,
  spice_name: "Earth-Moon Barycenter",
  type: "barycenter" }
mars_bc = Repo.insert! %SpiceObject{ name: "Mars Barycenter",
  spice_id: 4,
  spice_name: "Mars Barycenter",
  type: "barycenter" }
jupiter_bc = Repo.insert! %SpiceObject{ name: "Jupiter Barycenter",
  spice_id: 5,
  spice_name: "Jupiter Barycenter",
  type: "barycenter" }
saturn_bc = Repo.insert! %SpiceObject{ name: "Saturn Barycenter",
  spice_id: 6,
  spice_name: "Saturn Barycenter",
  type: "barycenter" }
uranus_bc = Repo.insert! %SpiceObject{ name: "Uranus Barycenter",
  spice_id: 7,
  spice_name: "Uranus Barycenter",
  type: "barycenter" }
neptune_bc = Repo.insert! %SpiceObject{ name: "Neptune Barycenter",
  spice_id: 8,
  spice_name: "Neptune Barycenter",
  type: "barycenter" }
pluto_bc = Repo.insert! %SpiceObject{ name: "Pluto Barycenter",
  spice_id: 9,
  spice_name: "Pluto Barycenter",
  type: "barycenter" }

# stars
sol = Repo.insert! %SpiceObject{ name: "Sol",
  spice_id: 10,
  spice_name: "Sun",
  type: "star" }

# planets
_mercury = Repo.insert! %SpiceObject{ name: "Mercury",
  spice_id: 199,
  spice_name: "Mercury",
  type: "planet" }
_venus = Repo.insert! %SpiceObject{ name: "Venus",
  spice_id: 299,
  spice_name: "Venus",
  type: "planet" }
_earth = Repo.insert! %SpiceObject{ name: "Earth",
  spice_id: 399,
  spice_name: "Earth",
  type: "planet" }
_mars = Repo.insert! %SpiceObject{ name: "Mars",
  spice_id: 499,
  spice_name: "Mars",
  type: "planet" }
_jupiter = Repo.insert! %SpiceObject{ name: "Jupiter",
  spice_id: 599,
  spice_name: "Jupiter",
  type: "planet" }
_saturn = Repo.insert! %SpiceObject{ name: "Saturn",
  spice_id: 699,
  spice_name: "Saturn",
  type: "planet" }
_uranus = Repo.insert! %SpiceObject{ name: "Uranus",
  spice_id: 799,
  spice_name: "Uranus",
  type: "planet" }
_neptune = Repo.insert! %SpiceObject{ name: "Neptune",
  spice_id: 899,
  spice_name: "Neptune",
  type: "planet" }
_pluto = Repo.insert! %SpiceObject{ name: "Pluto",
  spice_id: 999,
  spice_name: "Pluto",
  type: "dwarf planet" }

# moons (aka satellites)
# // earth
_luna = Repo.insert! %SpiceObject{ name: "Luna",
  spice_id: 301,
  spice_name: "Moon",
  type: "satellite" }

# // mars
_phobos = Repo.insert! %SpiceObject{ name: "Phobos",
  spice_id: 401,
  spice_name: "Phobos",
  type: "satellite" }
_deimos = Repo.insert! %SpiceObject{ name: "Deimos",
  spice_id: 402,
  spice_name: "Deimos",
  type: "satellite" }

# // jupiter
_io = Repo.insert! %SpiceObject{ name: "Io",
  spice_id: 501,
  spice_name: "Io",
  type: "satellite" }
_europa = Repo.insert! %SpiceObject{ name: "Europa",
  spice_id: 502,
  spice_name: "Europa",
  type: "satellite" }
_ganymede = Repo.insert! %SpiceObject{ name: "Ganymede",
  spice_id: 503,
  spice_name: "Ganymede",
  type: "satellite" }
_callisto = Repo.insert! %SpiceObject{ name: "Callisto",
  spice_id: 504,
  spice_name: "Callisto",
  type: "satellite" }
_amalthea = Repo.insert! %SpiceObject{ name: "Amalthea",
  spice_id: 505,
  spice_name: "Amalthea",
  type: "satellite" }
_thebe = Repo.insert! %SpiceObject{ name: "Thebe",
  spice_id: 514,
  spice_name: "Thebe",
  type: "satellite" }
_adrastea = Repo.insert! %SpiceObject{ name: "Adrastea",
  spice_id: 515,
  spice_name: "Adrastea",
  type: "satellite" }
_metis = Repo.insert! %SpiceObject{ name: "Metis",
  spice_id: 516,
  spice_name: "Metis",
  type: "satellite" }

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
_ariel = Repo.insert! %SpiceObject{ name: "Ariel",
  spice_id: 701,
  spice_name: "Ariel",
  type: "satellite" }
_umbriel = Repo.insert! %SpiceObject{ name: "Umbriel",
  spice_id: 702,
  spice_name: "Umbriel",
  type: "satellite" }
_titania = Repo.insert! %SpiceObject{ name: "Titania",
  spice_id: 703,
  spice_name: "Titania",
  type: "satellite" }
_oberon = Repo.insert! %SpiceObject{ name: "Oberon",
  spice_id: 704,
  spice_name: "Oberon",
  type: "satellite" }
_miranda = Repo.insert! %SpiceObject{ name: "Miranda",
  spice_id: 705,
  spice_name: "Miranda",
  type: "satellite" }

# // neptune
_triton = Repo.insert! %SpiceObject{ name: "Triton",
  spice_id: 801,
  spice_name: "Triton",
  type: "satellite" }
_nereid = Repo.insert! %SpiceObject{ name: "Nereid",
  spice_id: 802,
  spice_name: "Nereid",
  type: "satellite" }

# // pluto
_charon = Repo.insert! %SpiceObject{ name: "Charon",
  spice_id: 901,
  spice_name: "Charon",
  type: "satellite" }
_nix = Repo.insert! %SpiceObject{ name: "Nix",
  spice_id: 902,
  spice_name: "Nix",
  type: "satellite" }
_hydra = Repo.insert! %SpiceObject{ name: "Hydra",
  spice_id: 903,
  spice_name: "Hydra",
  type: "satellite" }
_kerberos = Repo.insert! %SpiceObject{ name: "Kerberos",
  spice_id: 904,
  spice_name: "Kerberos",
  type: "satellite" }
_styx = Repo.insert! %SpiceObject{ name: "Styx",
  spice_id: 905,
  spice_name: "Styx",
  type: "satellite" }

# _ = Repo.insert! %SpiceObject{ name: "",
#   spice_id: 9,
#   spice_name: "",
#   type: "" }


# source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/

# bodies
# mass: { units: 'kg', scalar: 1e+24 },
# volume: { units: 'km^3', scalar: 1e+10 },
# meanDensity: { units: 'kg/m^3' },
# equatorialRadius: { units: 'km' },
# polarRadius: { units: 'km' },
# volumetricMeanRadius: { units: 'km' },
# axialTilt: { units: '\u00B0' },
# obliquityToOrbit: { units: '\u00B0' },
# siderealRotationPeriod: { units: 'hrs' },
# mu: { units: 'km^3/s^2', scalar: 1e+6 }
sun = Repo.insert! %Body{ name: "Sun",
  type: "star",
  mass: 1988500.0,
  volume: 1412000.0,
  mean_density: 1408.0,
  equatorial_radius: 695700.0,
  # polar_radius: 66854.0,
  polar_radius: 695700.0,
  volumetric_mean_radius: 695700.0,
  oblateness: 0.00005,
  axial_tilt: 7.25,
  obliquity_to_orbit: 7.25,
  sidereal_rotation_period: 609.12,
  mu: 132712.0 }

mercury = Repo.insert! %Body{ name: "Mercury",
  type: "planet",
  mass: 0.33011,
  volume: 6.083,
  mean_density: 5427.0,
  equatorial_radius: 2439.7,
  polar_radius: 2439.7,
  volumetric_mean_radius: 2439.7,
  oblateness: 0.0,
  axial_tilt: 0.034,
  obliquity_to_orbit: 0.034,
  sidereal_rotation_period: 1407.6,
  mu: 0.022032 }
venus = Repo.insert! %Body{ name: "Venus",
  type: "planet",
  mass: 4.8675,
  volume: 92.843,
  mean_density: 5243.0,
  equatorial_radius: 6051.8,
  polar_radius: 6051.8,
  volumetric_mean_radius: 6051.8,
  oblateness: 0.0,
  axial_tilt: 2.64,
  obliquity_to_orbit: 177.4,
  sidereal_rotation_period: 5832.5,
  mu: 0.32486 }

earth = Repo.insert! %Body{ name: "Earth",
  type: "planet",
  mass: 5.9723,
  volume: 108.321,
  mean_density: 5514.0,
  equatorial_radius: 6378.137,
  polar_radius: 6356.752,
  volumetric_mean_radius: 6371.0,
  oblateness: 0.003353,
  axial_tilt: 23.44,
  obliquity_to_orbit: 23.44,
  sidereal_rotation_period: 23.9345,
  mu: 0.3986 }
luna = Repo.insert! %Body{ name: "Luna",
  type: "satellite",
  mass: 0.073,
  volume: 2.1968,
  mean_density: 3344.0,
  equatorial_radius: 1738.1,
  polar_radius: 1736.0,
  volumetric_mean_radius: 1737.4,
  oblateness: 0.0012,
  axial_tilt: 6.687,
  obliquity_to_orbit: 6.687,
  sidereal_rotation_period: 655.728,
  mu: 0.0049 }

mars = Repo.insert! %Body{ name: "Mars",
  type: "planet",
  mass: 0.64171,
  volume: 16.318,
  mean_density: 3933.0,
  equatorial_radius: 3396.2,
  polar_radius: 3376.2,
  volumetric_mean_radius: 3389.5,
  oblateness: 0.00589,
  axial_tilt: 25.19,
  obliquity_to_orbit: 25.19,
  sidereal_rotation_period: 24.6229,
  mu: 0.042828 }
phobos = Repo.insert! %Body{ name: "Phobos",
  type: "satellite",
  mass: 0.00000000108,
  volume: 0.0,
  mean_density: 1.9,
  equatorial_radius: 11.0,
  polar_radius: 11.0,
  volumetric_mean_radius: 11.0,
  oblateness: 0.0,
  axial_tilt: 0.009,
  obliquity_to_orbit: 0.0,
  sidereal_rotation_period: 7.656,
  mu: 0.0 }
deimos = Repo.insert! %Body{ name: "Deimos",
  type: "satellite",
  mass: 0.0000000018,
  volume: 0.0,
  mean_density: 1.76,
  equatorial_radius: 6.0,
  polar_radius: 6.0,
  volumetric_mean_radius: 6.0,
  oblateness: 0.0,
  axial_tilt: 0.889,
  obliquity_to_orbit: 0.0,
  sidereal_rotation_period: 30.312,
  mu: 0.0 }

jupiter = Repo.insert! %Body{ name: "Jupiter",
  type: "planet",
  mass: 1898.19,
  volume: 143128.0,
  mean_density: 1326.0,
  equatorial_radius: 71492.0,
  polar_radius: 66854.0,
  volumetric_mean_radius: 69911.0,
  oblateness: 0.06487,
  axial_tilt: 3.13,
  obliquity_to_orbit: 3.13,
  sidereal_rotation_period: 9.9259,
  mu: 126.687 }
io = Repo.insert! %Body{ name: "Io",
  type: "satellite",
  mass: 0.08933,
  volume: 0.0,
  mean_density: 3.53,
  equatorial_radius: 1821.3,
  polar_radius: 1821.3,
  volumetric_mean_radius: 1821.3,
  oblateness: 0.0,
  axial_tilt: 0.0,
  obliquity_to_orbit: 0.0,
  sidereal_rotation_period: 42.459312,
  mu: 0.0 }
europa = Repo.insert! %Body{ name: "Europa",
  type: "satellite",
  mass: 0.04797,
  volume: 0.0,
  mean_density: 2.99,
  equatorial_radius: 1565.0,
  polar_radius: 1565.0,
  volumetric_mean_radius: 1565.0,
  oblateness: 0.0,
  axial_tilt: 0.016,
  obliquity_to_orbit: 0.0,
  sidereal_rotation_period: 85.24344,
  mu: 0.0 }
ganymede = Repo.insert! %Body{ name: "Ganymede",
  type: "satellite",
  mass: 0.1482,
  volume: 0.0,
  mean_density: 1.94,
  equatorial_radius: 2634.0,
  polar_radius: 2634.0,
  volumetric_mean_radius: 2634.0,
  oblateness: 0.0,
  axial_tilt: 0.068,
  obliquity_to_orbit: 0.0,
  sidereal_rotation_period: 171.709272,
  mu: 0.0 }
callisto = Repo.insert! %Body{ name: "Callisto",
  type: "satellite",
  mass: 0.1076,
  volume: 0.0,
  mean_density: 1.851,
  equatorial_radius: 2403.0,
  polar_radius: 2403.0,
  volumetric_mean_radius: 2403.0,
  oblateness: 0.0,
  axial_tilt: 0.356,
  obliquity_to_orbit: 0.0,
  sidereal_rotation_period: 400.536432,
  mu: 0.0 }
amalthea = Repo.insert! %Body{ name: "Amalthea",
  type: "satellite",
  mass: 0.0,
  volume: 0.0,
  mean_density: 0.0,
  equatorial_radius: 73.0,
  polar_radius: 73.0,
  volumetric_mean_radius: 73.0,
  oblateness: 0.0,
  axial_tilt: 0.0,
  obliquity_to_orbit: 0.0,
  sidereal_rotation_period: 11.956296,
  mu: 0.0 }
thebe = Repo.insert! %Body{ name: "Thebe",
  type: "satellite",
  mass: 0.0,
  volume: 0.0,
  mean_density: 0.0,
  equatorial_radius: 50.0,
  polar_radius: 50.0,
  volumetric_mean_radius: 50.0,
  oblateness: 0.0,
  axial_tilt: 0.0,
  obliquity_to_orbit: 0.0,
  sidereal_rotation_period: 16.188,
  mu: 0.0 }
adrastea = Repo.insert! %Body{ name: "Adrastea",
  type: "satellite",
  mass: 0.0,
  volume: 0.0,
  mean_density: 0.0,
  equatorial_radius: 10.0,
  polar_radius: 10.0,
  volumetric_mean_radius: 10.0,
  oblateness: 0.0,
  axial_tilt: 0.0,
  obliquity_to_orbit: 0.0,
  sidereal_rotation_period: 7.15824,
  mu: 0.0 }
metis = Repo.insert! %Body{ name: "Metis",
  type: "satellite",
  mass: 0.0,
  volume: 0.0,
  mean_density: 0.0,
  equatorial_radius: 20.0,
  polar_radius: 20.0,
  volumetric_mean_radius: 20.0,
  oblateness: 0.0,
  axial_tilt: 0.0,
  obliquity_to_orbit: 0.0,
  sidereal_rotation_period: 7.07472,
  mu: 0.0 }

saturn = Repo.insert! %Body{ name: "Saturn",
  type: "planet",
  mass: 568.34,
  volume: 82713.0,
  mean_density: 687.0,
  equatorial_radius: 60268.0,
  polar_radius: 54364.0,
  volumetric_mean_radius: 58232.0,
  oblateness: 0.09796,
  axial_tilt: 26.73,
  obliquity_to_orbit: 26.73,
  sidereal_rotation_period: 10.656,
  mu: 37.931 }
uranus = Repo.insert! %Body{ name: "Uranus",
  type: "planet",
  mass: 86.813,
  volume: 6833.0,
  mean_density: 1271.0,
  equatorial_radius: 25559.0,
  polar_radius: 24973.0,
  volumetric_mean_radius: 25362.0,
  oblateness: 0.02293,
  axial_tilt: 82.23,
  obliquity_to_orbit: 97.77,
  sidereal_rotation_period: 17.24,
  mu: 5.794 }
neptune = Repo.insert! %Body{ name: "Neptune",
  type: "planet",
  mass: 102.413,
  volume: 6254.0,
  mean_density: 1638.0,
  equatorial_radius: 24764.0,
  polar_radius: 24341.0,
  volumetric_mean_radius: 24622.0,
  oblateness: 0.01708,
  axial_tilt: 28.32,
  obliquity_to_orbit: 28.32,
  sidereal_rotation_period: 16.11,
  mu: 6.8351 }
pluto = Repo.insert! %Body{ name: "Pluto",
  type: "planet",
  mass: 0.01303,
  volume: 0.697,
  mean_density: 1860.0,
  equatorial_radius: 1187.0,
  polar_radius: 1187.0,
  volumetric_mean_radius: 1187.0,
  oblateness: 0.0,
  axial_tilt: 57.47,
  obliquity_to_orbit: 122.53,
  sidereal_rotation_period: 153.2928,
  mu: 0.00087 }


# textures

Repo.insert! %Texture{ body_id: sun.id,
  map: "sun_2k_color.jpg",
  # displacement: "sun_2k_displacement.jpg",
  # normal: "sun_2k_normal.jpg"
}

Repo.insert! %Texture{ body_id: mercury.id,
  map: "mercury_2k_color.jpg",
  # displacement: "mercury_2k_displacement.jpg",
  # normal: "mercury_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: venus.id,
  map: "venus_2k_color.jpg",
  # displacement: "venus_2k_displacement.jpg",
  # normal: "venus_2k_normal.jpg"
}

Repo.insert! %Texture{ body_id: earth.id,
  map: "earth_daymap_2k_color.jpg",
  # displacement: "earth_2k_displacement.jpg",
  # normal: "earth_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: luna.id,
  map: "moon_2k_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}

Repo.insert! %Texture{ body_id: mars.id,
  map: "mars_2k_color.jpg",
  # displacement: "mars_2k_displacement.jpg",
  # normal: "mars_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: phobos.id,
  map: "phobos_1440x720_gray.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: deimos.id,
  map: "deimos_1440x720_gray.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}

Repo.insert! %Texture{ body_id: jupiter.id,
  map: "jupiter_2k_color.jpg",
  # displacement: "jupiter_2k_displacement.jpg",
  # normal: "jupiter_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: io.id,
  map: "io_2k_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: europa.id,
  map: "europa_2k_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: ganymede.id,
  map: "ganymede_1024x512_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: callisto.id,
  map: "callisto_1800x900_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: amalthea.id,
  map: "amalthea_2k_gray.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}

Repo.insert! %Texture{ body_id: saturn.id,
  map: "saturn_2k_color.jpg",
  # displacement: "saturn_2k_displacement.jpg",
  # normal: "saturn_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: uranus.id,
  map: "uranus_2k_color.jpg",
  # displacement: "uranus_2k_displacement.jpg",
  # normal: "uranus_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: neptune.id,
  map: "neptune_2k_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: pluto.id,
  map: "pluto_1k_grayscale.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}





# orbits

Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: mercury.id,
  semi_major_axis: mercuryElements["A"],
  sidereal_period: mercuryElements["PR"],
  periapsis: mercuryElements["QR"],
  apoapsis: mercuryElements["AD"],
  min_velocity: 38.86,
  max_velocity: 58.98,
  inclination: mercuryElements["IN"],
  eccentricity: mercuryElements["EC"],
  ascending_node: mercuryElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: venus.id,
  semi_major_axis: venusElements["A"],
  sidereal_period: venusElements["PR"],
  periapsis: venusElements["QR"],
  apoapsis: venusElements["AD"],
  min_velocity: 34.79,
  max_velocity: 35.26,
  inclination: venusElements["IN"],
  eccentricity: venusElements["EC"],
  ascending_node: venusElements["OM"],
}

Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: earth.id,
  semi_major_axis: earthElements["A"],
  sidereal_period: earthElements["PR"],
  periapsis: earthElements["QR"],
  apoapsis: earthElements["AD"],
  min_velocity: 29.29,
  max_velocity: 30.29,
  inclination: earthElements["IN"],
  eccentricity: earthElements["EC"],
  ascending_node: earthElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: earth.id, orbiting_body_id: luna.id,
  semi_major_axis: lunaElements["A"],
  sidereal_period: lunaElements["PR"],
  periapsis: lunaElements["QR"],
  apoapsis: lunaElements["AD"],
  min_velocity: 0.970,
  max_velocity: 1.082,
  inclination: lunaElements["IN"],
  eccentricity: lunaElements["EC"],
  ascending_node: lunaElements["OM"],
}

Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: mars.id,
  semi_major_axis: marsElements["A"],
  sidereal_period: marsElements["PR"],
  periapsis: marsElements["QR"],
  apoapsis: marsElements["AD"],
  min_velocity: 21.97,
  max_velocity: 26.5,
  inclination: marsElements["IN"],
  eccentricity: marsElements["EC"],
  ascending_node: marsElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: mars.id, orbiting_body_id: phobos.id,
  semi_major_axis: phobosElements["A"],
  sidereal_period: phobosElements["PR"],
  periapsis: phobosElements["QR"],
  apoapsis: phobosElements["AD"],
  min_velocity: 0.0,
  max_velocity: 0.0,
  inclination: phobosElements["IN"],
  eccentricity: phobosElements["EC"],
  ascending_node: phobosElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: mars.id, orbiting_body_id: deimos.id,
  semi_major_axis: deimosElements["A"],
  sidereal_period: deimosElements["PR"],
  periapsis: deimosElements["QR"],
  apoapsis: deimosElements["AD"],
  min_velocity: 0.0,
  max_velocity: 0.0,
  inclination: deimosElements["IN"],
  eccentricity: deimosElements["EC"],
  ascending_node: deimosElements["OM"],
}

Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: jupiter.id,
  semi_major_axis: jupiterElements["A"],
  sidereal_period: jupiterElements["PR"],
  periapsis: jupiterElements["QR"],
  apoapsis: jupiterElements["AD"],
  min_velocity: 12.44,
  max_velocity: 13.72,
  inclination: jupiterElements["IN"],
  eccentricity: jupiterElements["EC"],
  ascending_node: jupiterElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: jupiter.id, orbiting_body_id: io.id,
  semi_major_axis: ioElements["A"],
  sidereal_period: ioElements["PR"],
  periapsis: ioElements["QR"],
  apoapsis: ioElements["AD"],
  min_velocity: 0.0,
  max_velocity: 0.0,
  inclination: ioElements["IN"],
  eccentricity: ioElements["EC"],
  ascending_node: ioElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: jupiter.id, orbiting_body_id: europa.id,
  semi_major_axis: europaElements["A"],
  sidereal_period: europaElements["PR"],
  periapsis: europaElements["QR"],
  apoapsis: europaElements["AD"],
  min_velocity: 0.0,
  max_velocity: 0.0,
  inclination: europaElements["IN"],
  eccentricity: europaElements["EC"],
  ascending_node: europaElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: jupiter.id, orbiting_body_id: ganymede.id,
  semi_major_axis: ganymedeElements["A"],
  sidereal_period: ganymedeElements["PR"],
  periapsis: ganymedeElements["QR"],
  apoapsis: ganymedeElements["AD"],
  min_velocity: 0.0,
  max_velocity: 0.0,
  inclination: ganymedeElements["IN"],
  eccentricity: ganymedeElements["EC"],
  ascending_node: ganymedeElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: jupiter.id, orbiting_body_id: callisto.id,
  semi_major_axis: callistoElements["A"],
  sidereal_period: callistoElements["PR"],
  periapsis: callistoElements["QR"],
  apoapsis: callistoElements["AD"],
  min_velocity: 0.0,
  max_velocity: 0.0,
  inclination: callistoElements["IN"],
  eccentricity: callistoElements["EC"],
  ascending_node: callistoElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: jupiter.id, orbiting_body_id: amalthea.id,
  semi_major_axis: amaltheaElements["A"],
  sidereal_period: amaltheaElements["PR"],
  periapsis: amaltheaElements["QR"],
  apoapsis: amaltheaElements["AD"],
  min_velocity: 0.0,
  max_velocity: 0.0,
  inclination: amaltheaElements["IN"],
  eccentricity: amaltheaElements["EC"],
  ascending_node: amaltheaElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: jupiter.id, orbiting_body_id: thebe.id,
  semi_major_axis: thebeElements["A"],
  sidereal_period: thebeElements["PR"],
  periapsis: thebeElements["QR"],
  apoapsis: thebeElements["AD"],
  min_velocity: 0.0,
  max_velocity: 0.0,
  inclination: thebeElements["IN"],
  eccentricity: thebeElements["EC"],
  ascending_node: thebeElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: jupiter.id, orbiting_body_id: adrastea.id,
  semi_major_axis: adrasteaElements["A"],
  sidereal_period: adrasteaElements["PR"],
  periapsis: adrasteaElements["QR"],
  apoapsis: adrasteaElements["AD"],
  min_velocity: 0.0,
  max_velocity: 0.0,
  inclination: adrasteaElements["IN"],
  eccentricity: adrasteaElements["EC"],
  ascending_node: adrasteaElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: jupiter.id, orbiting_body_id: metis.id,
  semi_major_axis: metisElements["A"],
  sidereal_period: metisElements["PR"],
  periapsis: metisElements["QR"],
  apoapsis: metisElements["AD"],
  min_velocity: 0.0,
  max_velocity: 0.0,
  inclination: metisElements["IN"],
  eccentricity: metisElements["EC"],
  ascending_node: metisElements["OM"],
}

Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: saturn.id,
  semi_major_axis: saturnElements["A"],
  sidereal_period: saturnElements["PR"],
  periapsis: saturnElements["QR"],
  apoapsis: saturnElements["AD"],
  min_velocity: 9.09,
  max_velocity: 10.18,
  inclination: saturnElements["IN"],
  eccentricity: saturnElements["EC"],
  ascending_node: saturnElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: uranus.id,
  semi_major_axis: uranusElements["A"],
  sidereal_period: uranusElements["PR"],
  periapsis: uranusElements["QR"],
  apoapsis: uranusElements["AD"],
  min_velocity: 6.49,
  max_velocity: 7.11,
  inclination: uranusElements["IN"],
  eccentricity: uranusElements["EC"],
  ascending_node: uranusElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: neptune.id,
  semi_major_axis: neptuneElements["A"],
  sidereal_period: neptuneElements["PR"],
  periapsis: neptuneElements["QR"],
  apoapsis: neptuneElements["AD"],
  min_velocity: 5.37,
  max_velocity: 5.5,
  inclination: neptuneElements["IN"],
  eccentricity: neptuneElements["EC"],
  ascending_node: neptuneElements["OM"],
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: pluto.id,
  semi_major_axis: plutoElements["A"],
  sidereal_period: plutoElements["PR"],
  periapsis: plutoElements["QR"],
  apoapsis: plutoElements["AD"],
  min_velocity: 3.71,
  max_velocity: 6.1,
  inclination: plutoElements["IN"],
  eccentricity: plutoElements["EC"],
  ascending_node: plutoElements["OM"],
}


# download naif files
files = [
  "fk/planets/aareadme.txt",
  "fk/planets/earth_assoc_itrf93.tf",
  "fk/satellites/aareadme.txt",
  "fk/satellites/moon_080317.tf",
  "fk/satellites/moon_assoc_me.tf",
  "fk/satellites/moon_assoc_pa.tf",
  "fk/stations/dss_17_prelim_itrf93_161110.tf",
  "fk/stations/dss_35_36_prelim_itrf93_140620.tf",
  "fk/stations/earth_topo_050714.tf",
  "fk/stations/ndosl_140530_v01.tf",

  "lsk/aareadme.txt",
  "lsk/naif0012.tls",

  "pck/Gravity.tpc",
  "pck/aareadme.txt",
  "pck/de-403-masses.tpc",
  "pck/earth_000101_190220_181129.bpc",
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

  "spk/asteroids/AAREADME_Asteroids_SPKs.txt",
  "spk/asteroids/aa_spk_production_dates_by-alpha.txt",
  "spk/asteroids/aa_spk_production_dates_by-date.txt",
  "spk/asteroids/aa_summaries.txt",
  "spk/asteroids/codes_300ast_20100725.bsp",
  "spk/asteroids/codes_300ast_20100725.cmt",
  "spk/asteroids/codes_300ast_20100725.tf",
  "spk/comets/C_G_1000012_2012_2017.bsp",
  "spk/comets/aa_summaries.txt",
  "spk/comets/c2013a1_s105_merged.bsp",
  "spk/comets/ison.bsp",
  "spk/comets/ison.lbl",
  "spk/comets/siding_spring.lbl",
  "spk/comets/siding_spring_8-19-14.bsp",
  "spk/comets/siding_spring_s46.bsp",
  "spk/lagrange_point/AAREADME_Lagrange_point_SPKs.txt",
  "spk/lagrange_point/L1_de431.bsp",
  "spk/lagrange_point/L2_de431.bsp",
  "spk/lagrange_point/L4_de431.bsp",
  "spk/lagrange_point/L5_de431.bsp",
  "spk/lagrange_point/aa_spk_production_dates_by-alpha.txt",
  "spk/lagrange_point/aa_spk_production_dates_by-date.txt",
  "spk/lagrange_point/aa_summaries.txt",
  "spk/planets/aa_spk_production_dates_by-alpha.txt",
  "spk/planets/aa_spk_production_dates_by-date.txt",
  "spk/planets/aa_summaries.txt",
  "spk/planets/aareadme_de430-de431.txt",
  "spk/planets/aareadme_de432s.txt",
  "spk/planets/de432_tech-comments.txt",
  "spk/planets/de432s.bsp",
  "spk/satellites/AAREADME_Satellite_SPKs.txt",
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
  "spk/stations/aa_spk_production_dates_by-alpha.txt",
  "spk/stations/aa_spk_production_dates_by-date.txt",
  "spk/stations/aa_summaries.txt",
  "spk/stations/dss_17_prelim_itrf93_161110.bsp",
  "spk/stations/dss_35_36_prelim_itrf93_140620.bsp",
  "spk/stations/earthstns_fx_050714.bsp",
  "spk/stations/earthstns_itrf93_050714.bsp",
  "spk/stations/ndosl_140530_v01.bsp",
]


defmodule NaifFiles do

  def get(file) do
    pwd = File.cwd!
    url_root = "https://naif.jpl.nasa.gov/pub/naif/generic_kernels"
    dest_prefix = "priv/kernels"

    url = Path.join([url_root, file])
    dest = Path.join([pwd, dest_prefix, file])

    IO.puts file <> "  -->  " <> dest
    result = Download.from(url, [path: dest])
    IO.inspect result
  end

end

Enum.map(files, &NaifFiles.get/1)
