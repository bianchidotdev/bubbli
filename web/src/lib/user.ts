import { BASE_API_URI } from '$lib/constants';
import { userStore } from '$lib/stores/user_store';
import { fromByteArray } from 'base64-js';
import { invalidateAll } from '$app/navigation';

import {
  generatePasswordBasedKeysArgon2,
  generateSymmetricEncryptionKey,
  generateClientKeyPair,
  generateEncryptionIV,
  decryptAsymmetricKey,
  encryptAsymmetricKey,
  encryptSymmetricKey,
  exportPublicKeyAsPEM,
  base64EncodeArrayBuffer
} from '$lib/crypto';

import {
  encryptionKeyStore,
  masterPrivateKeyConst,
  masterEncryptionKeyConst
} from '$lib/stores/encryption_key_store';

const encoder = new TextEncoder();

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

  userStore.set({});
  encryptionKeyStore.clear();
  invalidateAll();
};

const emailRegex = /^.+@.+\..+$/;
export const validateEmail = (email) => {
  return !!email.match(emailRegex);
};

// export const registrationStart = async (email, displayName) => {
//   return fetch(`${BASE_API_URI}/registration/start`, {
//     method: 'POST',
//     mode: 'cors',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       email: email,
//       display_name: displayName
//     })
//   });
// };

export const register = async (user, password) => {
  const salt = encoder.encode(user.email);
  const privateKeyEncryptionIV = generateEncryptionIV();
  // const recoveryKeyEncryptionIV = generateEncryptionIV();
  const userKeyEncryptionIV = generateEncryptionIV();
  // TODO const recoveryPhrase =
  // generate keys
  const { encryptionKey, masterPasswordHash } = await generatePasswordBasedKeysArgon2(
    password,
    salt
  );

  // const { encryptionKey: recoveryKey } = await generatePasswordBasedKeysArgon2(
  //   recoveryPhrase,
  //   salt
  // );

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
  // const recoveryEncPrivateKey = await encryptAsymmetricKey(
  //   recoveryKey,
  //   clientKeyPair.privateKey,
  //   recoveryKeyEncryptionIV
  // );
  const clientKeys = [
    {
      type: 'password',
      encryption_iv: fromByteArray(privateKeyEncryptionIV),
      encrypted_private_key: base64EncodeArrayBuffer(pwEncPrivateKey)
    }
    // {
    //   type: 'recovery',
    //   encryption_iv: fromByteArray(recoveryKeyEncryptionIV),
    //   encrypted_private_key: base64EncodeArrayBuffer(recoveryEncPrivateKey)
    // }
  ];

  const userSymmetricEncryptionKey = await generateSymmetricEncryptionKey(salt);
  console.log('wrapping user encryption key');
  const encryptedUserEncryptionKey = await encryptSymmetricKey(
    encryptionKey,
    userSymmetricEncryptionKey,
    userKeyEncryptionIV
  );
  console.log('wrapped user encryption key');

  console.log(encryptionKey, clientKeyPair.privateKey);
  encryptionKeyStore.set(masterEncryptionKeyConst, encryptionKey);
  encryptionKeyStore.set(masterPrivateKeyConst, clientKeyPair.privateKey);
  userStore.set({ ...user, ...{ salt: salt } });
  return fetch(`${BASE_API_URI}/register`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: user.email,
      display_name: user.displayName,
      username: user.username,
      // salt: fromByteArray(salt),
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
  encryptionKeyStore.set('masterEncryptionKey', encryptionKey);
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

export const decryptAndLoadMasterPrivateKey = async (
  encryptedPrivateKey,
  encryptedPrivateKeyIV
) => {
  const encryptionKey = encryptionKeyStore.get('masterEncryptionKey');
  if (!encryptionKey || !encryptedPrivateKey || !encryptedPrivateKeyIV) {
    return { error: 'Missing required keys' };
  }

  const masterPrivateKey = await decryptAsymmetricKey(
    encryptionKey,
    encryptedPrivateKey,
    encryptedPrivateKeyIV
  );

  encryptionKeyStore.set('masterPrivateKey', masterPrivateKey);
  console.log(masterPrivateKey);
};
