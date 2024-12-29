import { cryptoConfig } from "../config/CryptoConfig";

async function generateKeyWithPBKDF2(password, salt, iterations) {
    const encoder = new TextEncoder();
    try {
        const passwordBytes = encoder.encode(password);
        const keyMaterial = await crypto.subtle.importKey(
            'raw', passwordBytes, { name: cryptoConfig.KeyDerivationFunction }, false, ['deriveKey']
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: cryptoConfig.KeyDerivationFunction,
                salt: salt,  // Use the specified salt (either random or static)
                iterations: iterations, // Number of iterations (higher is better)
                hash: 'SHA-256' // Hash function to use
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 }, // AES-GCM key (256 bits)
            false,
            ['encrypt', 'decrypt'] // The key can be used for encryption/decryption
        );

        return { key, salt, iterations };
    } catch (error) {
        console.error("Error generating key with PBKDF2:", error);
        throw new Error("Key generation failed.");
    }
}

async function sha256HashWithIterations(input, iterations) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    let hashBuffer = await crypto.subtle.digest('SHA-256', data);
    for (let i = 0; i < iterations; i++) {
        hashBuffer = await crypto.subtle.digest('SHA-256', hashBuffer);
    }
    return { hash: hashBuffer, iteration: iterations };
}

async function hashWithSHA256AsBytes(input) {
    const hashBuffer = await sha256HashWithIterations(input, 1);
    return new Uint8Array(hashBuffer);
}

async function hashWithSHA256AsBase64(input) {
    const hashBuffer = hashWithSHA256AsBytes(input);
    return arrayBufferToBase64(hashBuffer);
}

async function generateHMAC(key, message) {
    // Convert key and message to bytes using TextEncoder
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(key);
    const messageBytes = encoder.encode(message);

    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
        'raw', keyBytes, { name: 'HMAC', hash: { name: cryptoConfig.hash } },
        false, ['sign']
    );

    // Generate the HMAC
    return await crypto.subtle.sign('HMAC', cryptoKey, messageBytes);
}

function arrayBufferToBase64(buffer) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);  // Convert to Base64 using btoa
}

function getRandomIterations() {
    const iterations = Math.floor(Math.random() * 10) + 1;
    return iterations * 100000;
}

