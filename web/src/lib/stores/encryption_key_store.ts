import SessionKeystore from 'session-keystore';

// TODO: this isn't persisting past refreshes like it says it should
// Alright, so here's what we're going to do.
// store the unexportable master encryption key and the encrypted private key in indexedDB.
// With that, we'll have longer term storage and supposedly it's ok to store unexportable
// crypto keys in indexedDB.
// example: https://gist.github.com/saulshanabrook/b74984677bccd08b028b30d9968623f5
// another: https://blog.engelke.com/2014/09/19/saving-cryptographic-keys-in-the-browser/

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
