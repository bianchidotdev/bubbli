import { fromByteArray, toByteArray } from 'base64-js';
import { argon2id } from 'hash-wasm';
import type { IArgon2Options } from 'hash-wasm';
// import { generateMnemonic } from 'bip39';

export type ProtectedContent = {
  protected_content: ArrayBuffer;
  algorithm: Algorithm;
};

const encoder = new TextEncoder();

// Desired key lengths for encryption and authentication (in bytes)
const encryptionKeyByteLength = 32; // 256 bits
const authenticationKeyByteLength = 32; // 256 bits
const clientKeyByteLength = 32; // 256 bits NOTE: must be a multiple of 64 bits to be compatible with AES-KW

const symmetricKeyParams = {
  name: 'AES-GCM',
  length: 256
};

const clientKeyParams = {
  name: 'AES-GCM',
  length: 256
}
const clientKeyUsages: KeyUsage[] = ['wrapKey', 'unwrapKey'];

const masterKeyPairParams = {
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
  hashLength: encryptionKeyByteLength + authenticationKeyByteLength, // output size = 64 bytes
  outputType: 'binary' // return standard encoded string containing parameters needed to verify the key
};

export const generatePasswordBasedKeysArgon2 = async (
  pw: string,
  salt: Uint8Array
): Promise<{ clientKey: CryptoKey; masterPasswordHash: string; }> => {
  // @ts-ignore
  const keyMaterial: Uint8Array = await argon2id({
    ...argon2Options,
    ...{
      password: pw,
      salt
    }
  });

  // key splitting into encryption and authentication "keys"
  const clientKeyMaterial = keyMaterial.slice(0, clientKeyByteLength);
  const authenticationKeyMaterial = keyMaterial.slice(
    clientKeyByteLength,
    clientKeyByteLength + authenticationKeyByteLength
  );

  // client keys are exclusively used for wrapping and unwrapping master private keys
  const clientKey = await crypto.subtle.importKey(
    'raw',
    clientKeyMaterial,
    clientKeyParams,
    true, // TODO: change back to false
    clientKeyUsages
  );

  const authenticationHash = fromByteArray(authenticationKeyMaterial);

  return { clientKey: clientKey, masterPasswordHash: authenticationHash };
};

export const generateSalt = () => {
  return crypto.getRandomValues(new Uint8Array(32));
};

export const generateEncryptionIV = () => {
  return crypto.getRandomValues(new Uint8Array(12));
};

export const generateMasterKeyPair = async () => {
  return await crypto.subtle.generateKey(masterKeyPairParams, true, ["wrapKey", "unwrapKey"]);
};

export const generateSymmetricEncryptionKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(symmetricKeyParams, true, ['encrypt', 'decrypt']);
};

export const encryptMessage = async (
  encryptionKey: CryptoKey,
  message: string,
) => {
  const encodedMessage = encoder.encode(message);
  if (encryptionKey.algorithm.name === 'AES-GCM') {
    const algorithm = {
      name: 'AES-GCM',
      iv: generateEncryptionIV()
    }
    const encryptedMessage = await crypto.subtle.encrypt(
      algorithm,
      encryptionKey,
      encodedMessage
    )
    return { encryptedMessage, algorithm };
  } else {
    throw new Error(`Unsupported encryption algorithm: ${encryptionKey.algorithm.name}`)
  }
}

export const decryptMessage = async (
  encryptionKey: CryptoKey,
  encryptedMessage: Uint8Array,
  iv: Uint8Array
) => {
  return crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    encryptionKey,
    encryptedMessage
  );
}

export const wrapMasterKey = async (
  cryptoKey: CryptoKey,
  wrappingKey: CryptoKey,
): Promise<{wrappedKey: ArrayBuffer, keyWrapAlgorithm: AlgorithmIdentifier}> => {
  const keyWrapAlgorithm = {
    name: "AES-GCM",
    iv: generateEncryptionIV()
  } 
  const wrappedKey = await crypto.subtle.wrapKey('pkcs8', cryptoKey, wrappingKey, keyWrapAlgorithm);
  return { wrappedKey, keyWrapAlgorithm };
}

export const unwrapMasterKey = async (
  wrappedCryptoKey: ArrayBuffer,
  wrappingKey: CryptoKey,
  wrappingAlgorithm: AlgorithmIdentifier,
  keyAlgorithm: AlgorithmIdentifier,
  keyUsages: Array<KeyUsage>
): Promise<CryptoKey> => {
  console.log('pkcs8', wrappedCryptoKey, wrappingKey, wrappingAlgorithm, keyAlgorithm, false, keyUsages)
  return await crypto.subtle.unwrapKey('pkcs8', wrappedCryptoKey, wrappingKey, wrappingAlgorithm, keyAlgorithm, false, keyUsages);
}

