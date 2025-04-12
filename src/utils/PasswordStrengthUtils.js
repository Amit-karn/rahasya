import zxcvbn from "zxcvbn";
import { cryptoConfig } from "../config/CryptoConfig";

function getMinGuesses(data) {
    // Filter out items without a valid 'guesses' property and track guesses and their associated patterns
    const validGuesses = data
        .filter(item => item.guesses !== undefined)  // Only include items with 'guesses'
        .map(item => ({ pattern: item.pattern, guesses: item.guesses }));  // Create an object with pattern and guesses

    // If there are no valid guesses, return a default message
    if (validGuesses.length === 0) {
        return undefined;
    }

    // Find the object with the minimum guess value
    const minGuessItem = validGuesses.reduce((minItem, currentItem) => {
        return currentItem.guesses < minItem.guesses ? currentItem : minItem;
    });

    // Return the pattern and minimum guess value
    return {
        pattern: minGuessItem.pattern,
        guesses: minGuessItem.guesses
    };
}

function checkPasswordStrength(password) {
    const result = {
        strength: 'Weak',  // Default to weak
        warning: [],       // Any warnings
        suggestions: [],
        passwordCrackDetails: []    // Suggestions for improvement
    };

    const zxcvbnResult = zxcvbn(password);
    // Check the score to determine password strength
    const score = zxcvbnResult.score;
    const minGuess = getMinGuesses(zxcvbnResult.sequence);

    // Extract crack times for easier comparison
    const crackTimes = zxcvbnResult.crack_times_display;
    const crackTimeOnlineThrottling = crackTimes.online_throttling_100_per_hour;
    const crackTimeOnlineNoThrottling = crackTimes.online_no_throttling_10_per_second;
    const crackTimeOfflineSlowHashing = crackTimes.offline_slow_hashing_1e4_per_second;
    const crackTimeOfflineFastHashing = crackTimes.offline_fast_hashing_1e10_per_second;
    result.passwordCrackDetails = [
        `Minimum attempt to guess the password using "${minGuess.pattern}" pattern: ${minGuess.guesses} `,
        `Offline (Fast Hashing, 1e10 per second): ${crackTimeOfflineFastHashing} to crack.`,
        `Offline (Slow Hashing, 1e4 per second): ${crackTimeOfflineSlowHashing} to crack.`,
        `Online (No Throttling, 10 per second): ${crackTimeOnlineNoThrottling} to crack.`,
        `Online (Throttling, 100 per hour): ${crackTimeOnlineThrottling} to crack.`
      ];

    // Logic for evaluating strength based on crack times and score
    if (score === 4) {
        // If all crack times are "centuries", password is strong
        if (crackTimeOnlineThrottling === 'centuries' && crackTimeOnlineNoThrottling === 'centuries' &&
            crackTimeOfflineSlowHashing === 'centuries' && crackTimeOfflineFastHashing === 'centuries' &&
            zxcvbnResult.feedback.warning.length === 0 && minGuess.guesses >= cryptoConfig.passwordGuessThreshold) {
            result.strength = 'Strong'; // Fully strong if all are centuries
        } else {
            result.strength = 'Medium';
        }
    } else {
        // If the score is less than 4, it's considered weak
        result.strength = 'Weak';
    }

    // Add feedback suggestions if available
    if (zxcvbnResult.feedback.warning.length > 0) {
        result.warning = zxcvbnResult.feedback.warning;
    }

    // Add feedback suggestions if available
    if (zxcvbnResult.feedback.suggestions.length > 0) {
        result.suggestions = zxcvbnResult.feedback.suggestions;
    }

    return result;
}

export {
    checkPasswordStrength
}