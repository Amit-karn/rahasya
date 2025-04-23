import { cryptoConfig } from "../config/CryptoConfig";

/**
 * Derives an AES-GCM cryptographic key from a password using the PBKDF2 algorithm.
 *
 * @param {string} password - The input password used for key derivation.
 * @param {Uint8Array} salt - A unique salt value to mitigate rainbow table attacks.
 * @param {number} iterations - The number of iterations to perform during key derivation.
 * @param {boolean} [extractable=false] - Indicates whether the derived key can be extracted for use elsewhere.
 * @returns {Promise<{ key: CryptoKey, salt: Uint8Array, iterations: number }>}
 *          An object containing the derived CryptoKey, the salt used, and the number of iterations.
 * @throws {Error} If key derivation fails.
 */
async function generateKeyWithPBKDF2(
  password,
  salt,
  iterations,
  extractable = false
) {
  const encoder = new TextEncoder();
  let passwordBytes;
  try {
    const startTime = performance.now();
    // Encode password to bytes.
    passwordBytes = encoder.encode(password);

    // Import the password as key material.
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBytes,
      { name: cryptoConfig.KeyDerivationFunction },
      false,
      ["deriveKey"]
    );

    // Derive the key using PBKDF2.
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
    if (import.meta.env.MODE === "development") {
      console.log(
        `Key with ${iterations} iterations generated in ${endTime - startTime} ms`
      );
    }
    return { key, salt, iterations };
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error("Error generating key with PBKDF2:", error);
    }
    throw new Error("Key generation failed.");
  } finally {
    passwordBytes.fill(0); // Clear password bytes from memory for security.
    passwordBytes = null; // Allow garbage collection.
  }
}

/**
 * Derives an HMAC key from a password using the PBKDF2 algorithm.
 *
 * @param {string} password - The password used for key derivation.
 * @param {Uint8Array} salt - A cryptographic salt to ensure key uniqueness.
 * @param {number} iterations - The number of iterations used in the derivation process.
 * @returns {Promise<{ key: CryptoKey, salt: Uint8Array, iterations: number }>}
 *          An object containing the derived HMAC CryptoKey, salt, and iterations.
 * @throws {Error} If key derivation fails.
 */
async function generateHmacKeyWithPBKDF2(password, salt, iterations) {
  const encoder = new TextEncoder();
  let passwordBytes;
  try {
    const startTime = performance.now();
    // Encode password to bytes.
    passwordBytes = encoder.encode(password);

    // Import password as key material.
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBytes,
      { name: cryptoConfig.KeyDerivationFunction },
      false,
      ["deriveKey"]
    );

    // Derive the key using PBKDF2.
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
    if (import.meta.env.MODE === "development") {
      console.log(
        `Hmac Key with ${iterations} iterations generated in ${endTime - startTime} ms`
      );
    }
    return { key, salt, iterations };
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error("Error generating key with PBKDF2:", error);
    }
    throw new Error("Key generation failed.");
  } finally {
    passwordBytes.fill(0); // Clear password bytes from memory for security.
    passwordBytes = null; // Allow garbage collection.
  }
}

/**
 * Generates a SHA-256 hash for the provided input, repeatedly applying the hash function.
 *
 * @param {string} input - The data to hash.
 * @param {number} iterations - Number of additional hash iterations performed on the initial digest.
 * @returns {Promise<{ hash: Uint8Array, iterations: number }>}
 *          An object containing the final hash (as a Uint8Array) and the iteration count.
 */
async function sha256HashWithIterations(input, iterations) {
  const startTime = performance.now();
  const encoder = new TextEncoder();
  let data;
  try {
    data = encoder.encode(input);

    // Compute initial SHA-256 digest.
    let hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // Iteratively hash the output.
    for (let i = 0; i < iterations; i++) {
      hashBuffer = await crypto.subtle.digest("SHA-256", hashBuffer);
    }
    const endTime = performance.now();
    if (import.meta.env.MODE === "development") {
      console.log(
        `Hash with ${iterations} iterations generated in ${endTime - startTime} ms`
      );
    }
    return { hash: new Uint8Array(hashBuffer), iterations };
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error("Error generating hash with iterations:", error);
    }
    throw new Error("Hash generation failed.");
  } finally {
    data.fill(0); // Clear data from memory for security.
    data = null; // Allow garbage collection.
  }
}

