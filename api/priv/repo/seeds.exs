# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# This script uses Ash.Seed.seed!/2 to bypass authentication (magic link)
# and authorization policies entirely, which is appropriate for dev seeds.

alias Bubbli.Accounts.{User, Profile}
alias Bubbli.Social.{Circle, CircleMember, Connection}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Ash.Seed.seed!/2 inserts directly, skipping actions/policies/changes.
# We use it for User so we don't need a magic-link token.
# For other resources we can use normal Ash actions with authorize?: false.

defmodule Seeds do
  @moduledoc false

  def create_user!(email) do
    Ash.Seed.seed!(User, %{email: email})
  end

  def create_profile!(user, attrs \\ %{}) do
    Profile
    |> Ash.Changeset.for_create(:create, Map.put(attrs, :user_id, user.id), authorize?: false)
    |> Ash.create!(authorize?: false)
  end

  def create_circle!(owner, attrs) do
    Circle
    |> Ash.Changeset.for_create(:create_custom, attrs, actor: owner, authorize?: false)
    |> Ash.create!(authorize?: false)
  end

  def add_circle_member!(circle, user) do
    CircleMember
    |> Ash.Changeset.for_create(
      :add_member,
      %{circle_id: circle.id, user_id: user.id},
      authorize?: false
    )
    |> Ash.create!(authorize?: false)
  end

  def send_connection!(requester, receiver) do
    Connection
    |> Ash.Changeset.for_create(
      :send_request,
      %{receiver_id: receiver.id},
      actor: requester,
      authorize?: false
    )
    |> Ash.create!(authorize?: false)
  end

  def accept_connection!(connection, actor) do
    connection
    |> Ash.Changeset.for_update(:accept, %{}, actor: actor, authorize?: false)
    |> Ash.update!(authorize?: false)
  end
end

# ---------------------------------------------------------------------------
# Users & Profiles
# ---------------------------------------------------------------------------

IO.puts("🌱 Creating users and profiles...")

alice = Seeds.create_user!("alice@example.com")

Seeds.create_profile!(alice, %{
  display_name: "Alice Anderson",
  handle: "alice",
  bio: "Exploring the world one bubble at a time 🫧",
  location: "San Francisco, CA",
  profile_visibility: :public
})

bob = Seeds.create_user!("bob@example.com")

Seeds.create_profile!(bob, %{
  display_name: "Bob Baker",
  handle: "bob",
  bio: "Coffee enthusiast and weekend hiker ☕🥾",
  location: "Portland, OR",
  profile_visibility: :public
})

carol = Seeds.create_user!("carol@example.com")

Seeds.create_profile!(carol, %{
  display_name: "Carol Chen",
  handle: "carol",
  bio: "Building cool things with code 💻",
  location: "Austin, TX",
  profile_visibility: :connections_only
})

dave = Seeds.create_user!("dave@example.com")

Seeds.create_profile!(dave, %{
  display_name: "Dave Diaz",
  handle: "dave",
  bio: "Music producer & vinyl collector 🎵",
  location: "Brooklyn, NY",
  profile_visibility: :public
})

eve = Seeds.create_user!("eve@example.com")

Seeds.create_profile!(eve, %{
  display_name: "Eve Ellis",
  handle: "eve",
  bio: "Photographer | Traveler | Dreamer 📸",
  location: "London, UK",
  profile_visibility: :connections_only
})

IO.puts("✅ Created 5 users with profiles")

# ---------------------------------------------------------------------------
# Connections
# ---------------------------------------------------------------------------

IO.puts("🌱 Creating connections...")

# Alice <-> Bob (accepted)
conn_ab = Seeds.send_connection!(alice, bob)
Seeds.accept_connection!(conn_ab, bob)

# Alice <-> Carol (accepted)
conn_ac = Seeds.send_connection!(alice, carol)
Seeds.accept_connection!(conn_ac, carol)

# Bob <-> Dave (accepted)
conn_bd = Seeds.send_connection!(bob, dave)
Seeds.accept_connection!(conn_bd, dave)

# Carol -> Dave (pending — Dave hasn't accepted yet)
_conn_cd = Seeds.send_connection!(carol, dave)

# Eve -> Alice (pending — Alice hasn't accepted yet)
_conn_ea = Seeds.send_connection!(eve, alice)

# Dave <-> Eve (accepted)
conn_de = Seeds.send_connection!(dave, eve)
Seeds.accept_connection!(conn_de, eve)

IO.puts("✅ Created 6 connections (4 accepted, 2 pending)")

# ---------------------------------------------------------------------------
# Circles & Members
# ---------------------------------------------------------------------------

IO.puts("🌱 Creating circles and members...")

# Alice's circles
close_friends =
  Seeds.create_circle!(alice, %{name: "Close Friends", description: "My inner circle"})

Seeds.add_circle_member!(close_friends, bob)
Seeds.add_circle_member!(close_friends, carol)

work_buddies =
  Seeds.create_circle!(alice, %{name: "Work Buddies", description: "Colleagues and coworkers"})

Seeds.add_circle_member!(work_buddies, carol)

# Bob's circles
music_crew = Seeds.create_circle!(bob, %{name: "Music Crew", description: "Fellow music lovers"})
Seeds.add_circle_member!(music_crew, dave)

# Dave's circles
creatives = Seeds.create_circle!(dave, %{name: "Creatives", description: "Artists and creators"})
Seeds.add_circle_member!(creatives, eve)
Seeds.add_circle_member!(creatives, bob)

IO.puts("✅ Created 4 circles with members")

# ---------------------------------------------------------------------------

IO.puts("")
IO.puts("🎉 Seed data created successfully!")
IO.puts("")
IO.puts("Dev accounts (use magic link to sign in):")
IO.puts("  • alice@example.com")
IO.puts("  • bob@example.com")
IO.puts("  • carol@example.com")
IO.puts("  • dave@example.com")
IO.puts("  • eve@example.com")
