import { cryptoConfig } from "../config/CryptoConfig";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import {
    base64ToUint8Array,
    decryptWithAesGcm,
    encryptWithAesGcm,
    extractKeyToJwk,
    generateHmacKeyWithPBKDF2,
    generateKeyWithPBKDF2,
    generateRandomValues,
    getRandomIterations,
    sha256HashWithIterations,
    uint8ArrayToBase64
} from "./CryptoUtils";

/**
 * Generates an encryption key using PBKDF2 with the provided secret, salt, and iterations.
 *
 * @param {string} secret - The secret used for key derivation.
 * @param {Uint8Array} salt - The salt used in the PBKDF2 function to ensure key uniqueness.
 * @param {number} iterations - The number of iterations to use in PBKDF2.
 * @param {boolean} extractable - Whether the generated key can be exported (default is false).
 * @returns {Promise<{ key: CryptoKey, salt: Uint8Array, iterations: number }>} 
 *          An object containing the derived CryptoKey, the salt used, and the number of iterations.
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
 * Generates an encryption key from a provided master key (password) and returns it as an encoded JWK string.
 *
 * The process is as follows:
 * 1. Trim the master key and perform iterative SHA-256 hashing using the specified masterKeyIteration count
 *    to generate a unique salt.
 * 2. Use PBKDF2 with the original secret and the derived salt, together with the specified number of iterations,
 *    to generate an encryption key. The key is marked as extractable.
 * 3. Export the generated key to JWK (JSON Web Key) format and then encode the resulting JSON with Base64.
 * 4. Prefix the encoded string with the algorithm name and key length (e.g., "AES-GCM-256:"), yielding a complete key string.
 *
 * @param {string} secret - The master key or password.
 * @param {number} iterations - The number of PBKDF2 iterations to derive the encryption key.
 * @param {number} [masterKeyIteration=passwordManagerConfig.masterKeyHashIteration] - The number of iterations for
 *        SHA-256 hashing to derive the salt.
 * @returns {Promise<string>} A promise that resolves to the encoded JWK string, prefixed with the algorithm and key length.
 */
async function generateEncryptionKeyFromMasterKey(secret, iterations, masterKeyIteration = passwordManagerConfig.masterKeyHashIteration) {
    let salt, generatedKey, exportedKey;
    try {
        // Hash the master key using iterative SHA-256 to derive a unique salt
        salt = (await sha256HashWithIterations(
            secret.trim(),
            masterKeyIteration
        )).hash;

        // Generate the encryption key using PBKDF2 with the derived salt and provided iterations, allowing extraction
        generatedKey = await generateEncryptionKey(secret, salt, iterations, true);

        // Export the generated key to JWK format and encode it as a Base64 string
        exportedKey = await extractKeyToJwk(generatedKey.key);
        return `${generatedKey.key.algorithm.name}-${generatedKey.key.algorithm.length}:${btoa(JSON.stringify(exportedKey))}`;
    } finally {
        if (salt) {
            salt.fill(''); // Clear sensitive data
        }
        if (generatedKey) {
            generatedKey = null; // Clear the key reference to free up memory
        }
    }
}

/**
 * Extracts the JWK from an encoded key string.
 *
 * The encoded key string follows the format "alg:base64Jwk". The function extracts the Base64
 * portion, decodes it, and parses the result into a JWK object.
 *
 * @param {string} encodedKey - The encoded key string containing the JWK in Base64 format.
 * @returns {JsonWebKey} The decoded JWK object.
 * @throws {Error} If the encoded key format is invalid.
 */
function getJwkFromEncryptionKey(encodedKey) {
    let parts;
    try {
        parts = encodedKey.split(":");
        if (parts.length > 1) {
            const jwk = JSON.parse(atob(parts[1]));
            return jwk;
        }
        throw new Error("Invalid key format");
    } finally {
        if (parts) {
            parts.fill(''); // Clear sensitive data
        }
    }
}

