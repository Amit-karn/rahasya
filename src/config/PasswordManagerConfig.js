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
    masterKeyMaxLength: 32
};


export default passwordManagerConfig;