import { cryptoConfig } from "../config/CryptoConfig.js";

/**
 * Generates a cryptographic key using PBKDF2 algorithm with the given password, salt, and iterations.
 *
 * @param {string} password - The password to be used for key derivation.
 * @param {Uint8Array} salt - The salt to be used in the PBKDF2 function.
 * @param {number} iterations - The number of iterations to run the PBKDF2 key derivation.
 * @returns {Promise<{ key: CryptoKey, salt: Uint8Array, iterations: number }>} 
 *          - Returns an object containing the derived key, salt, and iterations.
 * @throws {Error} - Throws an error if key generation fails.
 */
async function generateKeyWithPBKDF2(password, salt, iterations) {
    const encoder = new TextEncoder();
    try {
        const startTime = performance.now();
        // Encode password to bytes
        const passwordBytes = encoder.encode(password);

        // Import the password as key material for PBKDF2
        const keyMaterial = await crypto.subtle.importKey(
            'raw', passwordBytes, { name: cryptoConfig.KeyDerivationFunction }, false, ['deriveKey']
        );

        // Derive the key using PBKDF2
        const key = await crypto.subtle.deriveKey(
            {
                name: cryptoConfig.KeyDerivationFunction,
                salt: salt,
                iterations: iterations,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        const endTime = performance.now();
        console.log(`Key with ${iterations} generated in ${endTime - startTime} ms`);
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
 * @returns {Promise<{ hash: ArrayBuffer, iterations: number }>} 
 *          - Returns an object containing the final hash and the number of iterations used.
 */
async function sha256HashWithIterations(input, iterations) {
    const startTime = performance.now();
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Perform the initial SHA-256 hash
    let hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Repeatedly hash the output for the specified number of iterations
    for (let i = 0; i < iterations; i++) {
        hashBuffer = await crypto.subtle.digest('SHA-256', hashBuffer);
    }
    const endTime = performance.now();
    console.log(`Hash with iterations ${iterations} generated in ${endTime - startTime} ms`);
    return { hash: hashBuffer, iterations: iterations };
}

/**
 * Hashes the input using SHA-256 and returns the result as a byte array.
 *
 * @param {string} input - The input data to be hashed.
 * @returns {Promise<Uint8Array>} - A promise that resolves to the hash as a byte array.
 */
async function hashWithSHA256AsBytes(input) {
    const hashBuffer = await sha256HashWithIterations(input, 1);
    return new Uint8Array(hashBuffer.hash);
}

/**
 * Hashes the input using SHA-256 and returns the result as a Base64 encoded string.
 *
 * @param {string} input - The input data to be hashed.
 * @returns {Promise<string>} - A promise that resolves to the Base64 encoded hash.
 */
async function hashWithSHA256AsBase64(input) {
    const hashBuffer = await hashWithSHA256AsBytes(input);
    return arrayBufferToBase64(hashBuffer);
}

/**
 * Generates a HMAC (Hash-based Message Authentication Code) with the given key and message.
 *
 * @param {string} key - The key to be used for HMAC generation.
 * @param {string} message - The message to be authenticated with the HMAC.
 * @returns {Promise<ArrayBuffer>} - A promise that resolves to the HMAC in ArrayBuffer format.
 */
async function generateHMAC(key, message) {
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(key);
    const messageBytes = encoder.encode(message);

    // Import the key to use in the HMAC generation
    const cryptoKey = await crypto.subtle.importKey(
        'raw', keyBytes, { name: 'HMAC', hash: { name: cryptoConfig.hash } },
        false, ['sign']
    );

    // Generate and return the HMAC
    return await crypto.subtle.sign('HMAC', cryptoKey, messageBytes);
}

/**
 * Converts an ArrayBuffer or Uint8Array to a Base64 string.
 *
 * @param {ArrayBuffer | Uint8Array} buffer - The buffer to convert.
 * @returns {string} - The Base64 encoded string.
 */
function arrayBufferToBase64(buffer) {
    // Check if the buffer is a Uint8Array, if not convert it to Uint8Array
    const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const binary = String.fromCharCode(...uint8Array);
    return btoa(binary);  // Convert to Base64 using btoa
}

/**
 * Generates a random number of iterations for cryptographic operations.
 *
 * @returns {number} - A random number of iterations between 1,000,000 and 10,000,000.
 */
function getRandomIterations() {
    const iterations = Math.floor(Math.random() * 10) + 1;
    return iterations * 1000000;
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
 * AES-GCM provides both confidentiality (encryption) and integrity (authentication) for the data.
 * 
 * @param {CryptoKey} key - The AES key used for encryption.
 * @param {string} data - The plaintext data to be encrypted.
 * @param {Uint8Array} iv - The initialization vector (IV) used during encryption.
 * @param {string} aad - Additional Authenticated Data (AAD) to provide integrity for both the encrypted data and AAD.
 * @returns {Promise<{ ciphertext: ArrayBuffer, iv: Uint8Array, aad: string }>} - The encrypted data, initialization vector (IV), and the AAD used in encryption.
 */
async function encryptWithAesGcm(key, data, iv, aad) {
    // Convert the data and AAD into byte arrays using TextEncoder
    const encodedData = new TextEncoder().encode(data); // Data to encrypt
    const encodedAAD = new TextEncoder().encode(aad);   // AAD for integrity check

    try {
        // Encrypt the data using AES-GCM with the generated IV and AAD
        const ciphertext = await crypto.subtle.encrypt(
            { 
                name: 'AES-GCM', 
                iv: iv,
                additionalData: encodedAAD, // Additional Authenticated Data (AAD) for integrity
                tagLength: 128 // Standard authentication tag length (128 bits)
            },
            key, // The AES key used for encryption
            encodedData // The data to be encrypted
        );

        // Return an object containing the ciphertext, IV, and AAD (for decryption later)
        return { ciphertext, iv, aad };
    } catch (error) {
        console.error("Encryption failed:", error);
        throw new Error("Encryption failed.");
    }
}

/**
 * Decrypts data that was encrypted with AES-GCM, including Additional Authenticated Data (AAD).
 * Ensures the integrity of both the encrypted data and the provided AAD.
 * 
 * @param {CryptoKey} key - The AES key used for decryption.
 * @param {ArrayBuffer} ciphertext - The encrypted data to be decrypted.
 * @param {Uint8Array} iv - The initialization vector (IV) used during encryption.
 * @param {string} aad - The AAD used during encryption, which must match.
 * @returns {Promise<string>} - The decrypted plaintext data as a string.
 */
async function decryptWithAesGcm(key, ciphertext, iv, aad) {
    // Convert the AAD back into a byte array (it must be the same AAD used during encryption)
    const decodedAAD = new TextEncoder().encode(aad);

    try {
        // Decrypt the ciphertext using AES-GCM with the same IV and AAD
        const decryptedData = await crypto.subtle.decrypt(
            { 
                name: 'AES-GCM', 
                iv: iv,
                additionalData: decodedAAD, // Provide the same AAD for integrity check
                tagLength: 128 // Standard authentication tag length (128 bits)
            },
            key, // The AES key used for decryption
            ciphertext // The ciphertext to decrypt
        );

        // Decode the decrypted data (Uint8Array) back into a string
        const decodedData = new TextDecoder().decode(decryptedData);
        return decodedData; // Return the decrypted string data
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Decryption failed.");
    }
}

const password = "this is my password and i know it";
const salt = generateRandomValues(32);
const masterKey = await generateKeyWithPBKDF2(password,
    salt, 1_000_0000);
console.log(arrayBufferToBase64(masterKey.salt));
console.log(masterKey);    
const data = "this is a test data "+arrayBufferToBase64(generateRandomValues(10))
const aad = "jkiojkio this is aad"
const iv = generateRandomValues(12)
const encrytedData = await encryptWithAesGcm(masterKey.key, data, iv, aad)
console.log(encrytedData)
console.log(arrayBufferToBase64(encrytedData.ciphertext))
const decrytpedData = await decryptWithAesGcm(masterKey.key, encrytedData.ciphertext, iv, aad)
console.log(decrytpedData)


// Exporting functions to be used in other modules
export {
    generateKeyWithPBKDF2,
    sha256HashWithIterations,
    hashWithSHA256AsBytes,
    hashWithSHA256AsBase64,
    generateHMAC,
    arrayBufferToBase64,
    getRandomIterations,
    generateRandomValues,
    encryptWithAesGcm,
    decryptWithAesGcm
};
