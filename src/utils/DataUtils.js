/**
 * Converts bytes to megabytes.
 * 
 * @param {number} bytes - The number of bytes.
 * @returns {number} - The equivalent number of megabytes.
 */
const bytesToMB = (bytes) => {
    return bytes / (1024 * 1024);
};

/**
 * Masks a master key by showing the first 2 and last 3 characters, 
 * and replacing the middle characters with asterisks.
 * 
 * @param {string} key - The master key to mask.
 * @returns {string} - The masked master key.
 */
const maskMasterKey = (key) => {
    if (key.length <= 5) return "";
    return `${key.slice(0, 2)}${"*".repeat(key.length - 5)}${key.slice(-3)}`.slice(0, 20);
};

/**
 * Used for different password. Masks a secret by showing the last 2 characters and replacing the rest with asterisks.
 * 
 * @param {string} secret - The secret to mask.
 * @returns {string} - The masked secret.
 */
const maskSecret = (secret) => {
    if (secret.length <= 2) return secret;
    return `${"*".repeat(secret.length - 2)}${secret.slice(-2)}`;
};

export {
    bytesToMB,
    maskMasterKey,
    maskSecret
};