/**
 * Converts an Uint8Array to a Base64 encoded string.
 *
 * @param {Uint8Array} buffer - The binary data to convert.
 * @returns {string} The Base64 representation of the input data.
 */
function uint8ArrayToBase64(buffer) {
  const binary = String.fromCharCode(...buffer);
  return btoa(binary);
}

/**
 * Converts a Base64 encoded string into a Uint8Array.
 *
 * @param {string} base64 - The Base64 encoded string.
 * @returns {Uint8Array} The decoded binary data.
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
 * Generates a cryptographically secure random salt of a specified byte length.
 *
 * @param {number} length - The desired length of the salt in bytes.
 * @returns {Uint8Array} A random salt generated using secure random values.
 */
function generateRandomValues(length) {
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Encrypts plaintext data using the AES-GCM algorithm with the provided key, IV, and additional data.
 *
 * @param {CryptoKey} key - The AES-GCM key used for encryption.
 * @param {string} data - The plaintext data to encrypt.
 * @param {Uint8Array} iv - The initialization vector; it must be unique for each encryption.
 * @param {string} aad - Additional Authenticated Data to ensure integrity.
 * @returns {Promise<{ ciphertext: Uint8Array, iv: Uint8Array, aad: string }>}
 *          An object containing the ciphertext, the IV used, and the additional authenticated data.
 * @throws {Error} If encryption fails.
 */
async function encryptWithAesGcm(key, data, iv, aad) {
  const encoder = new TextEncoder();
  let encodedData = encoder.encode(data);
  let encodedAAD = encoder.encode(aad);

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
    if (import.meta.env.MODE === "development") {
      console.error("Encryption failed:", error);
    }
    throw new Error("Encryption failed.");
  } finally {
    encodedData.fill(0); // Clear encoded data from memory for security.
    encodedAAD.fill(0); // Clear additional authenticated data from memory for security.
    encodedData = null; // Allow garbage collection.
    encodedAAD = null; // Allow garbage collection.
  }
}

/**
 * Decrypts ciphertext that was encrypted using AES-GCM with an initialization vector and additional data.
 *
 * @param {CryptoKey} key - The AES-GCM key used for decryption.
 * @param {Uint8Array} ciphertext - The encrypted data to decrypt.
 * @param {Uint8Array} iv - The initialization vector that was used during encryption.
 * @param {string} aad - The additional authenticated data that was used during encryption.
 * @returns {Promise<{ decryptedData: string, iv: Uint8Array, aad: string }>}
 *          An object containing the decrypted text, IV, and additional authenticated data.
 * @throws {Error} If decryption fails.
 */
async function decryptWithAesGcm(key, ciphertext, iv, aad) {
  let decodedAAD = new TextEncoder().encode(aad);

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
    return { decryptedData: decryptedString, iv, aad };
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error("Decryption failed:", error);
    }
    throw new Error("Decryption failed.");
  } finally {
    decodedAAD.fill(0); // Clear additional authenticated data from memory for security.
    decodedAAD = null; // Allow garbage collection.
  }
}

/**
 * Generates a random iteration count between 1 and 10 for cryptographic operations.
 *
 * @returns {number} A random integer in the range [1, 10].
 */
function getRandomIterations() {
  return Math.floor(Math.random() * 10) + 1;
}

/**
 * Imports a JSON Web Key (JWK) as a CryptoKey for AES-GCM encryption/decryption.
 *
 * @param {Object} jwk - The JSON Web Key object representing a key.
 * @returns {Promise<CryptoKey>} The imported CryptoKey.
 * @throws {Error} If the JWK import fails.
 */
