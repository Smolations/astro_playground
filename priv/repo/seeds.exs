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

Repo.insert! %Body{
  name: "Sun",
  type: "star",
  diameter: 1392684
}
Repo.insert! %Body{
  name: "Mercury",
  type: "planet",
  diameter: 4879
}
Repo.insert! %Body{
  name: "Venus",
  type: "planet",
  diameter: 12104
}
Repo.insert! %Body{
  name: "Earth",
  type: "planet",
  diameter: 12756
}
Repo.insert! %Body{
  name: "Mars",
  type: "planet",
  diameter: 6792
}
Repo.insert! %Body{
  name: "Jupiter",
  type: "planet",
  diameter: 142984
}
Repo.insert! %Body{
  name: "Saturn",
  type: "planet",
  diameter: 120536
}
Repo.insert! %Body{
  name: "Neptune",
  type: "planet",
  diameter: 51118
}
Repo.insert! %Body{
  name: "Uranus",
  type: "planet",
  diameter: 49528
}
