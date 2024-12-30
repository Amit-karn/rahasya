import { cryptoConfig } from "../config/CryptoConfig"; // Import the cryptographic configurations
import passwordManagerConfig from "../config/PasswordManagerConfig"; // Import password manager specific configurations
import { 
    encryptWithAesGcm, 
    extractKeyToJwk, 
    generateKeyWithPBKDF2, 
    generateRandomValues, 
    getRandomIterations, 
    importJwkAsCryptoKey, 
    sha256HashWithIterations, 
    uint8ArrayToBase64 
} from "./CryptoUtils"; // Import utility functions for cryptography

/**
 * Generates an encryption key using PBKDF2 with the provided secret, salt, and iterations.
 * @param {string} secret - The secret used for key derivation.
 * @param {Uint8Array} salt - The salt used in the PBKDF2 function.
 * @param {number} iterations - The number of iterations to use in PBKDF2.
 * @param {boolean} extractable - Whether the generated key can be extracted (default is false).
 * @returns {Promise<Object>} - A promise that resolves to an object containing the derived key and salt.
 */
async function generateEncryptionKey(secret, salt, iterations, extractable = false) {
    const generatedKey = await generateKeyWithPBKDF2(
        secret.trim(),    // Trim the secret to remove unnecessary spaces
        salt,             // The salt used to generate the key
        iterations,       // The number of iterations for PBKDF2
        extractable       // Whether the key can be exported
    );
    return generatedKey;  // Return the generated key
}

/**
 * Generates an encryption key from a master key (derived from a password) and returns it as a JWK encoded string.
 * @param {string} secret - The master key or password.
 * @param {number} iterations - The number of iterations to use in PBKDF2.
 * @returns {Promise<string>} - A promise that resolves to an encoded string of the JWK.
 */
async function generateEncryptionKeyFromMasterKey(secret, iterations) {
    // Hash the master key using SHA-256 iterations to derive the salt
    const salt = (await sha256HashWithIterations(
        secret.trim(),
        passwordManagerConfig.masterKeyHashIteration
    )).hash;

    // Generate the encryption key using PBKDF2
    const generatedKey = await generateEncryptionKey(secret, salt, iterations, true);
    
    // Export the generated key to JWK format and encode it as Base64 string
    const exportedKey = await extractKeyToJwk(generatedKey.key);
    return `${generatedKey.key.algorithm.name}-${generatedKey.key.algorithm.length}:${btoa(JSON.stringify(exportedKey))}`;
}

/**
 * Encrypts the data using AES-GCM algorithm and a derived final encryption key.
 * @param {string} encodedKey - The encoded key to extract and use for encryption.
 * @param {Uint8Array} data - The data to be encrypted.
 * @param {string} [aad=""] - The Additional Authenticated Data (optional).
 */
async function encrypt(encodedKey, data, aad = "") {
    // Extract the JWK from the encoded key
    const jwk = getJwkFromEncryptionKey(encodedKey);
    console.log(jwk, "-----------");

    // Generate a random salt and iteration count for final encryption key
    const saltForFinalKey = generateRandomValues(cryptoConfig.keySaltLengthInBytes);
    const itr = getRandomIterations();
    console.log("itr", itr);
    console.log("salt for final key", uint8ArrayToBase64(saltForFinalKey));

    // Generate the final encryption key using PBKDF2 with the salt and iteration count
    const finalEncryptionKey = await generateEncryptionKey(jwk.k, saltForFinalKey, itr, false);
    console.log("salt for final key output", uint8ArrayToBase64(finalEncryptionKey.salt));
    console.log("output itr", itr);
    console.log(finalEncryptionKey);

    // Generate a random initialization vector (IV) for AES-GCM encryption
    const iv = generateRandomValues(cryptoConfig.aesGcmIvLengthInBytes);
    if (aad.trim() === "") aad = "";  // If no AAD is provided, set it to an empty string
    console.log("iv", uint8ArrayToBase64(iv));

    // Perform AES-GCM encryption with the final encryption key, IV, and AAD
    const encryptionResult = await encryptWithAesGcm(finalEncryptionKey.key, data, iv, aad);
    console.log("output iv", uint8ArrayToBase64(encryptionResult.iv));
    console.log(encryptionResult);
    const currentDate = new Date().toLocaleDateString("en-CA");
    const encoder = new TextEncoder(); // Create a new TextEncoder instance
    const encodedString = encoder.encode(currentDate);
    console.log(currentDate, encodedString.length)
    const aadLength = 1;
    const dateLength = 10;
    const embeddedOutput = new Uint8Array(
        aadLength +
        dateLength +
        cryptoConfig.keySaltLengthInBytes +
        cryptoConfig.aesGcmIvLengthInBytes +
        encryptionResult.ciphertext.length + 1
    )
    const aadUint8Array = new Uint8Array(1);
    const isAadUsed = aad === "" ? 0 : 1;
    const cipherTextLength = new Uint8Array(1);
    cipherTextLength.set(encryptionResult.ciphertext.length);
    aadUint8Array.set(isAadUsed);
    embeddedOutput.set(aadUint8Array, 0);
    embeddedOutput.set(encodedString, aadLength);
    embeddedOutput.set(saltForFinalKey, aadLength+dateLength);
    embeddedOutput.set(iv, aadLength+dateLength+cryptoConfig.keySaltLengthInBytes);
    embeddedOutput.set(cipherTextLength, aadLength+dateLength+cryptoConfig.keySaltLengthInBytes+1);
    embeddedOutput.set(encryptionResult.ciphertext, aadLength+dateLength+cryptoConfig.keySaltLengthInBytes+1+encryptionResult.ciphertext.length);
    // Return the encrypted data, IV, and AAD
    console.log({   
        output: uint8ArrayToBase64(embeddedOutput)
    });
}

/**
 * Extracts the JWK from an encoded key string.
 * @param {string} encodedKey - The encoded key string containing the JWK in Base64 format.
 * @returns {Object} - The decoded JWK object.
 * @throws {Error} - If the encoded key format is invalid.
 */
function getJwkFromEncryptionKey(encodedKey) {
    const parts = encodedKey.split(':');
    if (parts.length > 1) {
        return JSON.parse(atob(parts[1]));  // Decode the Base64 part and parse the JSON
    }
    throw new Error('Invalid encoded key format');  // Throw an error if the format is invalid
}

export { 
    generateEncryptionKeyFromMasterKey,  // Export the function to generate encryption key from master key
    encrypt  // Export the encryption function
};
