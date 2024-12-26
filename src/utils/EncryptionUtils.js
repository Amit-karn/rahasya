async function generateEncryptionKey(tempMasterKey) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    let generatedKey = `generated_${Date.now()}_${tempMasterKey}`;
    generatedKey = generatedKey + "E".repeat(256);
    return generatedKey;
}


export {
    generateEncryptionKey
}