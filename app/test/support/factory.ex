defmodule Bubbli.Factory do
  @moduledoc false
  alias Bubbli.Repo

  def build(:user) do
    %BubbliSchema.User{}
  end

  def build(:post) do
    %BubbliSchema.Post{protected_content: Faker.Lorem.paragraph()}
  end

  def build(factory_name, attrs) do
    factory_name |> build() |> struct!(attrs)
  end

  def insert!(factory_name, attrs \\ []) do
    factory_name |> build(attrs) |> Repo.insert!()
  end
end
