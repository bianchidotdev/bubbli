import { getKey, masterEncryptionKeyConst, masterPrivateKeyConst } from "$lib/stores/encryption_key_store";

export async function load({ }) {
  return {
    encryptionKey: await getKey(masterEncryptionKeyConst),
    privateKey: await getKey(masterPrivateKeyConst)
  };
}