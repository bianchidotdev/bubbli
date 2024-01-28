defmodule BubbliWeb.TimelineJSON do
  def home(%{posts: posts}) do
    %{
      success: true,
      posts: Enum.map(posts, fn post -> BubbliWeb.PostView.render("post_with_resources.json", %{post: post}) end)
    }
  end
end
