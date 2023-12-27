import { fromByteArray } from 'base64-js';
import { argon2id } from 'hash-wasm';
import type { IArgon2Options } from 'hash-wasm';

// Desired key lengths for encryption and authentication (in bytes)
const encryptionKeyLength = 32; // 256 bits
const authenticationKeyLength = 32; // 256 bits

const symmetricKeyParams = {
  name: 'AES-GCM',
  length: 256
};

const clientKeyUsages: KeyUsage[] = ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'];

const asymmetricKeyPairParams = {
  name: 'RSA-OAEP',
  modulusLength: 4096,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256'
};

// https://bitwarden.com/help/kdf-algorithms/#argon2id
const argon2Options: Partial<IArgon2Options> = {
  parallelism: 4,
  iterations: 3,
  memorySize: 65536, // use 64MiB memory
  hashLength: encryptionKeyLength + authenticationKeyLength, // output size = 64 bytes
  outputType: 'binary' // return standard encoded string containing parameters needed to verify the key
};

export const generatePassphraseBasedKeysArgon2 = async (
  pw: string,
  salt: Uint8Array
): Promise<{ encryptionKey: CryptoKey; authenticationHash: string; }> => {
  // @ts-ignore
  const keyMaterial: Uint8Array = await argon2id({
    ...argon2Options,
    ...{
      password: pw,
      salt
    }
  });

  // key splitting into encryption and authentication "keys"
  const encryptionKeyMaterial = keyMaterial.slice(0, encryptionKeyLength);
  const authenticationKeyMaterial = keyMaterial.slice(
    encryptionKeyLength,
    encryptionKeyLength + authenticationKeyLength
  );

  const encryptionKey = await crypto.subtle.importKey(
    'raw',
    encryptionKeyMaterial,
    symmetricKeyParams,
    false,
    clientKeyUsages
  );

  const authenticationHash = fromByteArray(authenticationKeyMaterial);

  return { encryptionKey: encryptionKey, authenticationHash: authenticationHash };
};

export const generateSalt = () => {
  return crypto.getRandomValues(new Uint8Array(32));
};

export const generateEncryptionIV = () => {
  return crypto.getRandomValues(new Uint8Array(12));
};

export const generateClientKeyPair = async () => {
  return await crypto.subtle.generateKey(asymmetricKeyPairParams, true, ['encrypt', 'decrypt']);
};

export const generateSymmetricEncryptionKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(symmetricKeyParams, true, ['encrypt', 'decrypt']);
};

// TODO: Why is encrypting asymmetric keys different from encrypting symmetric keys?
export const encryptAsymmetricKey = async (
  encryptionKey: CryptoKey,
  cryptoKey: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> => {
  return await crypto.subtle.wrapKey('pkcs8', cryptoKey, encryptionKey, {
    name: 'AES-GCM',
    iv: iv
  });
};

export const decryptAsymmetricKey = async (
  encryptionKey: CryptoKey,
  encryptedAsymmetricKey: Uint8Array,
  iv: Uint8Array
): Promise<CryptoKey> => {
  return await crypto.subtle.unwrapKey(
    'pkcs8',
    encryptedAsymmetricKey,
    encryptionKey,
    {
      name: 'AES-GCM',
      iv: iv
    },
    asymmetricKeyPairParams,
    true,
    // Can't have encrypt here because only the public key of RSA-OAEP can be used for encryption
    // https://stackoverflow.com/questions/76403336/javascript-webcryptoapi-why-does-this-not-satisfy-operation-specific-requiremen
    ['decrypt']
  );
};

export const encryptSymmetricKey = async (
  encryptionKey: CryptoKey,
  cryptoKey: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> => {
  return await crypto.subtle.wrapKey('raw', cryptoKey, encryptionKey, {
    name: 'AES-GCM',
    iv: iv
  });
};

export const exportPublicKeyAsPEM = async (publicKey: CryptoKey) => {
  const exportedPublicKey = await crypto.subtle.exportKey('spki', publicKey);
  return `-----BEGIN PUBLIC KEY-----\n${base64EncodeArrayBuffer(
    exportedPublicKey
  )}\n-----END PUBLIC KEY-----`;
};

export const base64EncodeArrayBuffer = (arrayBuffer: ArrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  return fromByteArray(bytes);
};