export const wrapEncryptionKey = async (
  cryptoKey: CryptoKey,
  wrappingKey: CryptoKey,
): Promise<{wrappedKey: ArrayBuffer, keyWrapAlgorithm: any}> => {
  // const iv = generateEncryptionIV();
  const keyWrapAlgorithm = {
    name: "RSA-OAEP",
    // iv: iv // TODO: is this not necessary?
  }
  const wrappedKey = await crypto.subtle.wrapKey('raw', cryptoKey, wrappingKey, keyWrapAlgorithm);
  return { wrappedKey, keyWrapAlgorithm };
}

export const wrapCryptoKey = async (
  cryptoKey: CryptoKey,
  wrappingKey: CryptoKey,
  keyWrapAlgorithm: AlgorithmIdentifier,
): Promise<{wrappedKey: ArrayBuffer, keyWrapAlgorithm: AlgorithmIdentifier}> => {
  console.log('raw', cryptoKey, wrappingKey, keyWrapAlgorithm)
  const wrappedKey = await crypto.subtle.wrapKey('raw', cryptoKey, wrappingKey, keyWrapAlgorithm);
  return { wrappedKey, keyWrapAlgorithm };
}

export const unwrapCryptoKey = async (
  wrappedCryptoKey: ArrayBuffer,
  wrappingKey: CryptoKey,
  wrappingAlgorithm: AlgorithmIdentifier,
  keyAlgorithm: AlgorithmIdentifier,
  keyUsages: Array<KeyUsage>
): Promise<CryptoKey> => {
  console.log('raw', wrappedCryptoKey, wrappingKey, wrappingAlgorithm, keyAlgorithm, keyUsages)
  return await crypto.subtle.unwrapKey('raw', wrappedCryptoKey, wrappingKey, wrappingAlgorithm, keyAlgorithm, true, keyUsages);
}

// export const encryptAsymmetricKey = async (
//   encryptionKey: CryptoKey,
//   cryptoKey: CryptoKey,
//   iv: Uint8Array
// ): Promise<ArrayBuffer> => {
//   return await crypto.subtle.wrapKey('pkcs8', cryptoKey, encryptionKey, {
//     name: 'AES-GCM',
//     iv: iv
//   });
// };

// export const decryptAsymmetricKey = async (
//   encryptionKey: CryptoKey,
//   encryptedAsymmetricKey: Uint8Array,
//   iv: Uint8Array
// ): Promise<CryptoKey> => {
//   return await crypto.subtle.unwrapKey(
//     'pkcs8',
//     encryptedAsymmetricKey,
//     encryptionKey,
//     {
//       name: 'AES-GCM',
//       iv: iv
//     },
//     asymmetricKeyPairParams,
//     true,
//     // Can't have encrypt here because only the public key of RSA-OAEP can be used for encryption
//     // https://stackoverflow.com/questions/76403336/javascript-webcryptoapi-why-does-this-not-satisfy-operation-specific-requiremen
//     ['decrypt']
//   );
// };

// // TODO: I really need to shore up what's going on here
// // I can't just have this generic method - it's not that simple
// export const encryptSymmetricKey = async (
//   encryptionKey: CryptoKey,
//   cryptoKey: CryptoKey,
//   iv: Uint8Array
// ): Promise<ArrayBuffer> => {
//   return await crypto.subtle.wrapKey('raw', cryptoKey, encryptionKey, {
//     name: 'AES-GCM',
//     iv: iv
//   });
// };

// // TODO: should we use AES-KW?
// // *sigh* doesn't work with RSA keys
// // https://stackoverflow.com/questions/72607534/how-to-use-crypto-subtle-wrapkey-to-wrap-an-rsa-pss-private-key-using-aes-kw
// export const decryptSymmetricKey = async (
//   encryptionKey: CryptoKey,
//   encryptedSymmetricKey: ArrayBuffer,
//   iv: ArrayBuffer
// ): Promise<CryptoKey> => {
//   return await crypto.subtle.unwrapKey(
//     'raw',
//     encryptedSymmetricKey,
//     encryptionKey,
//     {
//       name: 'AES-GCM',
//       iv: iv
//     },
//     asymmetricKeyPairParams,
//      true,
//     ['encrypt', 'decrypt']
//   );
// }

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

// TODO: why so hard to type
export const serializeWrapAlgorithm = (wrapAlgorithm: any) => {
  if (typeof wrapAlgorithm === 'string') {
    return wrapAlgorithm;
  }
  return {
    ...wrapAlgorithm,
    iv: base64EncodeArrayBuffer(wrapAlgorithm.iv)
  }
}

export const deserializeWrapAlgorithm = (wrapAlgorithm: any) => {
  if (typeof wrapAlgorithm === 'string') {
    return wrapAlgorithm;
  }
  return {
    ...wrapAlgorithm,
    iv: toByteArray(wrapAlgorithm.iv)
  }
}