# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     PrivateSocial.Repo.insert!(%PrivateSocial.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias PrivateSocial.Repo
alias PrivateSocial.Account.{User}

defmodule Seeds do
  def setup_global_seeds(), do: nil

  def setup_env_seeds(:dev) do
    Repo.insert! %User{
      email: "test@example.com"
    }
  end

  def setup_env_seeds(:test), do: nil
end




Seeds.setup_global_seeds()
Seeds.setup_env_seeds(Mix.env)

