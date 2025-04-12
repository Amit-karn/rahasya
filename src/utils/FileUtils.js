import { sign, verify } from "./CredLockerUtils";
import { bytesToMB } from "./DataUtils";
import passwordManagerConfig from "../config/PasswordManagerConfig";

/**
 * Validates the file type and size.
 * @param {File} file - The file to validate.
 * @param {Function} setStatusBar - Function to update the status bar.
 * @returns {boolean} - Returns true if the file is valid, otherwise false.
 */
const validateFileTypeAndSize = (file, setStatusBar) => {
    if (file.size > passwordManagerConfig.fileSize) {
        setStatusBar(
            true,
            `File size exceeds ${bytesToMB(passwordManagerConfig.fileSize)} MB`
        );
        return false;
    }
    if (!passwordManagerConfig.fileType.includes(file.type)) {
        setStatusBar(true, "Invalid file type. Please upload the correct file.");
        return false;
    }
    return true;
};

/**
 * Reads the file content as text using a Promise wrapper.
 * @param {File} uploadedFile - The uploaded file.
 * @returns {Promise<string>} - Resolves to the file content as text.
 */
const readFileContent = (uploadedFile) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Error reading file"));
        reader.readAsText(uploadedFile);
    });
};

/**
 * Validates the HMAC of the file content.
 * @param {string} hmac - The HMAC value to validate.
 * @param {Array} lines - Lines of text from the file excluding the HMAC line.
 * @param {string} masterKey - The master key for validation.
 * @returns {Promise<boolean>} - Returns true if the HMAC is valid.
 */
async function validateFileHmac(masterKey, hmac, lines) {
    return await verify(masterKey, hmac, lines.join("\n"));
}

/**
 * Validates the file format.
 * @param {Array} lines - Lines of text from the file.
 * @param {string} masterKey - The master key for validation.
 * @returns {Promise<boolean>} - Returns true if the file format is valid.
 */
async function validateFileIntegrity(masterKey, lines) {
    if (lines.length === 0 || lines[lines.length - 1] !== ">>>><<<<") {
        throw new Error("Invalid file format. Ensure the file contains the correct markers and structure.");
    }

    const hmacLine = lines[lines.length - 2].split(":");
    if (hmacLine[0] !== "HMAC") {
        throw new Error("Invalid file format. Ensure the file contains the correct markers and structure.");
    }

    const isValidHmac = await validateFileHmac(masterKey, hmacLine[1], lines.slice(0, lines.length - 2));
    if (!isValidHmac) {
        throw new Error("File has been tampered or Master key is invalid. Please retry with a valid file.");
    }
    return true;
}

/**
 * Reads the file line by line, processes the content and converts it to JSON format.
 * @param {String} fileContent - The file content to be processed.
 * @param {string} encryptionKey - The master key for validation.
 * @returns {Promise<Array>} - Returns an array with status and result (success or error message).
 */
async function readFileLineByLine(fileContent, encryptionKey) {
    try {
        const lines = fileContent.split("\n").map(line => line.trim());
        while (lines.length > 0 && lines[lines.length - 1] === "") {
            lines.pop();
        }

        if (!await validateFileIntegrity(encryptionKey, lines)) {
            return ["error", "File integrity validation failed."];
        }

        const secretsLines = [];
        const integrityLines = [];
        let isInsideSecrets = false;
        let isInsideIntegrity = false;

        for (const line of lines) {
            if (line === passwordManagerConfig.encryptedFileIntegrityHeader) {
                isInsideSecrets = !isInsideSecrets;
            } else if (line === passwordManagerConfig.encryptedFileIntegritySeparator) {
                isInsideIntegrity = true;
            } else if (line === passwordManagerConfig.encryptedFileIntegrityFooter) {
                break;
            } else if (isInsideIntegrity) {
                integrityLines.push(line);
            } else if (isInsideSecrets) {
                secretsLines.push(line);
            }
        }

        const secrets = processSecrets(secretsLines);
        const integrity = processIntegrity(integrityLines);

        return ["success", { secrets, integrity }];
    } catch (error) {
        console.error("Error reading file: " + error.message);
        return ["error", error.message];
    }
}

/**
 * Processes and displays the uploaded file.
 * @param {File} uploadedFile - The uploaded file.
 * @param {Function} setFileContentJson - Function to set the file content JSON.
 * @param {Function} setFile - Function to set the uploaded file.
 * @param {Function} setStatusBar - Function to update the status bar.
 * @param {string} encryptionKey - The encryption key for processing the file.
 */
const processAndDisplayUploadedFile = async (
    uploadedFile,
    setFileContentJson,
    setFile,
    setStatusBar,
    encryptionKey
) => {
    try {
        const fileContent = await readFileContent(uploadedFile);
        const [status, result] = await readFileLineByLine(fileContent, encryptionKey);
        if (status === "error") {
            setStatusBar(true, result);
            return;
        }
        setFileContentJson(result);
        setFile(uploadedFile);
        setStatusBar(false, "File loaded successfully");
    } catch {
        setStatusBar(true, "Something went wrong. Please try again.");
    }
}

/**
 * Handles the file upload process.
 * @param {Event} event - The file upload event.
 * @param {string} encryptionKey - The encryption key for processing the file.
 * @param {Function} setStatusBar - Function to update the status bar.
 * @param {Function} setBackDrop - Function to toggle the backdrop.
 * @param {Function} validateFile - Function to validate the file.
 * @param {Function} processFile - Function to process the file.
 */
const handleFileUpload = async (
    event,
    encryptionKey,
    setStatusBar,
    setBackDrop,
    validateFile,
    processFile
) => {
    if (!encryptionKey) {
        setStatusBar(true, "Master key not added. Please add your master key.");
        return;
    }
    setBackDrop(true);
    const uploadedFile = event.target.files[0];
    if (uploadedFile && validateFile(uploadedFile)) {
        await processFile(uploadedFile);
    }
    setBackDrop(false);
};

/**
 * Processes key-value pairs in the secrets section and converts them into an object.
 * @param {Array} lines - Lines containing key-value pairs.
 * @returns {object} - Returns an object with key-value pairs.
 */
function processSecrets(lines) {
    const secrets = {};
    lines.forEach((line) => {
        const [key, value] = line.split(":").map(item => item.trim());
        if (key && value) {
            secrets[key] = value;
        }
    });
    return secrets;
}

/**
 * Processes the integrity section and converts it into an object.
 * @param {Array} lines - Lines containing integrity information.
 * @returns {object} - Returns an object with HMAC and DATE values.
 */
function processIntegrity(lines) {
    const integrity = {};
    lines.forEach((line) => {
        const [key, value] = line.split(":").map(item => item.trim());
        if (key && value) {
            integrity[key] = value;
        }
    });
    return integrity;
}

/**
 * Generates the HMAC for the file content.
 * @param {string} fileContent - The file content.
 * @param {string} masterKey - The master key for signing.
 * @returns {string} - Returns the generated HMAC.
 */
async function generateFileHmac(fileContent, masterKey) {
    const lines = fileContent.split("\n").map(line => line.trim());
    while (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop();
    }

    return await sign(masterKey, lines.join("\n"));
}

export {
    validateFileTypeAndSize,
    processAndDisplayUploadedFile,
    handleFileUpload,
    generateFileHmac
};