import { cryptoConfig } from "../config/CryptoConfig.js";

/**
 * Generates a cryptographic key using PBKDF2 algorithm with the given password, salt, and iterations.
 *
 * @param {string} password - The password to be used for key derivation.
 * @param {Uint8Array} salt - The salt to be used in the PBKDF2 function.
 * @param {number} iterations - The number of iterations to run the PBKDF2 key derivation.
 * @param {boolean} extractable - Is the Key extractable ?.
 * @returns {Promise<{ key: CryptoKey, salt: Uint8Array, iterations: number }>} 
 *          - Returns an object containing the derived key, salt, and iterations.
 * @throws {Error} - Throws an error if key generation fails.
 */
async function generateKeyWithPBKDF2(password, salt, iterations, extractable=false) {
    const encoder = new TextEncoder();
    try {
        const startTime = performance.now();
        // Encode password to bytes
        const passwordBytes = encoder.encode(password);

        // Import the password as key material for PBKDF2
        const keyMaterial = await crypto.subtle.importKey(
            "raw", passwordBytes, { name: cryptoConfig.KeyDerivationFunction }, false, ["deriveKey"]
        );

        // Derive the key using PBKDF2
        const key = await crypto.subtle.deriveKey(
            {
                name: cryptoConfig.KeyDerivationFunction,
                salt: salt,
                iterations: iterations,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            extractable,
            ["encrypt", "decrypt"]
        );

        const endTime = performance.now();
        console.log(`Key with ${iterations} iterations generated in ${endTime - startTime} ms`);
        return { key, salt, iterations };
    } catch (error) {
        console.error("Error generating key with PBKDF2:", error);
        throw new Error("Key generation failed.");
    }
}

async function generateHmacKeyWithPBKDF2(password, salt, iterations) {
    const encoder = new TextEncoder();
    try {
        const startTime = performance.now();
        // Encode password to bytes
        const passwordBytes = encoder.encode(password);

        // Import the password as key material for PBKDF2
        const keyMaterial = await crypto.subtle.importKey(
            "raw", passwordBytes, { name: cryptoConfig.KeyDerivationFunction }, false, ["deriveKey"]
        );

        // Derive the key using PBKDF2
        const key = await crypto.subtle.deriveKey(
            {
                name: cryptoConfig.KeyDerivationFunction,
                salt: salt,
                iterations: iterations,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "HMAC", hash: "SHA-256", length: 256 },
            false,
            ["sign", "verify"]
        );

        const endTime = performance.now();
        console.log(`Hmac Key with ${iterations} iterations generated in ${endTime - startTime} ms`);
        return { key, salt, iterations };
    } catch (error) {
        console.error("Error generating key with PBKDF2:", error);
        throw new Error("Key generation failed.");
    }
}

/**
 * Hashes the input data using SHA-256, repeated for a specified number of iterations.
 *
 * @param {string} input - The input data to be hashed.
 * @param {number} iterations - The number of iterations to run the hashing process.
 * @returns {Promise<{ hash: Uint8Array, iterations: number }>} 
 *          - Returns an object containing the final hash as a Uint8Array and the number of iterations used.
 */
async function sha256HashWithIterations(input, iterations) {
    const startTime = performance.now();
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Perform the initial SHA-256 hash
    let hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // Repeatedly hash the output for the specified number of iterations
    for (let i = 0; i < iterations; i++) {
        hashBuffer = await crypto.subtle.digest("SHA-256", hashBuffer);
    }
    const endTime = performance.now();
    console.log(`Hash with ${iterations} iterations generated in ${endTime - startTime} ms`);
    return { hash: new Uint8Array(hashBuffer), iterations };
}

/**
 * Generates an HMAC (Hashed Message Authentication Code) using the SHA-256 algorithm.
 *
 * @param {Uint8Array} key - The key used for the HMAC.
 * @param {string} message - The message to be authenticated.
 * @returns {Promise<Uint8Array>} - The HMAC of the message as a Uint8Array.
 */
async function generateHMAC(key, message) {
    try {
        console.log(key, message)
        const encoder = new TextEncoder();
        const messageBytes = encoder.encode(message);

        // Generate the HMAC
        const hmac = await crypto.subtle.sign("HMAC", key, messageBytes);

        // Return the result as a Uint8Array
        return new Uint8Array(hmac);
    } catch (error) {
        console.error("HMAC generation failed:", error);
        throw new Error("HMAC generation failed.");
    }
}

/**
 * Converts a Uint8Array to a Base64 string.
 *
 * @param {Uint8Array} buffer - The buffer to convert.
 * @returns {string} - The Base64 encoded string.
 */
function uint8ArrayToBase64(buffer) {
    const binary = String.fromCharCode(...buffer);
    return btoa(binary);  // Convert to Base64 using btoa
}

/**
 * Converts a Base64 string to a Uint8Array.
 *
 * @param {string} base64 - The Base64 encoded string.
 * @returns {Uint8Array} - The decoded Uint8Array.
 */
function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
}

