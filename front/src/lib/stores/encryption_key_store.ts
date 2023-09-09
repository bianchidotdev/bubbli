import SessionKeystore from 'session-keystore';

// You can create multiple stores, but give them a unique name:
// (default name is 'default')
export const encryptionKeyStore = new SessionKeystore({ name: 'encryptionKey' });
