import SessionKeystore from 'session-keystore';

// TODO: this isn't persisting past refreshes like it says it should

export const masterPrivateKeyConst = 'masterPrivateKey';
export const masterEncryptionKeyConst = 'masterEncryptionKey';
// You can create multiple stores, but give them a unique name:
// (default name is 'default')
export const encryptionKeyStore = new SessionKeystore<
  masterPrivateKeyConst | masterEncryptionKeyConst
>({ name: 'encryptionKey' });

encryptionKeyStore.on('created', ({ name }) => console.log('Key created: ', name));
encryptionKeyStore.on('updated', ({ name }) => console.log('Key updated: ', name));
encryptionKeyStore.on('deleted', ({ name }) => console.log('Key deleted: ', name));
encryptionKeyStore.on('expired', ({ name }) => console.log('Key expired: ', name));
encryptionKeyStore.on('read', ({ name }) => console.log('Key accessed: ', name));
