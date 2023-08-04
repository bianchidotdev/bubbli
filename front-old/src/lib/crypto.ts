
import { fromByteArray } from "base64-js";

const encoder = new TextEncoder();

export const generatePasswordBasedEncryptionKey = async (pw: string, salt: Uint8Array) => {
  const passwordAsBytes = encoder.encode(pw);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordAsBytes,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 600000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );

  return key;
}

export const generateClientKeyPair = async () => {
  return await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-384",
    },
    true,
    ["sign", "verify"]
  );
}

export const signMessage = async (keyPair: CryptoKeyPair, message: string) => {
  const encodedMessage = encoder.encode(message);
  return crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-384" },
    },
    keyPair.privateKey,
    encodedMessage
  )
}

export const encryptCryptoKey = async (encryptionKey: CryptoKey, cryptoKey: CryptoKey, iv: Uint8Array) => {
  console.log("generating random IV");
  return await crypto.subtle.wrapKey(
    "pkcs8",
    cryptoKey,
    encryptionKey,
    {
      name: "AES-GCM",
      iv: iv
    }
  )
}

export const base64EncodeArrayBuffer = (arrayBuffer: ArrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  return fromByteArray(bytes);
}
