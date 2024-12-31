import { cryptoConfig } from "../config/CryptoConfig"; // Import the cryptographic configurations
import passwordManagerConfig from "../config/PasswordManagerConfig"; // Import password manager specific configurations
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
    console.log("data length", data.length, aad.length)
    const jwk = getJwkFromEncryptionKey(encodedKey);
    console.log(jwk, "-----------");

    // Generate a random salt and iteration count for final encryption key
    const saltForFinalKey = generateRandomValues(cryptoConfig.keySaltLengthInBytes);
    const itr = getRandomIterations();
    console.log("itr", itr * cryptoConfig.defaultMultiplierForFinalKeyIteration);
    console.log("salt for final key", uint8ArrayToBase64(saltForFinalKey));

    // Generate the final encryption key using PBKDF2 with the salt and iteration count
    const finalEncryptionKey = await generateEncryptionKey(jwk.k, saltForFinalKey, itr * cryptoConfig.defaultMultiplierForFinalKeyIteration, false);
    console.log("salt for final key output", uint8ArrayToBase64(finalEncryptionKey.salt));
    console.log("output itr", finalEncryptionKey.iterations);
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

    // Sizes of different parts
    const aadLength = cryptoConfig.isAadUsedLengthInBytes;
    const dateLength = cryptoConfig.currentDateLengthInBytes;
    const saltLength = cryptoConfig.keySaltLengthInBytes;
    const ivLength = cryptoConfig.aesGcmIvLengthInBytes;
    const ciphertextLength = encryptionResult.ciphertext.length;

    // Total size of the final embedded array
    const totalLength = aadLength + dateLength + saltLength + ivLength + 1 + ciphertextLength + 1;

    // Create the Uint8Array for the embedded output
    const embeddedOutput = new Uint8Array(totalLength);

    // AAD flag (1 byte)
    const isAadUsedArray = new Uint8Array(1);
    const isAadUsed = aad === "" ? 0 : 1;
    isAadUsedArray.set([isAadUsed]);

    // Ciphertext length (1 byte)
    const cipherTextLengthArray = new Uint8Array(1);
    cipherTextLengthArray.set([ciphertextLength]);

    //iteraions
    const finalKeyIterationsArray = new Uint8Array(1);
    finalKeyIterationsArray.set([itr]);

    // Set all parts into the final embedded output array
    embeddedOutput.set(isAadUsedArray, 0); // AAD usage flag
    embeddedOutput.set(encodedString, aadLength); // Current date string
    embeddedOutput.set(saltForFinalKey, aadLength + dateLength); // Salt for final key
    embeddedOutput.set(iv, aadLength + dateLength + saltLength); // IV
    embeddedOutput.set(cipherTextLengthArray, aadLength + dateLength + saltLength + ivLength); // Ciphertext length
    embeddedOutput.set(encryptionResult.ciphertext, aadLength + dateLength + saltLength + ivLength + 1); // Ciphertext
    embeddedOutput.set(finalKeyIterationsArray, aadLength + dateLength + saltLength + ivLength + 1 + ciphertextLength);
    console.log("embbeding", itr, embeddedOutput);
    // Return the encrypted data in Base64
    return uint8ArrayToBase64(embeddedOutput);
}

/**
 * Decrypts the data using AES-GCM algorithm and the final encryption key.
 * @param {string} encodedKey - The encoded key to extract and use for decryption.
 * @param {string} base64EncodedData - The Base64-encoded encrypted data to be decrypted.
 * @returns {Promise<Uint8Array>} - A promise that resolves to the decrypted data.
 */
