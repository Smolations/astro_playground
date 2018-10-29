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
alias AstroPlayground.Bodies.Language

Repo.insert! %Language{
  name: "English",
  proverb: "A penny saved is a penny earned."
}
Repo.insert! %Language{
  name: "Indonesian",
  proverb: "Dimana ada kemauan, di situ ada jalan."
}
Repo.insert! %Language{
  name: "Dutch",
  proverb: "Die goed doet, goed ontmoet."
}