/**
 * Encrypts the data using the AES-GCM algorithm with a derived final encryption key.
 *
 * The function first extracts the JWK from the encoded key, then it generates random values for the salt, iteration count,
 * and initialization vector (IV). These values are embedded into the final encrypted output along with AAD, current date
 * and the ciphertext itself.
 *
 * Embedding: The final Uint8Array is constructed by concatenating:
 *   - AAD flag (1 byte) indicating if AAD was used.
 *   - Current date (fixed 10 bytes for YYYY-MM-DD format).
 *   - Salt for final key generation.
 *   - IV for AES-GCM.
 *   - The ciphertext.
 *   - Final key iteration count (1 byte).
 *
 * @param {string} encodedKey - The encoded key to extract and use for encryption.
 * @param {string} data - The data to be encrypted.
 * @param {string} [aad=""] - Additional Authenticated Data (optional).
 * @returns {Promise<string>} A promise that resolves to the encrypted data as a Base64 encoded string.
 */
async function encrypt(encodedKey, data, aad = "") {
    // Extract the JWK from the encoded key
    let jwk = getJwkFromEncryptionKey(encodedKey);

    // Generate a random salt and iteration count for final encryption key
    const saltForFinalKey = generateRandomValues(cryptoConfig.keySaltLengthInBytes);
    const itr = getRandomIterations();

    // Generate the final encryption key using PBKDF2 with the salt and iteration count multiplier from config
    const finalEncryptionKey = await generateEncryptionKey(jwk.k, saltForFinalKey, itr * cryptoConfig.defaultMultiplierForFinalKeyIteration, false);
    jwk = null;  // Clear the JWK reference to free up memory

    // Generate a random initialization vector (IV) for AES-GCM encryption
    const iv = generateRandomValues(cryptoConfig.aesGcmIvLengthInBytes);
    if (aad.trim() === "") aad = "";  // If no AAD is provided, set it to an empty string

    // Perform AES-GCM encryption with the final encryption key, IV, and AAD
    const encryptionResult = await encryptWithAesGcm(finalEncryptionKey.key, data, iv, aad);

    const currentDate = new Date().toLocaleDateString("en-CA");
    const encoder = new TextEncoder(); // Create a new TextEncoder instance
    const encodedDate = encoder.encode(currentDate);

    // Sizes of different parts
    const aadLength = cryptoConfig.isAadUsedLengthInBytes;
    const dateLength = cryptoConfig.currentDateLengthInBytes;
    const saltLength = cryptoConfig.keySaltLengthInBytes;
    const ivLength = cryptoConfig.aesGcmIvLengthInBytes;
    const ciphertextLength = encryptionResult.ciphertext.length;

    // Total size of the final embedded array
    const totalLength = aadLength + dateLength + saltLength + ivLength + ciphertextLength + 1;

    // Create the Uint8Array for the embedded output
    const embeddedOutput = new Uint8Array(totalLength);

    // AAD flag (1 byte)
    const isAadUsedArray = new Uint8Array(1);
    const isAadUsed = aad === "" ? 0 : 1;
    isAadUsedArray.set([isAadUsed]);

    // Final key iterations (1 byte)
    const finalKeyIterationsArray = new Uint8Array(1);
    finalKeyIterationsArray.set([itr]); // only works if itr is less than 256

    // Embed the data in the following order:
    // [AAD flag][Current date][Salt][IV][Ciphertext length][Ciphertext][Iteration count]
    embeddedOutput.set(isAadUsedArray, 0); // AAD usage flag
    embeddedOutput.set(encodedDate, aadLength); // Current date string
    embeddedOutput.set(saltForFinalKey, aadLength + dateLength); // Salt for final key
    embeddedOutput.set(iv, aadLength + dateLength + saltLength); // IV for encryption
    embeddedOutput.set(encryptionResult.ciphertext, aadLength + dateLength + saltLength + ivLength); // Ciphertext
    embeddedOutput.set(finalKeyIterationsArray, aadLength + dateLength + saltLength + ivLength + ciphertextLength); // Iteration count

    // Return the encrypted data in Base64
    return uint8ArrayToBase64(embeddedOutput);
}

