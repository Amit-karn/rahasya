const passwordManagerConfig = {
  portableEncryptorName: [
    ["Encryptor", "Decryptor"],
    ["LockIt", "UnlockIt"],
    ["EncBox", "OpenBox"],
    ["SealVault", "RevealVault"],
    ["SafeIn", "SafeOut"],
    ["KeyCast", "KeyRecall"],
    ["KeepSafe", "PeekSafe"],
    ["SealIt", "SeeIt"],
    ["EncMe", "ReadMe"],
    ["NoTrace", "AccessGranted"],
    ["DeadDrop", "EyeOnly"]
  ],
  fileSize: 1 * 1024 * 1024,
  fileType: ["text/plain"],
  acceptFileExtension: ".txt",
  algorithm: "AES-GCM-256",
  aadMinLength: 8,
  aadMaxLength: 32,
  secretMinLength: 16,
  secretMaxLength: 32,
  masterKeyMinLength: 16,
  masterKeyMaxLength: 32,
  homePage: "/",
  rahaysa: "रahasya",
  fileEncryptionIterations: 1000,
  masterKeyHashIteration: 5_00_000,
  masterKeyDefaultIteraion: 10_000,
  masterKeyIteraionList: [
    1_000, 10_000, 1_00_000, 5_00_000, 1_000_000, 5_000_000, 10_000_000, 20_000_000,
    50_000_000, 100_000_000
  ],
  encryptedFileHeader:
    "This is an auto generated File. Please do not tamper with it.",
  encryptedFileIntegrityHeader: "<<<<>>>>",
  encryptedFileIntegritySeparator: "<<<<<>>>>>",
  encryptedFileIntegrityFooter: ">>>><<<<"
};

export default passwordManagerConfig;