/**
 * Generates a cryptographically secure random salt of the specified length.
 * 
 * @param {number} length - The length of the salt (in bytes).
 * @returns {Uint8Array} - A cryptographically secure random salt of the specified length.
 */
function generateRandomValues(length) {
    const salt = new Uint8Array(length);
    crypto.getRandomValues(salt);  // Fills the salt array with cryptographically secure random values
    return salt;
}

/**
 * Encrypts data using AES-GCM algorithm with Additional Authenticated Data (AAD).
 *
 * @param {CryptoKey} key - The AES key used for encryption.
 * @param {string} data - The plaintext data to be encrypted.
 * @param {Uint8Array} iv - The initialization vector (IV) used during encryption.
 * @param {string} aad - Additional Authenticated Data (AAD) to provide integrity for both the encrypted data and AAD.
 * @returns {Promise<{ ciphertext: Uint8Array, iv: Uint8Array, aad: string }>} 
 *          - The encrypted data as a Uint8Array, initialization vector (IV), and the AAD used in encryption.
 */
async function encryptWithAesGcm(key, data, iv, aad) {
    const encodedData = new TextEncoder().encode(data);
    const encodedAAD = new TextEncoder().encode(aad);

    try {
        const ciphertext = await crypto.subtle.encrypt(
            { 
                name: "AES-GCM", 
                iv: iv,
                additionalData: encodedAAD, 
                tagLength: 128 
            },
            key,
            encodedData
        );
        return { ciphertext: new Uint8Array(ciphertext), iv, aad };
    } catch (error) {
        console.error("Encryption failed:", error);
        throw new Error("Encryption failed.");
    }
}

/**
 * Decrypts data that was encrypted with AES-GCM, including Additional Authenticated Data (AAD).
 *
 * @param {CryptoKey} key - The AES key used for decryption.
 * @param {Uint8Array} ciphertext - The encrypted data to be decrypted.
 * @param {Uint8Array} iv - The initialization vector (IV) used during encryption.
 * @param {string} aad - The AAD used during encryption.
 * @returns {Promise<{ decryptedData: string, iv: Uint8Array, aad: string }>} 
 *          - The decrypted plaintext data as a string, along with the IV and AAD used.
 */
async function decryptWithAesGcm(key, ciphertext, iv, aad) {
    const decodedAAD = new TextEncoder().encode(aad);

    try {
        const decryptedData = await crypto.subtle.decrypt(
            { 
                name: "AES-GCM", 
                iv: iv,
                additionalData: decodedAAD,
                tagLength: 128 
            },
            key,
            ciphertext
        );

        const decryptedString = new TextDecoder().decode(decryptedData);
        return { decryptedData: decryptedString, iv, aad }; // Returning decrypted data along with IV and AAD
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Decryption failed.");
    }
}

/**
 * Generates a random number of iterations for cryptographic operations.
 *
 * @returns {number} - A random number of iterations between 1 and 10.
 */
function getRandomIterations() {
    return Math.floor(Math.random() * 10) + 1;
}

/**
 * Imports a JWK (JSON Web Key) as a CryptoKey.
 *
 * @param {Object} jwk - The JWK to be imported.
 * @returns {Promise<CryptoKey>} - The imported CryptoKey.
 */
