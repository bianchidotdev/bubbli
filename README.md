# Bubbli

An end-to-end encrypted social media app supporting user timelines, groups, and DMs (eventually).


## Encryption scheme
Heavily inspired by [BitWarden's Security Whitepaper](https://bitwarden.com/images/resources/security-white-paper-download.pdf).

```mermaid

flowchart LR
    %% Variables
    PW{{User Password}}
    style PW fill:#f9f,stroke:#333,stroke-width:4px

    PWARGON["
        fa:fa-lock Argon2id PBKDF
        Hash Length: 512 bits (64 bytes)
        M: 64MiB - I: 3 - P: 4
        Salt: Randomly Generated
        Payload: Password
    "]

    MASTER{{fa:fa-key Master Encryption Key}}
    style MASTER fill:#0FF,stroke:#333,stroke-width:4px

    PWHASH{{fa:fa-shield-alt Master Password Hash}}
    style PWHASH fill:#0FF,stroke:#333,stroke-width:4px

    KEYWRAP["
        fa:fa-lock AES-256 bit Encryption
        IV: Initialization Vector
        Payload: Private Key
        Key: Master Encryption Key
    "]
    GENAKEY["
        fa:fa-random Generate Asymmetric Key Pair
        Algorithm: RSA-OAEP
        Modulus Length: 4096
    "]
    WRAPPEDAKEY{{fa:fa-shield-alt Protected/Wrapped Private Key}}
    style WRAPPEDAKEY fill:#0FF,stroke:#333,stroke-width:4px
    WRAPCONTEXTKEY["
        fa:fa-key RSA Public Key Encryption
        Payload: Encryption Context Symmetric Key
        Key: Public Key
    "]
    GENSKEY["
        fa:fa-random Generate Encryption Context Symmetric Key
        Encryption Key: 256 bits
    "]
    WRAPPEDSKEY{{fa:fa-shield-alt Protected Encryption Context Key}}
    style WRAPPEDSKEY fill:#0FF,stroke:#333,stroke-width:4px

    DB[(Database)]
    SERVERARGON["
        fa:fa-lock Argon2id Hash
        Hash Length: 256 bits (32 bytes)
        M: 64MiB - I: 3 - P: 4
        Salt: Generated Salt
        Payload: Master Password Hash
    "]

    subgraph Client
    style Client fill:#FFF
    PW --> PWARGON
    PWARGON -- "Key Split\nFirst 256 bits" --> MASTER
    PWARGON -- "Key Split\nLast 256 bits" --> PWHASH
    MASTER --> KEYWRAP
    GENAKEY -- Private Key --> KEYWRAP
    GENAKEY -- Public Key --> WRAPCONTEXTKEY
    KEYWRAP --> WRAPPEDAKEY
    GENSKEY --> WRAPCONTEXTKEY
    WRAPCONTEXTKEY--> WRAPPEDSKEY
    end

    subgraph Server
    style Server fill:#FFF
    PWHASH --> SERVERARGON

    %% TODO: Separate out user from encryption context DB tables
    WRAPPEDAKEY --> DB
    WRAPPEDSKEY --> DB
    SERVERARGON --> DB
    end
  

```

