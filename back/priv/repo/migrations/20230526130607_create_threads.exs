defmodule PrivateSocial.Repo.Migrations.CreateThreads do
  use Ecto.Migration

  def change do
    create table(:threads) do

      timestamps()
    end
  end
end
