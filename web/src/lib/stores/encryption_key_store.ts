// storage for encryption keys and the user's master private key pair
// We need to store an encryption key per encryption context, at the very least that means one per timeline.
// Encryption keys should be stored as non-exportable

import { openDB } from 'idb';
import type { DBSchema } from 'idb';

const keyStoreDBName = 'key-store';
const masterKeyStore = 'master-private-key';
const encryptionKeyStore = 'encryption-keys';
const clientKeyStore = 'client-keys';

interface KeyStoreDBV1 extends DBSchema {
  'master-private-key': {
    key: string;
    value: CryptoKey;
  };
  'encryption-keys': {
    key: string;
    value: CryptoKey;
  };
  'client-keys': {
    key: string;
    value: CryptoKey;
  };
}

export const getMasterPrivateKey = async (): Promise<CryptoKey | undefined> => {
  // TODO: figure out what key to store this as
  return (await openKeyStore()).get(masterKeyStore, 'primary');
}

export const storeMasterPrivateKey = async (keyContent: CryptoKey): Promise<string> => {
  return (await openKeyStore()).put(masterKeyStore, keyContent, 'primary');
}

export const getClientKey = async (keyType: string): Promise<CryptoKey | undefined> => {
  return (await openKeyStore()).get(clientKeyStore, keyType);
}

export const storeClientKey = async (keyType: string, keyContent: CryptoKey): Promise<string> => {
  return (await openKeyStore()).put(clientKeyStore, keyContent, keyType);
}

export const getEncryptionKey = async (encryptionContextID: string): Promise<CryptoKey | undefined> => {
  return (await openKeyStore()).get(encryptionKeyStore, encryptionContextID);
};

export const storeEncryptionKey = async (encryptionContextID: string, keyContent: CryptoKey): Promise<string> => {
  return (await openKeyStore()).put(encryptionKeyStore, keyContent, encryptionContextID);
};

export const deleteEncryptionKey = async (encryptionContextID: string): Promise<void> => {
  return (await openKeyStore()).delete(encryptionKeyStore, encryptionContextID);
};

export const clearKeys = async (): Promise<void> => {
  (await openKeyStore()).clear(masterKeyStore);
  (await openKeyStore()).clear(encryptionKeyStore);
};

export const listEncryptionKeys = async (): Promise<string[]> => {
  return (await openKeyStore()).getAllKeys(encryptionKeyStore);
}

const openKeyStore = async () => {
  const db = await openDB<KeyStoreDBV1>(keyStoreDBName, 1, {
    upgrade(db) {
      db.createObjectStore(masterKeyStore);
      db.createObjectStore(encryptionKeyStore);
      db.createObjectStore(clientKeyStore);
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
