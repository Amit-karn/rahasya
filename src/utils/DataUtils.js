const bytesToMB = (bytes) => {
    return bytes / (1024 * 1024);
};

const maskMasterKey = (key) => {
    if (key.length <= 5) return "";
    return `${key.slice(0, 2)}${"*".repeat(key.length - 5)}${key.slice(-3)}`.slice(0, 20);
};

export {
    bytesToMB,
    maskMasterKey
};
