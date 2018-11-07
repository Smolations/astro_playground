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

# source: https://nssdc.gsfc.nasa.gov/planetary/factsheet/

# bodies

sun = Repo.insert! %Body{ name: "Sun",
  type: "star",
  mass: 100.0, # lookup
  diameter: 1392684,
  oblateness: 0.0,
  axial_tilt: 0.0,
  rotation_period: 0.0 }

mercury = Repo.insert! %Body{ name: "Mercury",
  type: "planet",
  mass: 0.33,
  diameter: 4879,
  oblateness: 0.0,
  axial_tilt: 0.034,
  rotation_period: 1407.6 }
venus = Repo.insert! %Body{ name: "Venus",
  type: "planet",
  mass: 4.87,
  diameter: 12104,
  oblateness: 0.0,
  axial_tilt: 177.4,
  rotation_period: -5832.5 }
earth = Repo.insert! %Body{ name: "Earth",
  type: "planet",
  mass: 5.97,
  diameter: 12756,
  oblateness: 0.00335,
  axial_tilt: 23.4,
  rotation_period: 23.9 }
mars = Repo.insert! %Body{ name: "Mars",
  type: "planet",
  mass: 0.642,
  diameter: 6792,
  oblateness: 0.00648,
  axial_tilt: 25.2,
  rotation_period: 24.6 }
jupiter = Repo.insert! %Body{ name: "Jupiter",
  type: "planet",
  mass: 1898.0,
  diameter: 142984,
  oblateness: 0.06487,
  axial_tilt: 3.1,
  rotation_period: 9.9 }
saturn = Repo.insert! %Body{ name: "Saturn",
  type: "planet",
  mass: 568.0,
  diameter: 120536,
  oblateness: 0.09796,
  axial_tilt: 26.7,
  rotation_period: 10.7 }
uranus = Repo.insert! %Body{ name: "Uranus",
  type: "planet",
  mass: 86.8,
  diameter: 51118,
  oblateness: 0.02293,
  axial_tilt: 97.8,
  rotation_period: -17.2 }
neptune = Repo.insert! %Body{ name: "Neptune",
  type: "planet",
  mass: 102.0,
  diameter: 49528,
  oblateness: 0.01708,
  axial_tilt: 28.3,
  rotation_period: 16.1 }
pluto = Repo.insert! %Body{ name: "Pluto",
  type: "planet",
  mass: 0.0146,
  diameter: 2370,
  oblateness: 0.0,
  axial_tilt: 122.5,
  rotation_period: -153.3 }

moon = Repo.insert! %Body{ name: "Moon",
  type: "satellite",
  mass: 0.073,
  diameter: 3454,
  oblateness: 0.0012,
  axial_tilt: 6.687,
  rotation_period: 655.7 }


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

Repo.insert! %Texture{ body_id: moon.id,
  map: "moon_2k_color.jpg",
  # displacement: "neptune_2k_displacement.jpg",
  # normal: "neptune_2k_normal.jpg"
}


# orbits

Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: mercury.id,
  inclination: 7.0,
  period: 87.969,
  # eccentricity: 0.2056,
  min_velocity: 38.86,
  max_velocity: 58.98,
  semi_major_axis: 57.91
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: venus.id,
  inclination: 3.39,
  period: 224.701,
  # eccentricity: 0.0067,
  min_velocity: 34.79,
  max_velocity: 35.26,
  semi_major_axis: 108.21
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: earth.id,
  inclination: 0.0,
  period: 365.256,
  # eccentricity: 0.0167,
  min_velocity: 29.29,
  max_velocity: 30.29,
  semi_major_axis: 149.6
}
Repo.insert! %Orbit{ central_body_id: earth.id, orbiting_body_id: moon.id,
  inclination: 5.145,
  period: 27.3217,
  # eccentricity: 0.0549,
  min_velocity: 0.970,
  max_velocity: 1.082,
  semi_major_axis: 0.3844
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: mars.id,
  inclination: 1.85,
  period: 686.98,
  # eccentricity: 0.0935,
  min_velocity: 21.97,
  max_velocity: 26.5,
  semi_major_axis: 227.92
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: jupiter.id,
  inclination: 1.304,
  period: 4332.589,
  # eccentricity: 0.0489,
  min_velocity: 12.44,
  max_velocity: 13.72,
  semi_major_axis: 778.57
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: saturn.id,
  inclination: 2.485,
  period: 10759.22,
  # eccentricity: 0.0565,
  min_velocity: 9.09,
  max_velocity: 10.18,
  semi_major_axis: 1433.53
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: uranus.id,
  inclination: 0.772,
  period: 30685.4,
  # eccentricity: 0.0457,
  min_velocity: 6.49,
  max_velocity: 7.11,
  semi_major_axis: 2872.46
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: neptune.id,
  inclination: 1.769,
  period: 60189.0,
  # eccentricity: 0.0113,
  min_velocity: 5.37,
  max_velocity: 5.5,
  semi_major_axis: 4495.06
}
Repo.insert! %Orbit{ central_body_id: sun.id, orbiting_body_id: pluto.id,
  inclination: 17.16,
  period: 90560.0,
  # eccentricity: 0.2488,
  min_velocity: 3.71,
  max_velocity: 6.1,
  semi_major_axis: 5906.38
}
