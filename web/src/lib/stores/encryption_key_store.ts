// storage for encryption keys and the user's master private key pair
// We need to store an encryption key per encryption context, at the very least that means one per timeline.
// Encryption keys should be stored as non-exportable

import { openDB } from 'idb';
import type { DBSchema } from 'idb';

const keyStoreDBName = 'encryption-key-store';
const keyStoreName = 'key-store';

interface KeyStoreDBV1 extends DBSchema {
  'key-store': {
    key: string;
    value: CryptoKey;
  };
}

export const masterPrivateKeyConst = 'masterPrivateKey';
// TODO: what the hickity heck was I thinking? What's a master encryption key? :sigh:
export const masterEncryptionKeyConst = 'masterEncryptionKey';

export const getKey = async (keyType: string): Promise<CryptoKey | undefined> => {
  return (await openKeyStore()).get(keyStoreName, keyType);
};

export const storeKey = async (keyType: string, keyContent: CryptoKey): Promise<string> => {
  return (await openKeyStore()).put(keyStoreName, keyContent, keyType);
};

export const deleteKey = async (keyType: string): Promise<void> => {
  return (await openKeyStore()).delete(keyStoreName, keyType);
};

export const clearKeys = async (): Promise<void> => {
  return (await openKeyStore()).clear(keyStoreName);
};
export const listKeys = async (): Promise<string[]> => {
  return (await openKeyStore()).getAllKeys(keyStoreName);
}

const openKeyStore = async () => {
  const db = await openDB<KeyStoreDBV1>(keyStoreDBName, 1, {
    upgrade(db) {
      db.createObjectStore(keyStoreName);
    },
  });
  return db;
}

// NOTE: the session_keystore isn't persisting past refreshes like it says it should
// Alright, so here's what we're going to do.
// store the unexportable master encryption key and the encrypted private key in indexedDB.
// With that, we'll have longer term storage and supposedly it's ok to store unexportable
// crypto keys in indexedDB.
// example: https://gist.github.com/saulshanabrook/b74984677bccd08b028b30d9968623f5
// another: https://blog.engelke.com/2014/09/19/saving-cryptographic-keys-in-the-browser/

// Previous implementation using session keystore
// import SessionKeystore from 'session-keystore';

// // You can create multiple stores, but give them a unique name:
// // (default name is 'default')
// export const encryptionKeyStore = new SessionKeystore<
//   masterPrivateKeyConst | masterEncryptionKeyConst
// >({ name: 'encryptionKey' });

// encryptionKeyStore.on('created', ({ name }) => console.log('Key created: ', name));
// encryptionKeyStore.on('updated', ({ name }) => console.log('Key updated: ', name));
// encryptionKeyStore.on('deleted', ({ name }) => console.log('Key deleted: ', name));
// encryptionKeyStore.on('expired', ({ name }) => console.log('Key expired: ', name));
// encryptionKeyStore.on('read', ({ name }) => console.log('Key accessed: ', name));
