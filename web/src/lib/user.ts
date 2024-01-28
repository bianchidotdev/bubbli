import { BASE_API_URI } from '$lib/constants';
import { userStore, type User, clearUserStore } from '$lib/stores/user_store';
import { fromByteArray } from 'base64-js';
import { invalidateAll } from '$app/navigation';

import {
  generatePasswordBasedKeysArgon2,
  generateSymmetricEncryptionKey,
  generateMasterKeyPair,
  exportPublicKeyAsPEM,
  base64EncodeArrayBuffer,
  wrapMasterKey,
  unwrapMasterKey,
  wrapEncryptionKey,
  unwrapCryptoKey,
  serializeWrapAlgorithm,
  deserializeWrapAlgorithm
} from '$lib/crypto';

import {
  storeEncryptionKey,
  storeMasterPrivateKey,
  clearKeys,
  getClientKey,
  storeClientKey,
} from '$lib/stores/encryption_key_store';
import { unwrap } from 'idb';
import type { A } from 'vitest/dist/types-198fd1d9';
import { bubbliClient } from './bubbliClient';

const encoder = new TextEncoder();

export const getCurrentUser = async (fetchFn: Function) => {
  const res = await fetchFn(`${BASE_API_URI}/current_user/`, {
    credentials: 'include'
  });
  if (res.status === 200) {
    // TODO: type API responses
    res.json().then((data: any) => {
      console.log(data);
      return data.user;
    });
  }
  console.log('Error retrieving user data');
  return null;
};

export const logOutUser = async () => {
  fetch(`${BASE_API_URI}/auth/logout/`, {
    method: 'DELETE',
    credentials: 'include'
  })
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.log('Error clearing out login state', error);
    });

  clearUserStore();
  clearKeys();
  invalidateAll();
};

const emailRegex = /^.+@.+\..+$/;
export const validateEmail = (email: string) => {
  return !!email.match(emailRegex);
};

export const register = async (user: User, password: string) => {
  const salt = encoder.encode(user.email);
  // TODO: recovery key - same as password based key but with random phrase
  // generate keys
  const { clientKey: passwordClientKey, rootPasswordHash } = await generatePasswordBasedKeysArgon2(
    password,
    salt
  );

  const rootKeyPair = await generateMasterKeyPair();
  
  const pemExportedPublicKey = await exportPublicKeyAsPEM(rootKeyPair.publicKey);
  const { wrappedKey: passwordWrappedPrivateMasterKey, keyWrapAlgorithm: privateMasterKeyWrapAlgo } = await wrapMasterKey(
    rootKeyPair.privateKey,
    passwordClientKey
  )



  // generates up front a user's timeline encryption key
  const timelineEncryptionKey = await generateSymmetricEncryptionKey();
  const { wrappedKey: wrappedTimelineEncryptionKey, keyWrapAlgorithm: timelineEncryptionKeyWrapAlgo } = await wrapEncryptionKey(
    timelineEncryptionKey,
    rootKeyPair.publicKey,  // encrypt with user's public key
  );

  await storeClientKey("password", passwordClientKey)
  await storeMasterPrivateKey(rootKeyPair.privateKey);
  await storeEncryptionKey("home", timelineEncryptionKey);

  // wait until response to store the user's encryption key so we have the ID
  userStore.set({ ...user, ...{ salt: salt } });
  // return axios.post()

  const encodedClientKeys = [
    {
      type: 'password',
      key_algorithm: rootKeyPair.privateKey.algorithm,
      key_usages: rootKeyPair.privateKey.usages,
      // this inlined mutation seems super sketch to me
      wrap_algorithm: serializeWrapAlgorithm(privateMasterKeyWrapAlgo),
      protected_private_key: base64EncodeArrayBuffer(passwordWrappedPrivateMasterKey)
    }
  ];

  return bubbliClient.post('/auth/register', {
    email: user.email,
    display_name: user.display_name,
    username: user.username,
    public_key: pemExportedPublicKey,
    root_password_hash: base64EncodeArrayBuffer(rootPasswordHash),
    client_keys: encodedClientKeys,
    timeline_key: {
      key_algorithm: timelineEncryptionKey.algorithm,
      key_usages: timelineEncryptionKey.usages,
      wrap_algorithm: serializeWrapAlgorithm(timelineEncryptionKeyWrapAlgo),
      protected_encryption_key: base64EncodeArrayBuffer(wrappedTimelineEncryptionKey)
    },
  })
};

export const login = async (email: string, password: string) => {
  const salt = encoder.encode(email);
  const { clientKey, rootPasswordHash } = await generatePasswordBasedKeysArgon2(
    password,
    salt
  );
  await storeClientKey('password', clientKey);
  return bubbliClient.post("/auth/login", {
    email: email,
    root_password_hash: base64EncodeArrayBuffer(rootPasswordHash),
    client_key_type: "password"
  })
};

export const decryptAndLoadMasterPrivateKey = async (
  encryptedPrivateKey: Uint8Array,
  wrappingAlgorithm: {name: string, iv: Uint8Array},
  privateKeyAlgorithm: AlgorithmIdentifier,
  privateKeyUsages: Array<KeyUsage>
) => {
  const clientKey = await getClientKey('password');
  if (!clientKey || !encryptedPrivateKey || !wrappingAlgorithm || ! privateKeyAlgorithm || !privateKeyUsages) {
    throw new Error('Missing required parameters for decryptAndLoadMasterPrivateKey')
  }
  console.log("unwrapping master key")

  const masterPrivateKey = await unwrapMasterKey(
    encryptedPrivateKey,
    clientKey,
    wrappingAlgorithm,
    privateKeyAlgorithm,
    privateKeyUsages
  )

  console.log("storing master key")
  await storeMasterPrivateKey(masterPrivateKey);
  return masterPrivateKey
};

export const decryptAndLoadEncryptionKeys = async (
  masterPrivateKey: CryptoKey,
  encryptionKeys: Array<{
    protected_encryption_key: Uint8Array;
    wrap_algorithm: KeyAlgorithm,
    key_algorithm: KeyAlgorithm,
    key_usages: Array<KeyUsage>
    encryption_context_id: string;
  }>
) => {
  const encryptionKeyPromises = encryptionKeys.map(async (encryptionKey) => {
    console.log("wrapped encryption key", encryptionKey)
    const decryptedEncryptionKey = await unwrapCryptoKey(
      encryptionKey.protected_encryption_key,
      masterPrivateKey,
      encryptionKey.wrap_algorithm,
      encryptionKey.key_algorithm.name, // this is probably wrong
      encryptionKey.key_usages
    );

    await storeEncryptionKey(encryptionKey.encryption_context_id, decryptedEncryptionKey);
  });

  await Promise.all(encryptionKeyPromises);
}