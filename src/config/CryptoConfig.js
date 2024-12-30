export const cryptoConfig = {
    hash: 'SHA-256',
    keyLengthInBytes: 256,
    keySaltLengthInBytes: 32, 
    KeyDerivationFunction: "PBKDF2",
    keyUsage: ['encrypt', 'decrypt'],
    keyAlgorithm: 'AES-GCM',
    masterKeyHashIteration: 1_000_000,
    aesGcmIvLengthInBytes: 12,
};