async function importJwkAsCryptoKey(jwk) {
    try {
        const cryptoKey = await crypto.subtle.importKey(
            "jwk",          
            jwk,      
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
        );

        console.log("Imported CryptoKey:", cryptoKey);
        return cryptoKey;
    } catch (error) {
        console.error("Error importing JWK:", error);
        throw new Error("Failed to import JWK.");
    }
}

/**
 * Extracts the raw key from an AES CryptoKey (as JWK).
 *
 * @param {CryptoKey} cryptoKey - The CryptoKey to extract.
 * @returns {Promise<JsonWebKey>} - The raw key material as JWK.
 */
async function extractKeyToJwk(cryptoKey) {
    try {
        const exportedKey = await crypto.subtle.exportKey("jwk", cryptoKey);
        console.log("exported key", exportedKey)
        return exportedKey;
    } catch (error) {
        console.error("Error extracting key:", error);
        throw new Error("Failed to extract key.");
    }
}

// Encryption-------------------
// const password = "this is my password and i know it";
// const salt = (await sha256HashWithIterations(password, cryptoConfig.masterKeyHashIteration)).hash; //base64ToUint8Array("9G/Pu3lMgAwEQjA/L0nBbCRG3hiCzEQZcz5ewwiEAAs="); // Use pre-generated salt
// const iterations = 100_000_000; // PBKDF2 iterations count
// console.log("Salt: ", uint8ArrayToBase64(salt))

// // 1. Generate a master key using PBKDF2
// const masterKey = await generateKeyWithPBKDF2(password, salt, iterations);
// console.log("Generated Master Key:", masterKey);

// // 2. Define data, AAD, and IV for encryption
// const data = "this is a test data. encrypted test"; // Adding random values to data for variety
// const aad = "jkiojkio this is aad";  // Additional Authenticated Data (AAD)
// const iv = generateRandomValues(12);  // AES-GCM typically uses a 12-byte IV for better security

// // 3. Encrypt the data using AES-GCM
// const encryptedData = await encryptWithAesGcm(masterKey.key, data, iv, aad);
// console.log("Encrypted Data (Ciphertext):", uint8ArrayToBase64(encryptedData.ciphertext));
// console.log("IV Used for Encryption:", uint8ArrayToBase64(encryptedData.iv));
// console.log("AAD Used for Encryption:", encryptedData.aad);


//Decryption---------------------------
// const password = "this is my password and i know it";
// const salt = (await sha256HashWithIterations(password, cryptoConfig.masterKeyHashIteration)).hash; //base64ToUint8Array("9G/Pu3lMgAwEQjA/L0nBbCRG3hiCzEQZcz5ewwiEAAs="); // Use pre-generated salt
// const iterations = 100_000_000; // PBKDF2 iterations count
// console.log("Salt: ", uint8ArrayToBase64(salt))

// // 1. Generate the master key using PBKDF2
// const masterKey = await generateKeyWithPBKDF2(password, salt, iterations);
// console.log("Generated Master Key:", masterKey);

// // 2. Define the ciphertext, IV, and AAD used during encryption (Assuming the data was encrypted earlier)
// const ciphertextBase64 = "E0enfTHnARgiRcOKTVOBnptMULFekm8RKUVxqCjsK2ETaPVvRrxVNpSU6hHuj2NHqDpF"; // Example base64 encrypted data
// const iv = base64ToUint8Array("0H2dOUldtty5kUyQ");  // IV used during encryption (it must match exactly)
// const aad = "jkiojkio this is aad";  // AAD used during encryption (it must match exactly)

// // 3. Decrypt the data using AES-GCM
// const decryptedData = await decryptWithAesGcm(masterKey.key, base64ToUint8Array(ciphertextBase64), iv, aad);
// console.log("Decrypted Data:", decryptedData);


// Exporting functions to be used in other modules

export {
    generateKeyWithPBKDF2,
    sha256HashWithIterations,
    generateHMAC,
    uint8ArrayToBase64,
    base64ToUint8Array,
    generateRandomValues,
    encryptWithAesGcm,
    decryptWithAesGcm,
    getRandomIterations,
    extractKeyToJwk,
    importJwkAsCryptoKey,
    generateHmacKeyWithPBKDF2
};
