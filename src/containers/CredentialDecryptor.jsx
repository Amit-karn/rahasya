import React, { useEffect, useReducer, useState } from "react";
import { Button, Box, Stack } from "@mui/material";
import { VpnKeyOutlined } from "@mui/icons-material";
import { BaseLayout } from "../components/BaseLayout";
import { SecretsList } from "../components/SecretsList";
import FileUpload from "../components/FileUpload";
import StatusBar from "../components/StatusBar";
import AddMasterKey from "../components/AddMasterKey";
import MessageDialog from "../components/MessageDialog";
import PreviewPanel from "../components/PreviewPanel";
import DecryptSecret from "../components/DecryptSecret";
import LoadingOverlay from "../components/LoadingOverlay";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import { generateFileContentForPreview, isEmptyObj } from "../utils/DataUtils";
import {
  validateFileTypeAndSize,
  processAndDisplayUploadedFile,
  handleFileUpload,
} from "../utils/FileUtils";
import DownloadFile from "../components/DownloadFile";
import UploadedFileInfo from "../components/UploadedFileInfo";

const initialState = {
  file: null, // The uploaded file object
  fileData: {
    secrets: {}, // Stores secrets read from file
    integrity: {}, // Stores integrity data
  },
  masterKey: null, // The master key for decryption
  isMasterKeyDialogOpen: false, // Controls visibility of Add/Update Master Key dialog
  isMessageDialogOpen: false, // Controls visibility of the message dialog
  messageDialogTitle: "", // Title for message dialog
  messageDialogContent: "", // Content for message dialog
  isLoading: false, // Controls visibility of the loading overlay
  isStatusBarVisible: false, // Controls visibility of the status bar
  statusBarError: false, // Indicates error state for status bar
  statusBarMessage: "", // Message to display in the status bar
};