async function decrypt(encodedKey, base64EncodedData, aad="") {
    // Extract the embedded data (AAD, date, salt, IV, ciphertext) from the Base64 encoded string
    const { ciphertext, iv, salt, iterations} = extractEmbeddedData(base64EncodedData);
    console.log("extracted embeeded data", extractEmbeddedData(base64EncodedData))

    // Extract the JWK from the encoded key
    const jwk = getJwkFromEncryptionKey(encodedKey);
    console.log(jwk, "-------->>---");

    // Derive the final encryption key using PBKDF2 with the salt and iterations
    const finalEncryptionKey = await generateEncryptionKey(jwk.k, salt, iterations*cryptoConfig.defaultMultiplierForFinalKeyIteration, false);
    console.log("finalEncryptionKey", finalEncryptionKey);

    // Perform AES-GCM decryption with the final encryption key, IV, and AAD
    const decryptedResult = await decryptWithAesGcm(
        finalEncryptionKey.key,
        ciphertext,
        iv,
        aad
    );
    
    console.log("Decrypted data:", decryptedResult);

    return decryptedResult.decryptedData;
}


function extractAadAndDate(base64Encoded) {
    // Decode the Base64 string back to a Uint8Array
    const embeddedData = base64ToUint8Array(base64Encoded);

    // Get the AAD flag (1 byte)
    const aadUsed = embeddedData[0] === 1;

    // Extract the current date (since it is always 10 bytes for YYYY-MM-DD format)
    const dateStart = 1;
    const dateEnd = dateStart + cryptoConfig.currentDateLengthInBytes;
    const encodedDate = embeddedData.slice(dateStart, dateEnd);
    const date = new TextDecoder().decode(encodedDate);

    return {aadUsed, date};
}

