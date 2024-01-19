defmodule BubbliWeb.UserView do
  def render("user.json", %{user: user}) do
    %{
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      display_name: user.display_name,
      username: user.username,
      home_timeline: BubbliWeb.TimelineView.render("timeline.json", %{timeline: user.home_timeline}),
    }
  end

  def render("user_with_keys.json", %{user: user, encryption_keys: keys}) do
    %{
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      display_name: user.display_name,
      username: user.username,
      home_timeline: BubbliWeb.TimelineView.render("timeline.json", %{timeline: user.home_timeline}),
      encryption_keys: Enum.map(keys, &BubbliWeb.EncryptionKeyView.render("key.json", %{encryption_key: &1})),
    }
  end
end
