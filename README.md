# Bubbli

An end-to-end encrypted social media app supporting user timelines, groups, and DMs (eventually).

## Install

Requirements:
* [Taskfile](https://taskfile.dev/)
* [Caddy](https://caddyserver.com/docs/install)
* Elixir and Erlang
* NodeJS
* Go (for running Dagger CI)
* Postgres 15

Language versioning is managed using [`rtx`](https://github.com/jdx/rtx) and current versions can be installed with `rtx install` in the root Bubbli directory

``` sh
# installs taskfile
brew install go-task/tap/go-task
# installs caddy, rtx, and all languages
task installdeps
# installs caddy local https certs
task caddysetup
# starts the caddy server, the frontent webapp, and the backend server
task up
```

## Components

* Caddy - reverse proxy for local HTTPS and routing from the browser to either the web server or the backend app server
* Web - The frontent svelte-based browser app
* App - The backend phoenix server


## Encryption scheme
Heavily inspired by [BitWarden's Security Whitepaper](https://bitwarden.com/images/resources/security-white-paper-download.pdf).

**Prose Summary:**
This project has three layers of encryption, necessary for encrypted many-to-many communications (as far as I know).

1. Client-specific symmetric encryption keys
2. A master asymmetric key pair used for encrypting and decrypting context-specific encryption keys
3. Context-specific symmetric encryption keys used to encrypt actual content

### Client Symmetric Keys

Everything starts with the Client Keys. These are deterministically generated symmetric keys that never leave the client in any form.

Right now, this includes just password and recovery code derived keys, though at some point this could also include hmac-secret derived keys from the webauthn flow.

This key derivation is done using Argon2 password hashing function (specifically argon2id), using the following parameters:
* Memory Cost: 64MiB
* Time cost: 3
* Parallelism degree: 4

These parameters are lifted from [BitWarden's default recommendations](https://bitwarden.com/help/kdf-algorithms/#argon2id).

> **Note**
> On the client side, the argon2id algorithm outputs 512 bits (64 bytes) which is then split between the encryption key and the master password hash (used for authentication). The master password hash is then run through the same hashing function on the server side before being stored in the database.

The Argon2 derived password hash output is then imported as the material for an AES-GCM 256-bit symmetric encryption key.

### Master User Key Pair

The asymmetric key pair is generated randomly client-side on user registration and stored in session storage using [session-keystore](https://github.com/47ng/session-keystore).

An RSA-OAEP key pair with modulus length 4096 bits is used as the user master kep pair.

The private key is encrypted by each of the client keys (password + recovery codes) and sent to the server along with the public key.

> **Note**
> The derived symmetric keys are used to encrypt the asymmetric master private key before sending to the server. The protected/wrapped master private key is sent to the server because as far as I can tell, there's no regular way to deterministically derive an asymmetric key pair from a password or other user provided information (possibly a yubikey could achieve this, but I wouldn't want that to be a requirement).

### Context-specific Symmetric Keys

Symmetric encryption keys are generated client-side for each "encryption context" on creation. The first time this happens is on user registration when an encryption key is generated for that user's timeline. 

The client will also generate a symmetric key every time they create a new encryption context, such as a new group. These keys are AES-GCM 256-bit symmetric encryption keys similar to the user's master encryption key.

Before sending the encryption key to the server, the client will encrypt the context-specific encryption key with each of the public keys that should have access to the content.

Example: If a user creates a new group and selects 5 friends to join, a new symmetric encryption key will be generate on the client side and then encrypted 6 times with different public keys (once for the acting user and once for each friend).
The encrypted keys are sent to the server as part of the group creation API call and stored in the database.

Every time a user connects with a friend or adds a friend to a group, they will encrypt the context-specific encryption key with their friend's public key and send the protected symmetric key to the server.

### Diagram:
[Encryption Scheme Mermaid Diagram](encryption-scheme.mmd)
