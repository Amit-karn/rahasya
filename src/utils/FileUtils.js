// fileUtils.js

import { getJwkFromEncryptionKey, sign, verify } from "./CredLockerUtils";
import { generateHMAC, generateHmacKeyWithPBKDF2, uint8ArrayToBase64 } from "./CryptoUtils";

/**
 * Reads the file line by line, processes the content and converts it to JSON format.
 * @param {String} fileContent - The fileContent to be processed.
 * @returns {object} - The processed content as JSON, or an error message if the format is invalid.
 */
async function readFileLineByLine(fileContent, masterKey) {
    try {
        const lines = fileContent.split("\n");  // Split content by newlines
        //remove any empty lines from end
        while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
            lines.pop();
        }
        // Validate file format before processing
        if (!await isValidFileFormat(lines, masterKey)) {
            throw new Error("Error: Invalid file format. Ensure the file contains the correct markers and structure.");
        }

        // Split the content into parts based on the markers
        const secretsLines = [];
        const integrityLines = [];
        let isInsideSecrets = false;
        let isInsideIntegrity = false;

        // Process lines to separate secrets and integrity sections
        for (const line of lines) {
            if (line.trim() === "<<<<>>>>") {
                // Toggle between secrets and integrity sections based on markers
                if (!isInsideSecrets) {
                    isInsideSecrets = true;
                } else {
                    isInsideSecrets = false;
                }
            } else if (line.trim() === "<<<<<>>>>>") {
                isInsideIntegrity = true;
            } else if (line.trim() === ">>>><<<<") {
                break;  // Exit the loop
            } else {
                if (isInsideIntegrity) {
                    integrityLines.push(line.trim());
                } else if (isInsideSecrets) {
                    secretsLines.push(line.trim());
                }
            }
        }

        // Process the secrets section into an object
        const secrets = processSecrets(secretsLines);

        // Process the integrity section into an object
        const integrity = processIntegrity(integrityLines);

        // Combine everything into the final JSON format
        const finalResult = {
            secrets: secrets,
            integrity: integrity,
        };

        return ["success", finalResult];
    } catch (error) {
        console.error("Error reading file: " + error.message);
        return ["error", error.message];
    }
}

/**
 * Validates the file format. The file should contain the required markers and structure.
 * @param {Array} lines - Lines of text from the file.
 * @returns {boolean} - Returns true if the file format is valid, false otherwise.
 */
async function isValidFileFormat(lines, masterKey) {
    try {
        console.log(lines.length);
        console.log(lines[lines.length - 1].trim());
        lines.forEach((line) => {
            console.log(line);
        });
        if (lines.length == 0) {
            return false;
        }
        if (lines[lines.length - 1].trim() !== ">>>><<<<") {
            return false;
        }
        let hmacLine = lines[lines.length - 2].trim().split(":");
        if (hmacLine[0] !== "HMAC") {
            return false;
        }
        return await validateFileHmac(hmacLine[1], lines.slice(0, lines.length - 2), masterKey);
    } catch {
        return false;
    }
}

/**
 * Processes key-value pairs in the secrets section and converts them into an object.
 * @param {Array} lines - Lines containing key-value pairs.
 * @returns {object} - Returns an object with key-value pairs.
 */
function processSecrets(lines) {
    const secrets = {};
    lines.forEach((line) => {
        const [key, value] = line.split(":").map((item) => item.trim());
        if (key && value) {
            secrets[key] = value;
        }
    });
    return secrets;
}

/**
 * Processes the integrity section (HMAC and DATE) and converts it into an object.
 * @param {Array} lines - Lines containing integrity information.
 * @returns {object} - Returns an object with HMAC and DATE values.
 */
function processIntegrity(lines) {
    const integrity = {};
    lines.forEach((line) => {
        const [key, value] = line.split(":").map((item) => item.trim());
        if (key && value) {
            integrity[key] = value;
        }
    });
    return integrity;
}

/**
 * Validates the HMAC of the file content.
 * @param {string} hmac - The HMAC value to validate.
 * @param {Array} lines - Lines of text from the file excluding the HMAC line.
 * @returns {boolean} - Returns true if the HMAC is valid, false otherwise.
 */
async function validateFileHmac(hmac, lines, masterKey) {
    let fileContent = lines.map(line => line.trim()).join("\n");
    console.log("validateFileHmac", hmac);
    return await verify(masterKey, hmac, fileContent);
}

async function generateFileHmac(fileContent, masterKey) {
    return await sign(masterKey, fileContent);
}

export {
    readFileLineByLine,
    generateFileHmac
};