Rahasya Encryption Process Documentation

Key Generation and Data Flow

1. Master Key Generation

```js
// User Input
const masterPassword = "MySecurePassword123";
const iterations = 1000000; // From config
```

2. First Level Key Derivation

```js
// Generate salt from master password using SHA-256
const salt = await sha256HashWithIterations(
    masterPassword.trim(), 
    masterKeyIteration
);

// Generate initial key using PBKDF2
const initialKey = await generateKeyWithPBKDF2(
    masterPassword,
    salt,
    iterations,
    true  // extractable
);

// Export to JWK format
const exportedKey = await extractKeyToJwk(initialKey);
const encodedKey = `AES-GCM-256:${btoa(JSON.stringify(exportedKey))}`;
```

3. Final Encryption Key Generation

```js
// Extract JWK from encoded key
const jwk = JSON.parse(atob(encodedKey.split(":")[1]));

// Generate new random values
const saltForFinalKey = generateRandomValues(32); // 32 bytes
const iterationCount = getRandomIterations(); // 1-10

// Generate final encryption key
const finalKey = await generateKeyWithPBKDF2(
    jwk.k,
    saltForFinalKey,
    iterationCount * 1000000, // multiplier from config
    false  // non-extractable
);
```

Data Encryption Process
1. Prepare for Encryption

```js
// Input data and configuration
const data = new TextEncoder().encode("Secret Message");
const aad = "optional_authenticated_data";

// Generate IV for AES-GCM
const iv = generateRandomValues(12); // 12 bytes
```

2. Encrypt Data

```js
// Encrypt using AES-GCM
const encryptedResult = await encryptWithAesGcm(
    finalKey,
    data,
    iv,
    aad
);
```

3. Create Embedded Format

```js
// Embedded data format:
// [AAD flag (1)][Date (10)][Salt (32)][IV (12)][CT][Iter (1)]
const embeddedOutput = new Uint8Array([
    aad ? 1 : 0,                // AAD flag
    ...currentDateBytes,        // YYYY-MM-DD
    ...saltForFinalKey,        // Salt used
    ...iv,                     // IV used
    ...encryptedResult,        // Encrypted data
    iterationCount            // Iterations used
]);

// Convert to Base64
const finalOutput = uint8ArrayToBase64(embeddedOutput);
```
Data Decryption Process
1. Extract Embedded Data

```js
const {
    aadUsed,        // Boolean
    date,           // YYYY-MM-DD
    salt,           // Uint8Array
    iv,             // Uint8Array
    ciphertext,     // Uint8Array
    iterations      // Number
} = extractEmbeddedData(base64EncodedData);
```

2. Reconstruct Key and Decrypt

```js
// Derive final decryption key
const finalKey = await generateKeyWithPBKDF2(
    jwk.k,
    salt,
    iterations * 1000000,
    false
);

// Decrypt data
const decrypted = await decryptWithAesGcm(
    finalKey,
    ciphertext,
    iv,
    aad
);
```

Example Usage

```js
// Encryption
const masterKey = "MySecurePassword123";
const data = "Secret message";
const aad = "additional data";

// Generate master key
const encodedKey = await generateEncryptionKeyFromMasterKey(
    masterKey, 
    1000000
);

// Encrypt data
const encrypted = await encrypt(encodedKey, data, aad);

// Decrypt data
const decrypted = await decrypt(encodedKey, encrypted, aad);
// Result: "Secret message"
```
Security Notes
1. Uses multiple key derivation steps for added security
2. Embeds all necessary values except master password
3. Supports Additional Authenticated Data (AAD)
4. Uses random salts and iteration counts
5. Final encryption key is non-extractable
6. Uses AES-GCM for authenticated encryption