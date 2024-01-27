defmodule BubbliWeb.ClientKeyView do
  def render("key.json", %{client_key: key}) do
    %{
      protected_private_key: Base.encode64(key.protected_private_key),
      key_algorithm: key.key_algorithm,
      wrap_algorithm: key.wrap_algorithm,
      key_usages: key.key_usages
    }
  end
end
