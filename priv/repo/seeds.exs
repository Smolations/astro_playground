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
jupiterElements = Elements.by_name(bodies, "Jupiter")["elements"]
saturnElements = Elements.by_name(bodies, "Saturn")["elements"]
uranusElements = Elements.by_name(bodies, "Uranus")["elements"]
neptuneElements = Elements.by_name(bodies, "Neptune")["elements"]
plutoElements = Elements.by_name(bodies, "Pluto")["elements"]

# IO.inspect earth

# source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/

# bodies

sun = Repo.insert! %Body{ name: "Sun",
  type: "star",
  mass: 1988500.0,
  volume: 1412000.0,
  mean_density: 1408.0,
  equatorial_radius: 695700.0,
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
Repo.insert! %Texture{ body_id: mars.id,
  map: "mars_2k_color.jpg",
  # displacement: "mars_2k_displacement.jpg",
  # normal: "mars_2k_normal.jpg"
}
Repo.insert! %Texture{ body_id: jupiter.id,
  map: "jupiter_2k_color.jpg",
  # displacement: "jupiter_2k_displacement.jpg",
  # normal: "jupiter_2k_normal.jpg"
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

Repo.insert! %Texture{ body_id: luna.id,
  map: "moon_2k_color.jpg",
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
