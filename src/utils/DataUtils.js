import passwordManagerConfig from "../config/PasswordManagerConfig";

/**
 * Converts the given number of bytes into megabytes.
 *
 * @param {number} bytes - The size in bytes.
 * @returns {number} The size in megabytes.
 */
const bytesToMB = (bytes) => {
    return bytes / (1024 * 1024);
};

/**
 * Masks a master key by revealing only the first 2 and the last 3 characters.
 * The middle characters are replaced by asterisks. The final masked key is limited
 * to a maximum of 20 characters.
 *
 * @param {string} key - The master key to be masked.
 * @returns {string} The masked master key, or an empty string if the key is too short.
 */
const maskMasterKey = (key) => {
    if (key.length <= 5) return "";
    return `${key.slice(0, 2)}${"*".repeat(key.length - 5)}${key.slice(-3)}`.slice(0, 20);
};

/**
 * Masks a secret by replacing all but the last two characters with asterisks.
 * If the secret has two or fewer characters, it returns the original secret.
 *
 * @param {string} secret - The secret to be masked.
 * @returns {string} The masked secret.
 */
const maskSecret = (secret) => {
    if (secret.length <= 2) return secret;
    return `${"*".repeat(secret.length - 2)}${secret.slice(-2)}`;
};

/**
 * Generates a preview string for the given file content JSON.
 * The preview includes a header, a list of secret keys with their values,
 * and a list of integrity keys with their corresponding values.
 *
 * Example preview format:
 * ----------------------------------------------
 * ```txt
 * This is an auto generated File. Please do not tamper with it.
 * <<<<>>>>
 * service1: p@ssw0rd1
 * service2: p@ssw0rd2
 * <<<<<>>>>>
 * DATE: 2023-10-01
 * HMAC: abc123xyz
 * >>>><<<<
 * ```
 * ----------------------------------------------
 *
 * @param {Object} fileContentJson - An object containing secrets and integrity data.
 * @returns {string} The generated preview content. Returns an empty string if required data is missing.
 */
const generateFileContentForPreview = (fileContentJson) => {
    if (
        !fileContentJson ||
        !fileContentJson?.secrets ||
        !fileContentJson?.integrity
    ) {
        return "";
    }
    const secretKeys = Object.keys(fileContentJson.secrets);
    const integrityKeys = Object.keys(fileContentJson.integrity);

    return `${passwordManagerConfig.encryptedFileHeader}\n${passwordManagerConfig.encryptedFileIntegrityHeader}\n${secretKeys
        .map((key) => `${key}: ${fileContentJson.secrets[key]}`)
        .join("\n")}\n${passwordManagerConfig.encryptedFileIntegritySeparator}\n${integrityKeys
            .map((key) => `${key}: ${fileContentJson.integrity[key]}`)
            .join("\n")}\n${passwordManagerConfig.encryptedFileIntegrityFooter}`;
};

/**
 * Checks whether the provided object is empty (i.e., has no keys).
 *
 * @param {Object} obj - The object to check.
 * @returns {boolean} True if the object has no own properties; otherwise false.
 */
const isEmptyObj = (obj) => {
    return Object.keys(obj).length === 0;
};

export {
    bytesToMB,
    maskMasterKey,
    maskSecret,
    generateFileContentForPreview,
    isEmptyObj
};