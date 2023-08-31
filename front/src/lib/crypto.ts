import { fromByteArray } from 'base64-js';
import { argon2id } from 'hash-wasm';
import { generateMnemonic } from 'bip39';

const encoder = new TextEncoder();

// Desired key lengths for encryption and authentication (in bytes)
const encryptionKeyLength = 32; // 256 bits
const authenticationKeyLength = 32; // 256 bits

const symmetricKeyParams = {
  name: 'AES-GCM',
  length: 256
};

const asymmetricKeyPairParams = {
  name: 'RSA-OAEP',
  modulusLength: 4096,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256'
};

// https://bitwarden.com/help/kdf-algorithms/#argon2id
const argon2Options = {
  parallelism: 4,
  iterations: 3,
  memorySize: 65536, // use 64MB memory
  hashLength: encryptionKeyLength + authenticationKeyLength, // output size = 64 bytes
  outputType: 'binary' // return standard encoded string containing parameters needed to verify the key
};

export const generateRecoveryPhrase = async (): string => {
  return generateMnemonic();
  return { recoveryPhrase: recoveryPhrase, recoveryKey: recoveryKey };
};

export const generatePasswordBasedEncryptionKeyPBKDF2 = async (pw: string, salt: Uint8Array) => {
  const passwordAsBytes = encoder.encode(pw);
  const keyMaterial = await crypto.subtle.importKey('raw', passwordAsBytes, 'PBKDF2', false, [
    'deriveBits',
    'deriveKey'
  ]);
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 600000,
      hash: 'SHA-256'
    },
    keyMaterial,
    symmetricKeyParams,
    true,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );

  return key;
};

export const generatePasswordBasedKeysArgon2 = async (
  pw: string,
  salt: Uint8Array
): { encryptionKey: CryptoKey; masterPasswordHash: string } => {
  const keyMaterial = await argon2id({
    ...argon2Options,
    ...{
      password: pw,
      salt
    }
  });

  const encryptionKeyMaterial = keyMaterial.slice(0, encryptionKeyLength);
  const authenticationKeyMaterial = keyMaterial.slice(
    encryptionKeyLength,
    encryptionKeyLength + authenticationKeyLength
  );

  const encryptionKey = await crypto.subtle.importKey(
    'raw',
    encryptionKeyMaterial,
    symmetricKeyParams,
    true,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );

  const authenticationHash = fromByteArray(authenticationKeyMaterial);

  return { encryptionKey: encryptionKey, masterPasswordHash: authenticationHash };
};

export const generateMasterPasswordHashPBKDF2 = async (
  passwordBasedEncKey: CryptoKey,
  pw: string
) => {
  const passwordAsBytes = encoder.encode(pw);

  const exported = await crypto.subtle.exportKey('raw', passwordBasedEncKey);

  const keyMaterial = await crypto.subtle.importKey('raw', exported, 'PBKDF2', false, [
    'deriveBits'
  ]);

  const buffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: passwordAsBytes,
      iterations: 1,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  return new Uint8Array(buffer);
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

export const generateSymmetricEncryptionKey = async (): CryptoKey => {
  return await crypto.subtle.generateKey(symmetricKeyParams, true, ['encrypt', 'decrypt']);
};

// export const signMessage = async (keyPair: CryptoKeyPair, message: string) => {
//   const encodedMessage = encoder.encode(message);
//   return crypto.subtle.sign(
//     {
//       name: 'ECDSA',
//       hash: { name: 'SHA-384' }
//     },
//     keyPair.privateKey,
//     encodedMessage
//   );
// };

export const encryptAsymmetricKey = async (
  encryptionKey: CryptoKey,
  cryptoKey: CryptoKey,
  iv: Uint8Array
): UInt8Array => {
  return await crypto.subtle.wrapKey('pkcs8', cryptoKey, encryptionKey, {
    name: 'AES-GCM',
    iv: iv
  });
};

export const encryptSymmetricKey = async (
  encryptionKey: CryptoKey,
  cryptoKey: CryptoKey,
  iv: Uint8Array
): Uint8Array => {
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
