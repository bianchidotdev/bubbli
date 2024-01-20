defmodule BubbliWeb.EncryptionKeyView do
  def render("key.json", %{encryption_key: key}) do
    %{
      encryption_context_id: key.encryption_context_id,
      protected_encryption_key: Base.encode64(key.protected_encryption_key),
      key_algorithm: key.key_algorithm,
      wrap_algorithm: key.wrap_algorithm,
      key_usages: key.key_usages,
    }
  end
end
