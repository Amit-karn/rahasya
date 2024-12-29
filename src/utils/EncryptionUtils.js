import argon2 from 'argon2';
import { Buffer } from 'buffer';

async function generateEncryptionKey(tempMasterKey) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    let generatedKey = `generated_${Date.now()}_${tempMasterKey}`;
    generatedKey = generatedKey + "E".repeat(256);
    return generatedKey;
}

async function generateKeyWithArgon2(password, useRandomSalt = true) {

    // If useRandomSalt is true, generate a random salt, else use a static salt
    const salt = useRandomSalt ? crypto.getRandomValues(new Uint8Array(16)) : Buffer.from(new TextEncoder().encode("static_salt_for_all_devices"));
    console.log(salt);
    try {
        // Generate the Argon2 key hash from the password and salt
        const keyHash = await argon2.hash(password, {
            // salt: salt,  // Use the specified salt (either random or static)
            type: argon2.argon2id,  // Argon2 ID variant (good for password hashing)
            memoryCost: 2 ** 16,  // Memory cost (in KB)
            timeCost: 4,  // Number of iterations
            parallelism: 3  // Parallelism factor
        });

        // Return the key hash as raw bytes (can be used for encryption key)
        return { derivedKey: new TextEncoder().encode(keyHash), salt: useRandomSalt ? salt : "__NO__" };
    } catch (error) {
        console.error("Error generating key with Argon2:", error);
        throw new Error("Key generation failed.");
    }
}

// PBKDF2 Key Derivation with Option to Use Random Salt or Not
async function generateKeyWithPBKDF2(password, useRandomSalt = true) {
    const encoder = new TextEncoder();

    // If useRandomSalt is true, generate a random salt, else use a static salt
    const salt = useRandomSalt ? crypto.getRandomValues(new Uint8Array(16)) : new TextEncoder().encode("static_salt_for_all_devices");

    try {
        // Convert password to bytes
        const passwordBytes = encoder.encode(password);

        // Use PBKDF2 to derive the key (256-bit key for AES)
        const keyMaterial = await crypto.subtle.importKey(
            'raw', passwordBytes, { name: 'PBKDF2' }, false, ['deriveKey']
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,  // Use the specified salt (either random or static)
                iterations: 1000000, // Number of iterations (higher is better)
                hash: 'SHA-256' // Hash function to use
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 }, // AES-GCM key (256 bits)
            false,
            ['encrypt', 'decrypt'] // The key can be used for encryption/decryption
        );

        return { derivedKey: key, salt: salt };
    } catch (error) {
        console.error("Error generating key with PBKDF2:", error);
        throw new Error("Key generation failed.");
    }
}


// SHA-256 Hashing Function returning Bytes using Web Crypto API
async function hashWithSHA256AsBytes(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Hash the data using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    return new Uint8Array(hashBuffer);  // Return the hash as a Uint8Array (bytes)
}

// SHA-256 Hashing Function returning Base64 string using Web Crypto API
async function hashWithSHA256AsBase64(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Hash the data using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert ArrayBuffer to Base64
    const base64Hash = arrayBufferToBase64(hashBuffer);
    return base64Hash;
}

// Helper function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary);  // Convert to Base64 using btoa
}

// SHA-256 Hashing with Random Iterations using Web Crypto API
async function hashWithIterations(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Step 1: Generate a random iteration count between 1 and 10
    const iterations = Math.floor(Math.random() * 10) + 1;

    // Step 2: Multiply the iteration count by 100000
    const realIterations = iterations * 100000;

    let hashBuffer = data;

    // Step 3: Perform the hash operation realIterations number of times
    for (let i = 0; i < realIterations; i++) {
        hashBuffer = await crypto.subtle.digest('SHA-256', hashBuffer);
    }

    // Convert ArrayBuffer to Base64 or Hex
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join(''); // Hex format

    return { hash: hashHex, iteration: realIterations };
}



// export {
//     generateEncryptionKey
// }


const password = "user-password";  // User's password

// Use Random Salt
generateKeyWithArgon2(password, true).then(({ derivedKey, salt }) => {
    console.log("Derived key with Argon2 and random salt:", derivedKey);
    console.log("Salt used in Argon2:", new Uint8Array(salt));
});

// Use Static Salt
generateKeyWithArgon2(password, false).then(({ derivedKey, salt }) => {
    console.log("Derived key with Argon2 and static salt:", derivedKey);
    console.log("Salt used in Argon2:", salt);
});

// // // Use Static Salt
// generateKeyWithPBKDF2(password, false).then(({ derivedKey, salt }) => {
//     console.log("Derived key with PBKDF2 and static salt:", derivedKey);
//     console.log("Salt used in PBKDF2:", new TextDecoder().decode(salt));
// });


// // Get SHA-256 Hash as Bytes (Uint8Array)
// hashWithSHA256AsBytes(password).then((bytes) => {
//     console.log("SHA-256 Hash as Bytes:", bytes);
// });

// // Get SHA-256 Hash as Base64
// hashWithSHA256AsBase64(password).then((base64) => {
//     console.log("SHA-256 Hash as Base64:", base64);
// });

// hashWithIterations(password).then(result => {
//     console.log("Generated Hash:", result.hash);
//     console.log("Iterations used:", result.iteration);
// });