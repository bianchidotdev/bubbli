# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Bubbli.Repo.insert!(%Bubbli.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias Bubbli.Account.User
alias Bubbli.Repo

# defmodule Seeds do
#  def setup_global_seeds(), do: nil
# end
#
# Seeds.setup_global_seeds()

# Repo.insert!(%User{
#   email: "test@example.com"
# })
