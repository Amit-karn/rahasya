const passwordManagerConfig = {
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
    masterKeyHashIteration: 5_00_000,
    masterKeyDefaultIteraion: 5_00_000,
    masterKeyIteraionList: [1_00_000, 5_00_000, 1_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000, 100_000_000]
};


export default passwordManagerConfig;