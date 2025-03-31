import passwordManagerConfig from '../config/PasswordManagerConfig';
import { bytesToMB } from '../utils/DataUtils';
import { readFileLineByLine } from '../utils/FileUtils';

export const useFileOperations = (state, handlers) => {
  const { 
    setFile, 
    setFileContentJson, 
    masterKey,
    setBackDrop
  } = state;
  
  const { setStatusbar, resetState } = handlers;

  const validateFileTypeAndSize = (file) => {
    if (file.size > passwordManagerConfig.fileSize) {
      setStatusbar(
        true,
        `File size exceeds ${bytesToMB(passwordManagerConfig.fileSize)} MB`,
        true
      );
      return false;
    }
    if (!passwordManagerConfig.fileType.includes(file.type)) {
      setStatusbar(
        true,
        "Invalid file type. Please upload correct file.",
        true
      );
      return false;
    }
    setStatusbar(false, "", false);
    return true;
  };

  const processAndDisplayUploadedFile = async (uploadedFile) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const [status, result] = await readFileLineByLine(e.target.result, masterKey);
      if (status === "error") {
        setStatusbar(true, result, true);
        return;
      }
      setFileContentJson(result);
      setFile(uploadedFile);
      setStatusbar(false, "File loaded successfully", true);
    };
    reader.onerror = () => {
      setStatusbar(true, "Error reading file", true);
    };
    reader.readAsText(uploadedFile);
  };

  const handleFileUpload = async (event) => {
    if (!masterKey) {
      setStatusbar(true, "Master key not added. Please add your master key.", true);
      return;
    }
    resetState();
    setBackDrop(true);
    const uploadedFile = event.target.files[0];
    if (uploadedFile && validateFileTypeAndSize(uploadedFile)) {
      await processAndDisplayUploadedFile(uploadedFile);
    }
    setBackDrop(false);
  };

  const handleFileUploadWhenNewFileGenerationInProgress = (event) => {
    if (!masterKey) {
      setStatusbar(true, "Master key not added. Please add your master key.", true);
      return;
    }
    const userConfirmed = window.confirm(
      "Loading a new file will erase all the current data. Do you want to proceed?"
    );
    if (userConfirmed) {
      handleFileUpload(event);
    }
  };

  return {
    handleFileUpload,
    handleFileUploadWhenNewFileGenerationInProgress,
    processAndDisplayUploadedFile,
    validateFileTypeAndSize
  };
};