import { BASE_API_URI } from '$lib/constants';
import { user } from '../stores/user';
import { fromByteArray } from 'base64-js';

import {
  generatePasswordBasedEncryptionKey,
  generateClientKeyPair,
  generateSalt,
  generateEncryptionIV,
  signMessage,
  encryptCryptoKey,
  exportPublicKeyAsPEM,
  base64EncodeArrayBuffer
} from '$lib/crypto';

export const getCurrentUser = async () => {
  const res = await fetch(`${BASE_API_URI}/current_user/`, {
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
  const res = await fetch(`${BASE_API_URI}/auth/logout/`, {
    method: 'DELETE',
    credentials: 'include'
  });

  user.set(null);
};

const emailRegex = /^.+@.+\..+$/;
export const validateEmail = (email) => {
  return !!email.match(emailRegex);
};

export const registrationStart = async (email) => {
  return fetch(`${BASE_API_URI}/registration/start`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      first_name: firstName
    })
  });
};

export const registrationVerify = async (password, challenge) => {
  $user.salt = generateSalt();
  const privateKeyEncryptionIV = generateEncryptionIV();
  // generate keys
  $user.passwordBasedEncryptionKey = await generatePasswordBasedEncryptionKey(password, $user.salt);
  $user.clientKeyPair = await generateClientKeyPair();
  const signedChallenge = await signMessage($user.clientKeyPair, challenge);
  const pemExportedPublicKey = await exportPublicKeyAsPEM($user.clientKeyPair.publicKey);
  const encPrivateKey = await encryptCryptoKey(
    $user.passwordBasedEncryptionKey,
    $user.clientKeyPair.privateKey,
    privateKeyEncryptionIV
  );
  const clientKeys = [
    {
      type: 'password',
      encryption_iv: fromByteArray(privateKeyEncryptionIV)
    }
    // TODO(bianchi): Recovery codes
  ];
  await fetch(`${BASE_API_URI}/registration/confirm`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: $user.email,
      first_name: $user.firstName,
      challenge: challenge,
      signed_challenge: base64EncodeArrayBuffer(signedChallenge),
      salt: fromByteArray($user.salt),
      public_key: pemExportedPublicKey,
      encrypted_private_key: base64EncodeArrayBuffer(encPrivateKey),
      client_keys: clientKeys
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

export const loginVerify = async () => {
  return fetch(`${BASE_API_URI}/auth/login_verify`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
};