/**
 * Decrypts the data using the AES-GCM algorithm and the final encryption key.
 *
 * The function extracts the embedded parts from the encrypted Base64 message, including AAD flag, current date,
 * salt, IV, ciphertext length, ciphertext, and iteration count. It then derives the final encryption key using PBKDF2
 * with the extracted salt and iterations and uses it to decrypt the ciphertext.
 *
 * @param {string} encodedKey - The encoded key to extract and use for decryption.
 * @param {string} base64EncodedData - The Base64-encoded encrypted data to be decrypted.
 * @param {string} [aad=""] - Additional Authenticated Data (optional).
 * @returns {Promise<String>} A promise that resolves to the decrypted data.
 */
async function decrypt(encodedKey, base64EncodedData, aad = "") {
    // Extract the embedded data (AAD flag, date, salt, IV, ciphertext length, ciphertext, iteration count) from the Base64 encoded string
    const { ciphertext, iv, salt, iterations } = extractEmbeddedData(base64EncodedData);
    // Extract the JWK from the encoded key
    let jwk = getJwkFromEncryptionKey(encodedKey);

    // Derive the final encryption key using PBKDF2 with the extracted salt and iterations multiplier from config
    const finalEncryptionKey = await generateEncryptionKey(jwk.k, salt, iterations * cryptoConfig.defaultMultiplierForFinalKeyIteration, false);
    jwk = null;  // Clear the JWK reference to free up memory

    // Perform AES-GCM decryption with the final encryption key, IV, and AAD
    const decryptedResult = await decryptWithAesGcm(
        finalEncryptionKey.key,
        ciphertext,
        iv,
        aad
    );

    return decryptedResult.decryptedData;
}

/**
 * Extracts embedded encryption metadata and ciphertext from a Base64 encoded string.
 * [AAD flag][Current date][Salt][IV][Ciphertext][Iteration count]
 * The embedded data array consists of:
 *   - AAD flag (1 byte): Indicates if Additional Authenticated Data was used.
 *   - Current date (10 bytes in YYYY-MM-DD format): The date when encryption was performed.
 *   - Salt for final key derivation (Uint8Array): As per the configured length.
 *   - IV for AES-GCM (Uint8Array): As per the configured length.
 *   - Ciphertext (Uint8Array): The actual encrypted data.
 *   - Final key iteration count (1 byte): The iteration count used for key derivation.
 *
 * @param {string} base64Encoded - The Base64 encoded string containing the embedded data.
 * @returns {{ aadUsed: boolean, date: string, salt: Uint8Array, iv: Uint8Array, ciphertext: Uint8Array, iterations: number }}
 *          An object with the following structure:
 *          {
 *              aadUsed: true|false,      // Indicates if AAD was used
 *              date: "YYYY-MM-DD",       // The embedded date string
 *              salt: Uint8Array,         // Salt for final key derivation
 *              iv: Uint8Array,           // IV for AES-GCM encryption
 *              ciphertext: Uint8Array,   // The encrypted data
 *              iterations: number        // The final key iteration count
 *          }
 */
function extractEmbeddedData(base64Encoded) {
    // Decode the Base64 string back to a Uint8Array
    const embeddedData = base64ToUint8Array(base64Encoded);

    // Get the AAD flag (1 byte)
    const aadUsed = embeddedData[0] === 1;

    // Extract the current date (always 10 bytes for YYYY-MM-DD format)
    const dateStart = 1; // After the AAD flag byte
    const dateEnd = dateStart + cryptoConfig.currentDateLengthInBytes; // 10 bytes for the date
    const encodedDate = embeddedData.slice(dateStart, dateEnd);
    const date = new TextDecoder().decode(encodedDate);

    // Extract the salt used for final key generation
    const saltStart = dateEnd;
    const saltEnd = saltStart + cryptoConfig.keySaltLengthInBytes;
    const salt = embeddedData.slice(saltStart, saltEnd);

    // Extract the IV (initialization vector)
    const ivStart = saltEnd;
    const ivEnd = ivStart + cryptoConfig.aesGcmIvLengthInBytes;
    const iv = embeddedData.slice(ivStart, ivEnd);

    // Extract the ciphertext itself
    const cipherStart = ivEnd;
    const cipherEnd = embeddedData.length - 1;
    const ciphertext = embeddedData.slice(cipherStart, cipherEnd);

    // Extract the final key iteration count (1 byte)
    const iterationStart = cipherEnd;
    const iterations = embeddedData[iterationStart];

    // Return an object with all extracted parts
    return {
        aadUsed,
        date,
        salt,
        iv,
        ciphertext,
        iterations
    };
}

