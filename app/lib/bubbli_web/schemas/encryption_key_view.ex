defmodule BubbliWeb.EncryptionKeyView do
  def render("key.json", %{encryption_key: key}) do
    %{
      encryption_context_id: key.encryption_context_id,
      protected_encryption_key: Base.encode64(key.protected_encryption_key),
      encryption_iv: Base.encode64(key.encryption_iv),
    }
  end
end
