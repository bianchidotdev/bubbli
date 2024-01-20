defmodule BubbliWeb.PostJSON do
  def successfully_created(%{post: post, timeline: timeline, author: author}) do
    %{
      success: true,
      post: BubbliWeb.PostView.render("post.json", %{post: post, timeline: timeline, author: author})
    }
  end
end
