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

Repo.insert! %Body{ name: "Sun",
  type: "star",
  diameter: 1392684,
  oblateness: 0.0,
  axial_tilt: 0.0,
  rotation_duration: 0.0 }
Repo.insert! %Body{ name: "Mercury",
  type: "planet",
  diameter: 4879,
  oblateness: 0.0,
  axial_tilt: 0.0,
  rotation_duration: 1410.84 }
Repo.insert! %Body{ name: "Venus",
  type: "planet",
  diameter: 12104,
  oblateness: 0.0,
  axial_tilt: 177.36,
  rotation_duration: 5848.464 }
Repo.insert! %Body{ name: "Earth",
  type: "planet",
  diameter: 12756,
  oblateness: 0.00335,
  axial_tilt: 23.45,
  rotation_duration: 23.9345 }
Repo.insert! %Body{ name: "Mars",
  type: "planet",
  diameter: 6792,
  oblateness: 0.00648,
  axial_tilt: 25.19,
  rotation_duration: 24.6229 }
Repo.insert! %Body{ name: "Jupiter",
  type: "planet",
  diameter: 142984,
  oblateness: 0.06487,
  axial_tilt: 3.13,
  rotation_duration: 9.925 }
Repo.insert! %Body{ name: "Saturn",
  type: "planet",
  diameter: 120536,
  oblateness: 0.09796,
  axial_tilt: 26.73,
  rotation_duration: 10.656 }
Repo.insert! %Body{ name: "Uranus",
  type: "planet",
  diameter: 49528,
  oblateness: 0.02293,
  axial_tilt: 97.77,
  rotation_duration: 17.24 }
Repo.insert! %Body{ name: "Neptune",
  type: "planet",
  diameter: 51118,
  oblateness: 0.01708,
  axial_tilt: 28.32,
  rotation_duration: 16.11 }
Repo.insert! %Body{ name: "Pluto",
  type: "planet",
  diameter: 2390,
  oblateness: 0.0,
  axial_tilt: 122.53,
  rotation_duration: 153.72 }