async function importJwkAsCryptoKey(jwk) {
  try {
    return await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error("Error importing JWK:", error);
    }
    throw new Error("Failed to import JWK.");
  }
}

/**
 * Exports a CryptoKey as a JSON Web Key (JWK) object.
 *
 * @param {CryptoKey} cryptoKey - The CryptoKey to export.
 * @returns {Promise<JsonWebKey>} The exported key material as a JWK.
 * @throws {Error} If exporting the key fails.
 */
async function extractKeyToJwk(cryptoKey) {
  try {
    return await crypto.subtle.exportKey("jwk", cryptoKey);
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error("Error extracting key:", error);
    }
    throw new Error("Failed to extract key.");
  }
}

/**
 * Generates a wrapping key for key wrapping operations.
 *
 * @param {boolean} extractable - Indicates whether the key can be extracted.
 * @returns {Promise<CryptoKey>} The generated wrapping key.
 * @throws {Error} If key generation fails.
 */
async function generateWrappingKey(extractable = false) {
  return await crypto.subtle.generateKey(
    { name: "AES-KW", length: 256 },
    extractable,
    ["wrapKey", "unwrapKey"]
  );
}

/**
 * Wraps a key using a wrapping key.
 *
 * @param {CryptoKey} wrappingKey - The key used for wrapping.
 * @param {CryptoKey} keyToWrap - The key to be wrapped.
 * @returns {Promise<ArrayBuffer>} The wrapped key as an ArrayBuffer.
 * @throws {Error} If the wrapping operation fails.
 */
async function wrapKey(wrappingKey, keyToWrap) {
  try {
    return await crypto.subtle.wrapKey("jwk", keyToWrap, wrappingKey, {
      name: "AES-KW"
    });
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error("Error wrapping key:", error);
    }
    throw new Error("Failed to wrap key.");
  }
}

/**
 * Imports a wrapping key from a JSON Web Key (JWK) format.
 *
 * @param {Object} wrappingKey - The JWK representing the wrapping key.
 * @param {boolean} extractable - Indicates whether the key can be extracted.
 * @returns {Promise<CryptoKey>} The imported wrapping key.
 * @throws {Error} If the import fails.
 */
async function importWrappingKey(wrappingKey, extractable = false) {
  try {
    return await crypto.subtle.importKey(
      "jwk",
      wrappingKey,
      { name: "AES-KW" },
      extractable,
      ["wrapKey", "unwrapKey"]
    );
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error("Error importing wrapping key:", error);
    }
    throw new Error("Failed to import wrapping key.");
  }
}

/**
 * Unwraps a wrapped key using a wrapping key.
 *
 * @param {CryptoKey} wrappingKey - The key used for unwrapping.
 * @param {ArrayBuffer} wrappedKey - The wrapped key to be unwrapped.
 * @param {boolean} extractable - Indicates whether the unwrapped key can be extracted.
 * @returns {Promise<CryptoKey>} The unwrapped key as a CryptoKey.
 * @throws {Error} If the unwrapping operation fails.
 */
async function unwrapKey(wrappingKey, wrappedKey, extractable = false) {
  try {
    return await crypto.subtle.unwrapKey(
      "jwk",
      wrappedKey,
      wrappingKey,
      { name: "AES-KW" },
      { name: "AES-GCM", length: 256 },
      extractable,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error("Error unwrapping key:", error);
    }
    throw new Error("Failed to unwrap key.");
  }
}

export {
  generateKeyWithPBKDF2,
  sha256HashWithIterations,
  uint8ArrayToBase64,
  base64ToUint8Array,
  generateRandomValues,
  encryptWithAesGcm,
  decryptWithAesGcm,
  getRandomIterations,
  extractKeyToJwk,
  importJwkAsCryptoKey,
  generateHmacKeyWithPBKDF2,
  generateWrappingKey,
  wrapKey,
  importWrappingKey,
  unwrapKey
};
