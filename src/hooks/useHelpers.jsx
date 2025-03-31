export const useHelpers = (state, setters) => {
    const showDialog = (title, message) => {
      setters.setDialogTitle(title);
      setters.setDialogMessage(message);
      setters.setDialogOpen(true);
    };
  
    const setStatusbar = (isError, message, openStatusbar) => {
      setters.setIsError(isError);
      setters.setMessage(message);
      setters.setOpenStatusbar(openStatusbar);
    };
  
    const resetState = () => {
      setters.setFileContentJson({ secrets: {}, integrity: {} });
      setters.setIsError(false);
      setters.setMessage("");
      setters.setOpenStatusbar(false);
      setters.setFile(null);
      if (setters.setIsGenerateFile) {
        setters.setIsGenerateFile(false);
      }
      if (setters.setAddNewSecret) {
        setters.setAddNewSecret(false);
      }
      if (setters.setIsDecryptingSecret) {
        setters.setIsDecryptingSecret(false);
      }
    };
  
    const unloadMasterKey = () => {
      const userConfirmed = window.confirm(
        "This action will reset the application state. Do you want to proceed?"
      );
      if (userConfirmed) {
        resetState();
        setters.setMasterKey("");
        setStatusbar(
          false,
          "Master key removed and application state has been reset.",
          true
        );
      }
    };
  
    const generateFileContentForPreview = (fileContentJson) => {
      if (
        !fileContentJson ||
        !fileContentJson?.secrets ||
        !fileContentJson?.integrity
      ) {
        return "";
      }
      const secretKeys = Object.keys(fileContentJson.secrets);
      const integrityKeys = Object.keys(fileContentJson.integrity);
  
      return `This is an auto generated File. Please do not tamper with it.\n<<<<>>>>\n${secretKeys
        .map((key) => `${key}: ${fileContentJson.secrets[key]}`)
        .join("\n")}\n<<<<<>>>>>\n${integrityKeys
        .map((key) => `${key}: ${fileContentJson.integrity[key]}`)
        .join("\n")}\n>>>><<<<`;
    };
  
    const isEmptyObj = (obj) => {
      return Object.keys(obj).length === 0;
    };
  
    return {
      showDialog,
      setStatusbar,
      resetState,
      unloadMasterKey,
      generateFileContentForPreview,
      isEmptyObj
    };
  };