function credentialDecryptorReducer(state, action) {
  switch (action.type) {
    case "SET_FILE":
      return { ...state, file: action.payload };
    case "SET_FILE_DATA":
      return { ...state, fileData: action.payload };
    case "SET_MASTER_KEY":
      return { ...state, masterKey: action.payload };
    case "TOGGLE_MASTER_KEY_DIALOG":
      return { ...state, isMasterKeyDialogOpen: action.payload };
    case "SHOW_MESSAGE_DIALOG":
      return {
        ...state,
        isMessageDialogOpen: true,
        messageDialogTitle: action.payload.title,
        messageDialogContent: action.payload.content,
      };
    case "HIDE_MESSAGE_DIALOG":
      return { ...state, isMessageDialogOpen: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SHOW_STATUS_BAR":
      return {
        ...state,
        isStatusBarVisible: true,
        statusBarError: action.payload.isError,
        statusBarMessage: action.payload.message,
      };
    case "HIDE_STATUS_BAR":
      return { ...state, isStatusBarVisible: false };
    // Action: Reset all state except master key.
    case "RESET_STATE_EXCEPT_MASTER_KEY":
      return {
        ...initialState,
        masterKey: state.masterKey,
      };
    // Reset entire component state (including master key)
    case "RESET_STATE":
      return initialState;
    default:
      return state;
  }
}

const CredentialDecryptor = () => {
  const [state, dispatch] = useReducer(
    credentialDecryptorReducer,
    initialState
  );
  const [isDecryptingSecret, setIsDecryptingSecret] = useState(false);
  const [currentKey, setCurrentKey] = useState("");
  const [currentEncryptedSecret, setCurrentEncryptedSecret] = useState("");

  const {
    file,
    fileData,
    masterKey,
    isMasterKeyDialogOpen,
    isMessageDialogOpen,
    messageDialogTitle,
    messageDialogContent,
    isLoading,
    isStatusBarVisible,
    statusBarError,
    statusBarMessage,
  } = state;

  // Utility to update status bar
  const setStatusBar = (isError, message) => {
    dispatch({
      type: "SHOW_STATUS_BAR",
      payload: { isError, message },
    });
  };

  // Utility to toggle loading overlay
  const setBackDrop = (isVisible) => {
    dispatch({ type: "SET_LOADING", payload: isVisible });
  };

  const handleFileUploadWrapper = async (event) => {
    await handleFileUpload(
      event,
      masterKey,
      setStatusBar,
      setBackDrop,
      (file) => validateFileTypeAndSize(file, setStatusBar),
      async (file) =>
        await processAndDisplayUploadedFile(
          file,
          (content) => dispatch({ type: "SET_FILE_DATA", payload: content }),
          (file) => dispatch({ type: "SET_FILE", payload: file }),
          setStatusBar,
          masterKey
        )
    );
  };

  useEffect(() => {
      dispatch({
        type: "SHOW_MESSAGE_DIALOG",
        payload: {
          title: "Master Key Required",
          content: "Please add your master key to proceed.",
        },
      });
  }, []);

  // Handle decryption: set current key and encrypted secret (which will be passed to DecryptSecret)
  const handleDecryptButton = (key, encryptedSecret) => {
    if (!masterKey) {
      setStatusBar(true, "Master key not added. Please add your master key.");
      return;
    }
    setCurrentKey(key);
    setCurrentEncryptedSecret(encryptedSecret);
    setIsDecryptingSecret(true);
  };

  // For adding decrypted secret to UI if needed. (For decryption mode you might simply show the decrypted secret.)
  const addToFileDataSecretsSection = async (key, secret) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const currentDate = new Date().toLocaleDateString("en-CA");
    const tempFileData = {
      secrets: { ...fileData.secrets, [key]: secret },
      integrity: { ...fileData.integrity, DATE: currentDate, HMAC: "" },
    };

    try {
      const tempFileContentStr = generateFileContentForPreview(tempFileData);
      const newHmac = await generateFileHmac(
        tempFileContentStr.slice(0, tempFileContentStr.indexOf("HMAC: ")),
        masterKey
      );
      dispatch({
        type: "SET_FILE_DATA",
        payload: {
          secrets: { ...fileData.secrets, [key]: secret },
          integrity: { DATE: currentDate, HMAC: newHmac },
        },
      });
    } catch {
      setStatusBar(true, "Error adding secret");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const headerActions = (
    <Stack direction="column" spacing={2} alignItems="flex-start">
      {/* <Stack direction={{ xs: "column", md: "row" }} spacing={2}> */}
        <FileUpload
          file={file}
          handleFileChange={handleFileUploadWrapper}
          buttonVariant={file ? "outlined" : "contained"}
          reset={() => dispatch({ type: "RESET_STATE_EXCEPT_MASTER_KEY" })}
          disabled={!masterKey}
          isGeneratingFile={false} // For decryption, file-generation is not be needed
          mode="decrypt"
        />
        {/* <Button
          onClick={() => dispatch({ type: "RESET_STATE_EXCEPT_MASTER_KEY" })}
          disabled={!masterKey}
          variant={file ? "contained" : "outlined"}
          size="small"
        >
          {file ? "Reload file" : "Load File"}
        </Button> */}
      {/* </Stack> */}
      {file && (
        <UploadedFileInfo
          file={file}
          onReset={() => dispatch({ type: "RESET_STATE_EXCEPT_MASTER_KEY" })}
        />
      )}
    </Stack>
  );

  const mainActions = (
    <Button
      onClick={() =>
        dispatch({ type: "TOGGLE_MASTER_KEY_DIALOG", payload: true })
      }
      variant={masterKey ? "outlined" : "contained"}
      size="small"
      startIcon={<VpnKeyOutlined />}
    >
      {masterKey ? "Update Master Key" : "Add Master Key"}
    </Button>
  );

  return (
    <BaseLayout
      masterKey={masterKey}
      onUnloadMasterKey={() => {
        const userConfirmed = window.confirm(
          "This action will reset the application state. Do you want to proceed ?"
        );
        if (userConfirmed) {
          dispatch({ type: "RESET_STATE" });
        }
      }}
      headerActions={headerActions}
      mainActions={mainActions}
      fileData={fileData}
    >
      {fileData && !isEmptyObj(fileData.secrets) && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 1 },
            marginTop: 1,
            height: { xs: "80vh", md: "calc(100vh - 200px)" },
            width: "100%",
          }}
        >
          <SecretsList
            secrets={fileData.secrets}
            onRemoveSecret={() => {}}
            onDecryptSecret={handleDecryptButton}
            mode="decrypt"
          />
          <PreviewPanel fileContent={generateFileContentForPreview(fileData)} />
        </Box>
      )}

      <AddMasterKey
        masterKey={masterKey || ""}
        setMasterKey={(key) => {
          dispatch({ type: "RESET_STATE" });
          dispatch({ type: "SET_MASTER_KEY", payload: key });
          dispatch({
            type: "SHOW_STATUS_BAR",
            payload: {
              isError: false,
              message: masterKey
                ? "Master key updated successfully"
                : "Master key added successfully",
            },
          });
        }}
        openMasterKeyDialog={isMasterKeyDialogOpen}
        setOpenMasterKeyDialog={(isOpen) =>
          dispatch({ type: "TOGGLE_MASTER_KEY_DIALOG", payload: isOpen })
        }
        setStatusBar={setStatusBar}
      />

      {masterKey && (
        <DecryptSecret
          openPopup={isDecryptingSecret}
          setOpenPopup={setIsDecryptingSecret}
          algorithm={passwordManagerConfig.algorithm}
          masterKey={masterKey}
          keyName={currentKey}
          encryptedSecret={currentEncryptedSecret}
        />
      )}

      <StatusBar
        isError={statusBarError}
        statusMessage={statusBarMessage}
        isOpen={isStatusBarVisible}
        onClose={() => dispatch({ type: "HIDE_STATUS_BAR" })}
      />

      <MessageDialog
        open={isMessageDialogOpen}
        onClose={(_, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            dispatch({ type: "HIDE_MESSAGE_DIALOG" });
          }
        }}
        title={messageDialogTitle}
        message={messageDialogContent}
        node={
          <Button
            variant={masterKey ? "outlined" : "contained"}
            color="primary"
            startIcon={<VpnKeyOutlined />}
            size="small"
            onClick={() => {
              dispatch({ type: "HIDE_MESSAGE_DIALOG" });
              dispatch({ type: "TOGGLE_MASTER_KEY_DIALOG", payload: true });
            }}
            disableElevation
          >
            Add Master Key
          </Button>
        }
      />

      <LoadingOverlay open={isLoading} />
    </BaseLayout>
  );
};

export default CredentialDecryptor;
