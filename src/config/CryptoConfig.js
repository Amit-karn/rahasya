export const cryptoConfig = {
  hash: "SHA-256",
  keyLengthInBytes: 256,
  keySaltLengthInBytes: 32,
  KeyDerivationFunction: "PBKDF2",
  keyUsage: ["encrypt", "decrypt"],
  keyAlgorithm: "AES-GCM",
  aesGcmIvLengthInBytes: 12,
  isAadUsedLengthInBytes: 1,
  currentDateLengthInBytes: 10,
  defaultMultiplierForFinalKeyIteration: 1_000_000,
  passwordGuessThreshold: 1e12 // 1 trillion guesses (Strong)
};