/**
 * Signs the data using HMAC with a key derived from PBKDF2 and returns the signed message.
 *
 * The function derives a signing key using PBKDF2 with a random salt and iteration count.
 * The final signed message is constructed by embedding the salt, iteration count, and signature.
 *
 * Embedding: The returned message consists of:
 *   - Salt (as per configuration length)
 *   - Iteration count (1 byte)
 *   - HMAC signature
 *
 * The entire message is then encoded to Base64.
 *
 * @param {string} secret - The secret or password used to derive the signing key.
 * @param {string} dataStr - The data (as a string) to be signed.
 * @returns {Promise<string>} A promise that resolves to the signed message in Base64 format.
 */
async function sign(secret, dataStr) {
    const jwk = getJwkFromEncryptionKey(secret);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataStr);
    const salt = generateRandomValues(cryptoConfig.keySaltLengthInBytes); // 32 bytes salt

    const iterations = getRandomIterations();
    // Derive the signing key using PBKDF2
    const derivedKey = await generateHmacKeyWithPBKDF2(jwk.k, salt, iterations * cryptoConfig.defaultMultiplierForFinalKeyIteration);

    // Create the HMAC signature
    const signature = await crypto.subtle.sign(
        { name: "HMAC", hash: { name: "SHA-256" } },
        derivedKey.key,
        data
    );
    const signatureArray = new Uint8Array(signature);

    // Combine salt, iteration count, and signature into one message
    const totalLength = cryptoConfig.keySaltLengthInBytes + 1 + signature.byteLength;
    const message = new Uint8Array(totalLength);
    const iterationArray = new Uint8Array(1);
    iterationArray.set([iterations]);

    // Copy salt, iteration count, and the signature into the message
    message.set(salt, 0); // Salt at the start
    message.set(iterationArray, cryptoConfig.keySaltLengthInBytes);
    message.set(signatureArray, cryptoConfig.keySaltLengthInBytes + 1);

    // Return the message as Base64
    return uint8ArrayToBase64(message);
}

/**
 * Verifies the signed message by comparing the recomputed HMAC with the extracted signature.
 *
 * The function extracts the salt and iteration count from the signed message, derives the key
 * using PBKDF2, and then recomputes the HMAC on the provided data. The verification passes
 * if the recomputed HMAC matches the extracted signature.
 *
 * @param {string} secret - The secret or password used to derive the verification key.
 * @param {string} signedMessageBase64 - The signed message in Base64 format.
 * @param {string} dataStr - The original data (as a string) that was signed.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the signature is valid, otherwise `false`.
 */
async function verify(secret, signedMessageBase64, dataStr) {
    // Decode the signed message from Base64 into a Uint8Array
    const jwk = getJwkFromEncryptionKey(secret);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataStr);
    const signedMessage = base64ToUint8Array(signedMessageBase64);

    // Extract salt (first N bytes as per config)
    const salt = signedMessage.slice(0, cryptoConfig.keySaltLengthInBytes);

    // Extract iteration count (next 1 byte)
    const iterations = signedMessage[cryptoConfig.keySaltLengthInBytes];

    // Extract the signature (remaining bytes)
    const signature = signedMessage.slice(cryptoConfig.keySaltLengthInBytes + 1);

    // Derive the key using PBKDF2 from the secret, extracted salt, and iterations multiplier from config
    const derivedKey = await generateHmacKeyWithPBKDF2(jwk.k, salt, iterations * cryptoConfig.defaultMultiplierForFinalKeyIteration);

    // Recompute the HMAC using the derived key and the provided data
    return await crypto.subtle.verify(
        { name: "HMAC", hash: { name: "SHA-256" } },
        derivedKey.key,
        signature,
        data
    );
}

export {
    generateEncryptionKeyFromMasterKey,
    encrypt,
    decrypt,
    sign,
    verify
};
