/**
 * Checks if the browser environment supports required cryptographic operations
 * @returns {{ isValid: boolean, errors: string[] }} Result object with validation status and any error messages
 */
export const validateSecurityRequirements = () => {
  const isSubtleCryptoSupported = () => {
    return (
      typeof window !== "undefined" && window.crypto && window.crypto.subtle
    );
  };

  const securityChecks = {
    subtleCrypto: isSubtleCryptoSupported(),
    secureContext: window.isSecureContext
  };

  const errors = [];

  if (!securityChecks.subtleCrypto) {
    errors.push(
      "Your browser does not support secure cryptography (SubtleCrypto). " +
        "Cryptographic operations like encryption, decryption, and password generation will not work."
    );
  }

  if (!securityChecks.secureContext) {
    errors.push(
      "This application requires a secure context (HTTPS). " +
        "Cryptographic operations will be disabled until you access the site via HTTPS."
    );
  }

  const errorOutput =
    `Security Requirements Not Met:\n\n${errors.join("\n\n")}\n\n` +
    "Please ensure you're using a modern browser with a secure connection to enable all cryptographic features.";

  return {
    isValid: errors.length === 0,
    errorOutput
  };
};
