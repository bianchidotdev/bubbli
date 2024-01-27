defmodule BubbliWeb.TimelineView do
  def render("timeline.json", %{timeline: timeline}) do
    %{
      id: timeline.id,
      type: timeline.type,
      encryption_context_id: timeline.encryption_context.id
    }
  end
end
