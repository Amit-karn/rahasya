import { cryptoConfig } from "../config/CryptoConfig";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import { encryptWithAesGcm, extractKeyToJwk, generateKeyWithPBKDF2, generateRandomValues, getRandomIterations, importJwkAsCryptoKey, sha256HashWithIterations, uint8ArrayToBase64 } from "./CryptoUtils";

async function generateEncryptionKey(secret, salt, iterations, extractable=false) {
    const generatedKey = await generateKeyWithPBKDF2(
        secret.trim(),
        salt,
        iterations,
        extractable
    );
    return generatedKey;
}

async function generateEncryptionKeyFromMasterKey(secret, iterations) {
    const salt = (await sha256HashWithIterations(
        secret.trim(),
        passwordManagerConfig.masterKeyHashIteration
    )).hash;
    const generatedKey = await generateEncryptionKey(secret, salt, iterations, true);
    const exportedKey = await extractKeyToJwk(generatedKey.key)
    return `${generatedKey.key.algorithm.name}-${generatedKey.key.algorithm.length}:${btoa(JSON.stringify(exportedKey))}`;
}

async function encrypt(encodedKey, data, aad="") {
    const jwk = getJwkFromEncryptionKey(encodedKey);
    // const masterEncryptionKey = await importJwkAsCryptoKey(exporetdEncryptionKey);
    console.log(jwk, "-----------")
    const saltForFinalKey = generateRandomValues(cryptoConfig.keySaltLengthInBytes);
    const itr = getRandomIterations();
    console.log("itr", itr)
    console.log("salt for final key", uint8ArrayToBase64(saltForFinalKey))
    const finalEncryptionKey = await generateEncryptionKey(jwk.k, saltForFinalKey, itr, false);
    console.log("salt for final key output", uint8ArrayToBase64(finalEncryptionKey.salt))
    console.log("output itr", itr)
    console.log(finalEncryptionKey)
    const iv = generateRandomValues(cryptoConfig.aesGcmIvLengthInBytes);
    if (aad.trim() === "") aad = "";
    console.log("iv", uint8ArrayToBase64(iv))
    const encryptionResult = await encryptWithAesGcm(finalEncryptionKey.key, data, iv, aad);
    console.log("output iv", uint8ArrayToBase64(encryptionResult.iv))
    console.log(encryptionResult);
    console.log({   
        ciphertext: uint8ArrayToBase64(encryptionResult.ciphertext)
    })
}

function getJwkFromEncryptionKey(encodedKey) {
    const parts = encodedKey.split(':');
    if (parts.length > 1) {
        return JSON.parse(atob(parts[1]));
    }
    throw new Error('Invalid encoded key format');
}

export {
    generateEncryptionKeyFromMasterKey,
    encrypt
}