defmodule BubbliWeb.TimelineJSON do
  def home(%{posts: posts}) do
    %{
      success: true,
      posts: posts
    }
  end
end
