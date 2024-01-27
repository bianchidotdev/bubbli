defmodule BubbliWeb.PostView do
  def render("post.json", %{post: post, timeline: timeline, author: author}) do
    %{
      id: post.id,
      protected_content: Base.encode64(post.protected_content),
      encryption_algorithm: post.encryption_algorithm,
      timeline: BubbliWeb.TimelineView.render("timeline.json", %{timeline: timeline}),
      inserted_at: post.inserted_at,
      updated_at: post.updated_at,
      author: BubbliWeb.UserView.render("user.json", %{user: author})
      # comments: post.comments
    }
  end
end
