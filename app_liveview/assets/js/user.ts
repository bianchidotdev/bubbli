// TODO: figure out stores in liveview
// import { userStore, type User, clearUserStore } from '$lib/stores/user_store';
import { fromByteArray } from 'base64-js';

import {
  generatePassphraseBasedKeysArgon2,
  generateSymmetricEncryptionKey,
  generateClientKeyPair,
  generateEncryptionIV,
  decryptAsymmetricKey,
  encryptAsymmetricKey,
  encryptSymmetricKey,
  exportPublicKeyAsPEM,
  base64EncodeArrayBuffer
} from './crypto';

// TODO: figure out storage
// import {
//   storeKey,
//   clearKeys,
//   masterPrivateKeyConst,
//   masterEncryptionKeyConst,
//   getKey
// } from '$lib/stores/encryption_key_store';

const encoder = new TextEncoder();

export const logOutUser = async () => {
  // TODO: clear keys
  // clearKeys();
};

export const hydrateRegistration = async (email: string, passphrase: string) => {
  // TODO: change out salt with randomized byte array
  const salt = encoder.encode(email);
  const privateKeyEncryptionIV = generateEncryptionIV();
  const userKeyEncryptionIV = generateEncryptionIV();

  // generate keys
  const { encryptionKey, authenticationHash } = await generatePassphraseBasedKeysArgon2(
    passphrase,
    salt
  );

  const clientKeyPair = await generateClientKeyPair();
  const pemExportedPublicKey = await exportPublicKeyAsPEM(clientKeyPair.publicKey);
  const pwEncPrivateKey = await encryptAsymmetricKey(
    encryptionKey,
    clientKeyPair.privateKey,
    privateKeyEncryptionIV
  );

  const clientKeys = [
    {
      type: 'passphrase',
      encryption_iv: fromByteArray(privateKeyEncryptionIV),
      protected_private_key: base64EncodeArrayBuffer(pwEncPrivateKey)
    }
  ];

  const userSymmetricEncryptionKey = await generateSymmetricEncryptionKey();
  const encryptedUserEncryptionKey = await encryptSymmetricKey(
    encryptionKey,
    userSymmetricEncryptionKey,
    userKeyEncryptionIV
  );

  // TODO: Store keys
  // await storeKey(masterEncryptionKeyConst, encryptionKey);
  // await storeKey(masterPrivateKeyConst, clientKeyPair.privateKey);
  // TODO: store salt - userStore.set({ ...user, ...{ salt: salt } });


  return {
    email: email,
    // display_name: user.displayName,
    // username: user.username,
    public_key: pemExportedPublicKey,
    authentication_hash: authenticationHash,
    client_keys: clientKeys,
    timeline_key: {
      encryption_iv: fromByteArray(userKeyEncryptionIV),
      protected_encryption_key: base64EncodeArrayBuffer(encryptedUserEncryptionKey)
    },
  }
};

export const login = async (email: string, passphrase: string) => {
  const salt = encoder.encode(email);
  const { encryptionKey, authenticationHash } = await generatePassphraseBasedKeysArgon2(
    passphrase,
    salt
  );
  // TODO: store key
  // await storeKey(masterEncryptionKeyConst, encryptionKey);
  return {
    email: email,
    authentication_hash: authenticationHash,
    client_key_type: 'passphrase'
  }
};

export const decryptAndLoadMasterPrivateKey = async (
  encryptedPrivateKey: Uint8Array,
  encryptedPrivateKeyIV: Uint8Array
) => {
  // TODO get key?
  const encryptionKey = await getKey(masterEncryptionKeyConst);
  if (!encryptionKey || !encryptedPrivateKey || !encryptedPrivateKeyIV) {
    return { error: 'Missing required keys' };
  }

  const masterPrivateKey = await decryptAsymmetricKey(
    encryptionKey,
    encryptedPrivateKey,
    encryptedPrivateKeyIV
  );

  // TODO: store key
  // await storeKey(masterPrivateKeyConst, masterPrivateKey);
  console.log(masterPrivateKey);
};
