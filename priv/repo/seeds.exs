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

Repo.insert! %Body{name: "Sun", type: "star", diameter: 1392684, orbital_radius: 0}
Repo.insert! %Body{name: "Mercury", type: "planet", diameter: 4879, orbital_radius: 57909000}
Repo.insert! %Body{name: "Venus", type: "planet", diameter: 12104, orbital_radius: 10816000}
Repo.insert! %Body{name: "Earth", type: "planet", diameter: 12756, orbital_radius: 149600000}
Repo.insert! %Body{name: "Mars", type: "planet", diameter: 6792, orbital_radius: 227990000}
Repo.insert! %Body{name: "Jupiter", type: "planet", diameter: 142984, orbital_radius: 778360000}
Repo.insert! %Body{name: "Saturn", type: "planet", diameter: 120536, orbital_radius: 1433500000}
Repo.insert! %Body{name: "Neptune", type: "planet", diameter: 51118, orbital_radius: 2872400000}
Repo.insert! %Body{name: "Uranus", type: "planet", diameter: 49528, orbital_radius: 4498400000}
