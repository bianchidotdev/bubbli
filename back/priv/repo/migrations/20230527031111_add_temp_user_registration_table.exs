defmodule PrivateSocial.Repo.Migrations.AddTempUserRegistrationTable do
  use Ecto.Migration

  def change do
    create table(:temp_user_registrations) do
      add :expires_at, :utc_datetime, null: false
      add :email, :string, null: false
      add :salt, :text, null: false, default: fragment("gen_salt('bf')")

      timestamps()
    end

    create unique_index(:temp_user_registrations, [:email])
  end
end
