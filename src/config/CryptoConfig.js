export const cryptoConfig = {
    hash: 'SHA-256',
    keyLength: 256,
    KeyDerivationFunction: "PBKDF2",
    keyUsage: ['encrypt', 'decrypt'],
    keyAlgorithm: 'AES-GCM',
    masterKeyHashIteration: 1_000_000
};