function extractEmbeddedData(base64Encoded) {
    // Decode the Base64 string back to a Uint8Array
    const embeddedData = base64ToUint8Array(base64Encoded);

    // Get the AAD flag (1 byte)
    const aadUsed = embeddedData[0] === 1;

    // Extract the current date (since it is always 10 bytes for YYYY-MM-DD format)
    const dateStart = 1; // After the AAD flag byte
    const dateEnd = dateStart + 10; // 10 bytes for date
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

    // Extract the ciphertext length (1 byte)
    const cipherTextLengthStart = ivEnd;
    const cipherTextLengthEnd = cipherTextLengthStart + 1;
    const cipherTextLength = embeddedData[cipherTextLengthStart];

    // Extract the ciphertext itself
    const cipherStart = cipherTextLengthEnd;
    const cipherEnd = cipherStart + cipherTextLength;
    const ciphertext = embeddedData.slice(cipherStart, cipherEnd);

    // Extract the final iteraion
    const iterationStart = cipherEnd;
    const iterationEnd = iterationStart + 1;
    const iterations = embeddedData.slice(iterationStart, iterationEnd);

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
 * Extracts the JWK from an encoded key string.
 * @param {string} encodedKey - The encoded key string containing the JWK in Base64 format.
 * @returns {Object} - The decoded JWK object.
 * @throws {Error} - If the encoded key format is invalid.
 */
function getJwkFromEncryptionKey(encodedKey) {
    const parts = encodedKey.split(":");
    if (parts.length > 1) {
        return JSON.parse(atob(parts[1]));  // Decode the Base64 part and parse the JSON
    }
    throw new Error("Invalid encoded key format");  // Throw an error if the format is invalid
}

/**
 * Signs the data using HMAC with a key derived from PBKDF2 and returns the signed message.
 * @param {string} secret - The secret or password used to derive the signing key.
 * @param {Uint8Array} data - The data to be signed.

 * @returns {Promise<string>} - A promise that resolves to the signed message in Base64 format.
 */
async function sign(secret, dataStr) {
    // Generate a random salt for key derivation
    const jwk = getJwkFromEncryptionKey(secret);
    console.log("signing.. ", secret, dataStr, jwk)
    const encoder = new TextEncoder();
    const data = encoder.encode(dataStr);
    const salt = generateRandomValues(cryptoConfig.keySaltLengthInBytes); // 32 bytes salt
    
    const iterations = getRandomIterations();
    // Derive the signing key using PBKDF2 (assuming we are using the password and salt to derive a key)
    const derivedKey = await generateHmacKeyWithPBKDF2(jwk.k, salt, iterations*cryptoConfig.defaultMultiplierForFinalKeyIteration); // Generate key from password using PBKDF2

    // Create the HMAC signature
    const signature = await crypto.subtle.sign(
        { name: "HMAC", hash: { name: "SHA-256" } },
        derivedKey.key,
        data
    );
    console.log("signing  key", derivedKey.key, secret, salt, iterations*cryptoConfig.defaultMultiplierForFinalKeyIteration)
    
    // Convert the signature to a base64 string
    const signatureArray = new Uint8Array(signature);

    // Combine salt, iterations, and signature into one message to return
    const totalLength = cryptoConfig.keySaltLengthInBytes + 1 + signature.byteLength;
    const message = new Uint8Array(totalLength);
    const iterationArray = new Uint8Array(1);
    iterationArray.set([iterations]);
    
    // Copy salt, iterations and the signature into the message
    console.log(message.length, totalLength)
    message.set(salt, 0); // Salt at the start
    message.set(iterationArray, cryptoConfig.keySaltLengthInBytes);
    message.set(signatureArray, cryptoConfig.keySaltLengthInBytes + 1);
    
    console.log(uint8ArrayToBase64(message))
    console.log("hmac contents signing...", uint8ArrayToBase64(salt), uint8ArrayToBase64(iterationArray), iterationArray, iterations, uint8ArrayToBase64(signatureArray))
    // Return the message as Base64
    return uint8ArrayToBase64(message);
}

/**
 * Verifies the signed message by comparing the recomputed HMAC with the extracted signature.
 * @param {string} secret - The secret or password used to derive the key for verification.
 * @param {string} signedMessageBase64 - The signed message in Base64 format.
 * @param {Uint8Array} data - The original data that was signed.
 * @returns {Promise<boolean>} - Returns `true` if the signature is valid, otherwise `false`.
 */
async function verify(secret, signedMessageBase64, dataStr) {
    // Decode the signed message from Base64 to a Uint8Array
    const jwk = getJwkFromEncryptionKey(secret);
    console.log("verifying.. ", secret, signedMessageBase64, dataStr, jwk)
    const encoder = new TextEncoder();
    const data = encoder.encode(dataStr);
    const signedMessage = base64ToUint8Array(signedMessageBase64);
    
    // Extract salt (first 32 bytes)
    const salt = signedMessage.slice(0, cryptoConfig.keySaltLengthInBytes);
    
    // Extract iterations (next 4 bytes)
    const iterations = signedMessage[cryptoConfig.keySaltLengthInBytes];
    
    // Extract the signature (remaining bytes)
    const signature = signedMessage.slice(cryptoConfig.keySaltLengthInBytes+1);  // After salt (32 bytes) + iterations (4 bytes)

    // Derive the key using PBKDF2 from the secret, extracted salt, and iterations
    const derivedKey = await generateHmacKeyWithPBKDF2(jwk.k, salt, iterations*cryptoConfig.defaultMultiplierForFinalKeyIteration);
    console.log("verifying..", derivedKey.key, secret, salt, iterations*cryptoConfig.defaultMultiplierForFinalKeyIteration)
    console.log("hmac contents verification...", uint8ArrayToBase64(salt), iterations, uint8ArrayToBase64(signature))
    // Recompute the HMAC using the derived key and the data
    const verified = await crypto.subtle.verify(
        { name: "HMAC", hash: { name: "SHA-256" } },
        derivedKey.key,
        signature,
        data
    );
    console.log(verified);
    return verified;
}



export { 
    generateEncryptionKeyFromMasterKey,  // Export the function to generate encryption key from master key
    encrypt,  // Export the encryption function
    decrypt,
    getJwkFromEncryptionKey,
    sign,
    verify
};
