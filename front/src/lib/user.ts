import { BASE_API_URI } from '$lib/constants';
import { user } from '../stores/user';
import { get } from 'svelte/store';
import { fromByteArray } from 'base64-js';
import { goto, invalidateAll } from '$app/navigation';

import {
  generatePasswordBasedKeysArgon2,
  generateSymmetricEncryptionKey,
  generateClientKeyPair,
  generateSalt,
  generateEncryptionIV,
  encryptAsymmetricKey,
  encryptSymmetricKey,
  exportPublicKeyAsPEM,
  base64EncodeArrayBuffer
} from '$lib/crypto';

export const getCurrentUser = async (fetchFn) => {
  const res = await fetchFn(`${BASE_API_URI}/current_user/`, {
    credentials: 'include'
  });
  if (res.status === 200) {
    res.json().then((data) => {
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

  user.set({});
  invalidateAll();
  goto('/login');
};

const emailRegex = /^.+@.+\..+$/;
export const validateEmail = (email) => {
  return !!email.match(emailRegex);
};

export const registrationStart = async (email, displayName) => {
  return fetch(`${BASE_API_URI}/registration/start`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      display_name: displayName
    })
  });
};

export const registrationVerify = async (password, recoveryPhrase) => {
  const salt = generateSalt();
  const privateKeyEncryptionIV = generateEncryptionIV();
  const recoveryKeyEncryptionIV = generateEncryptionIV();
  const userKeyEncryptionIV = generateEncryptionIV();
  // generate keys
  const { encryptionKey, masterPasswordHash } = await generatePasswordBasedKeysArgon2(
    password,
    salt
  );

  const { encryptionKey: recoveryKey } = await generatePasswordBasedKeysArgon2(
    recoveryPhrase,
    salt
  );

  // TODO: I don't have to generate a random symmetric key and encrypt it here
  //   because it'll get generated for each encryption context
  //   though maybe it's worth generating the user's timeline at this step
  const clientKeyPair = await generateClientKeyPair();
  const pemExportedPublicKey = await exportPublicKeyAsPEM(clientKeyPair.publicKey);
  const pwEncPrivateKey = await encryptAsymmetricKey(
    encryptionKey,
    clientKeyPair.privateKey,
    privateKeyEncryptionIV
  );
  const recoveryEncPrivateKey = await encryptAsymmetricKey(
    recoveryKey,
    clientKeyPair.privateKey,
    recoveryKeyEncryptionIV
  );
  const clientKeys = [
    {
      type: 'password',
      encryption_iv: fromByteArray(privateKeyEncryptionIV),
      encrypted_private_key: base64EncodeArrayBuffer(pwEncPrivateKey)
    },
    {
      type: 'recovery',
      encryption_iv: fromByteArray(recoveryKeyEncryptionIV),
      encrypted_private_key: base64EncodeArrayBuffer(recoveryEncPrivateKey)
    }
  ];

  const userSymmetricEncryptionKey = await generateSymmetricEncryptionKey(salt);
  console.log('wrapping user encryption key');
  const encryptedUserEncryptionKey = await encryptSymmetricKey(
    encryptionKey,
    userSymmetricEncryptionKey,
    userKeyEncryptionIV
  );
  console.log('wrapped user encryption key');

  // TODO: store encryption key in secret session store
  const tmpUser = get(user);
  user.set({ ...tmpUser, ...{ salt: salt } });
  return fetch(`${BASE_API_URI}/registration/confirm`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: tmpUser.email,
      display_name: tmpUser.displayName,
      salt: fromByteArray(salt),
      public_key: pemExportedPublicKey,
      master_password_hash: masterPasswordHash,
      client_keys: clientKeys,
      encrypted_user_encryption_key: encryptedUserEncryptionKey
    })
  });
};

export const loginStart = async (email) => {
  return fetch(`${BASE_API_URI}/auth/login_start`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email
    })
  });
};

export const loginVerify = async (email: string, password: string, salt: Uint8Array) => {
  console.log(email, password, salt);
  const { encryptionKey, masterPasswordHash } = await generatePasswordBasedKeysArgon2(
    password,
    salt
  );
  // TODO: store encryptionKey securely
  return fetch(`${BASE_API_URI}/auth/login_verify`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      master_password_hash: masterPasswordHash,
      client_key_type: 'password'
    })
  });
};
