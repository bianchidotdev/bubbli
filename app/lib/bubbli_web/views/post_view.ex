defmodule BubbliWeb.PostView do
  def render("post.json", %{post: post}) do
    %{
      id: post.id,
      protected_content: Base.encode64(post.protected_content),
      encryption_algorithm: post.encryption_algorithm,
      timeline_id: post.timeline_id,
      inserted_at: post.inserted_at,
      updated_at: post.updated_at,
      author_id: post.author_id
      # comments: post.comments
    }
  end

  def render("post_with_resources.json", %{post: post}) do
    %{
      id: post.id,
      protected_content: Base.encode64(post.protected_content),
      encryption_algorithm: post.encryption_algorithm,
      timeline: BubbliWeb.TimelineView.render("timeline.json", %{timeline: post.timeline}),
      encryption_context_id: post.timeline.encryption_context.id,
      inserted_at: post.inserted_at,
      updated_at: post.updated_at,
      author: BubbliWeb.UserView.render("user.json", %{user: post.author})
      # comments: post.comments
    }
  end
end
