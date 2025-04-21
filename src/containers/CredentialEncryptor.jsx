import { useEffect, useReducer } from "react";
import { Button, Stack, Box } from "@mui/material";
import { KeyRounded } from "@mui/icons-material";
import { BaseLayout } from "../components/BaseLayout";
import { SecretsList } from "../components/SecretsList";
import FileUpload from "../components/FileUpload";
import StatusBar from "../components/StatusBar";
import AddSecret from "../components/AddSecret";
import AddMasterKey from "../components/AddMasterKey";
import MessageDialog from "../components/MessageDialog";
import PreviewPanel from "../components/PreviewPanel";
import LoadingOverlay from "../components/LoadingOverlay";
import { generateFileHmac } from "../utils/FileUtils";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import { generateFileContentForPreview, isEmptyObj } from "../utils/DataUtils";
import {
  validateFileTypeAndSize,
  processAndDisplayUploadedFile,
  handleFileUpload,
} from "../utils/FileUtils";
import UploadedFileInfo from "../components/UploadedFileInfo";
import { validateSecurityRequirements } from "../utils/SecurityUtils";

const initialState = {
  uploadedFile: null, // The uploaded file object
  fileData: {
    secrets: {}, // Stores secrets
    integrity: {}, // Stores integrity data
  },
  encryptionKey: null, // The master key for encryption/decryption
  isMasterKeyDialogOpen: false, // Controls the visibility of the "Add/Update Master Key" dialog
  isMessageDialogOpen: false, // Controls the visibility of the message dialog
  messageDialogTitle: "", // Title of the message dialog
  messageDialogContent: "", // Message content of the dialog
  isLoading: false, // Controls the visibility of the loading overlay
  isStatusBarVisible: false, // Controls the visibility of the status bar
  statusBarError: false, // Indicates if the status bar is showing an error
  statusBarMessage: "", // Message content for the status bar
  isFileGenerationInProgress: false, // Tracks if the user is generating a new file
  isAddSecretDialogOpen: false, // Tracks if the "Add Secret" dialog is open
};

function credentialEncryptorReducer(state, action) {
  switch (action.type) {
    case "SET_UPLOADED_FILE":
      return { ...state, uploadedFile: action.payload };
    case "SET_FILE_DATA":
      return { ...state, fileData: action.payload };
    case "SET_ENCRYPTION_KEY":
      return { ...state, encryptionKey: action.payload };
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
    case "SET_FILE_GENERATION_PROGRESS":
      return { ...state, isFileGenerationInProgress: action.payload };
    case "TOGGLE_ADD_SECRET_DIALOG":
      return { ...state, isAddSecretDialogOpen: action.payload };
    case "RESET_STATE":
      return initialState; // Resets the state to the initial state
    // Action: Reset all state properties except the master key.
    case "RESET_STATE_EXCEPT_MASTER_KEY":
      return {
        ...initialState,
        encryptionKey: state.encryptionKey,
      };
    default:
      return state;
  }
}

const CredentialEncryptor = () => {
  const [state, dispatch] = useReducer(
    credentialEncryptorReducer,
    initialState
  );

  const {
    uploadedFile,
    fileData,
    encryptionKey,
    isMasterKeyDialogOpen,
    isMessageDialogOpen,
    messageDialogTitle,
    messageDialogContent,
    isLoading,
    isStatusBarVisible,
    statusBarError,
    statusBarMessage,
    isFileGenerationInProgress,
    isAddSecretDialogOpen,
  } = state;

  useEffect(() => {
    const { isValid, errorOutput } = validateSecurityRequirements();

    if (!isValid) {
      alert(errorOutput);
      return;
    }
    dispatch({
      type: "SHOW_MESSAGE_DIALOG",
      payload: {
        title: "Master Key Required",
        content: "Please add your master key to proceed.",
      },
    });
    return () => {
      dispatch({ type: "RESET_STATE" });
    };
  }, []);

  const setStatusBar = (isError, message) => {
    dispatch({
      type: "SHOW_STATUS_BAR",
      payload: { isError, message },
    });
  };

  const setBackDrop = (isVisible) => {
    dispatch({ type: "SET_LOADING", payload: isVisible });
  };

  const handleFileUploadWrapper = async (event) => {
    await handleFileUpload(
      event,
      encryptionKey,
      setStatusBar,
      setBackDrop,
      (file) => validateFileTypeAndSize(file, setStatusBar),
      async (file) =>
        await processAndDisplayUploadedFile(
          file,
          (content) => dispatch({ type: "SET_FILE_DATA", payload: content }),
          (file) => dispatch({ type: "SET_UPLOADED_FILE", payload: file }),
          setStatusBar,
          encryptionKey
        )
    );
  };

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
        encryptionKey
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

  const removeSecret = async (key) => {
    if (fileData && Object.keys(fileData.secrets).length === 1) {
      const userConfirmed = window.confirm(
        "This action will remove all secrets. Do you want to proceed ?"
      );
      if (userConfirmed) {
        dispatch({ type: "RESET_STATE_EXCEPT_MASTER_KEY" });
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: true });
      const currentDate = new Date().toLocaleDateString("en-CA");
      const tempSecrets = { ...fileData.secrets };
      delete tempSecrets[key];

      const tempFileData = {
        secrets: tempSecrets,
        integrity: { ...fileData.integrity, DATE: currentDate },
      };

      try {
        const tempFileContentStr = generateFileContentForPreview(tempFileData);
        const newHmac = await generateFileHmac(
          tempFileContentStr.slice(0, tempFileContentStr.indexOf("HMAC: ")),
          encryptionKey
        );

        dispatch({
          type: "SET_FILE_DATA",
          payload: {
            secrets: tempSecrets,
            integrity: { DATE: currentDate, HMAC: newHmac },
          },
        });
      } catch {
        setStatusBar(true, "Error removing secret");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
  };

  return (
    <BaseLayout
      mode="encrypt"
      masterKey={encryptionKey}
      onUnloadMasterKey={() => {
        let userConfirmed = window.confirm(
          "This action will reset the application state. Do you want to proceed ?"
        );
        return userConfirmed ? dispatch({ type: "RESET_STATE" }) : "";
      }}
      headerActions={
        <Stack direction="column" spacing={2} alignItems="left">
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FileUpload
              file={uploadedFile}
              handleFileChange={handleFileUploadWrapper}
              buttonVariant={uploadedFile ? "outlined" : "contained"}
              reset={() => dispatch({ type: "RESET_STATE_EXCEPT_MASTER_KEY" })}
              disabled={!encryptionKey}
              isGeneratingFile={isFileGenerationInProgress}
            />
            <Button
              onClick={() => {
                dispatch({ type: "TOGGLE_ADD_SECRET_DIALOG", payload: true });
                dispatch({
                  type: "SET_FILE_GENERATION_PROGRESS",
                  payload: true,
                });
              }}
              disabled={!encryptionKey}
              variant={
                uploadedFile || isFileGenerationInProgress
                  ? "contained"
                  : "outlined"
              }
              component="span"
              size="small"
              width="10%"
            >
              {uploadedFile ||
              (isFileGenerationInProgress && !isEmptyObj(fileData.secrets))
                ? "Add Secret"
                : "Generate New File"}
            </Button>
          </Stack>
          {uploadedFile && (
            <UploadedFileInfo
              file={uploadedFile}
              onReset={() =>
                dispatch({ type: "RESET_STATE_EXCEPT_MASTER_KEY" })
              }
            />
          )}
        </Stack>
      }
      mainActions={
        <Button
          onClick={() =>
            dispatch({ type: "TOGGLE_MASTER_KEY_DIALOG", payload: true })
          }
          variant={encryptionKey ? "outlined" : "contained"}
          size="small"
        >
          {encryptionKey ? "Update Master Key" : "Add Master Key"}
        </Button>
      }
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
            onRemoveSecret={removeSecret}
            mode="encrypt"
          />
          <PreviewPanel fileContent={generateFileContentForPreview(fileData)} />
        </Box>
      )}

      <AddMasterKey
        masterKey={encryptionKey || ""}
        setMasterKey={(key) => {
          dispatch({ type: "RESET_STATE" });
          dispatch({ type: "SET_ENCRYPTION_KEY", payload: key });
          dispatch({
            type: "SHOW_STATUS_BAR",
            payload: {
              isError: false,
              message: encryptionKey
                ? "Master key updated successfully"
                : "Master key added successfully",
            },
          });
        }}
        openMasterKeyDialog={isMasterKeyDialogOpen}
        setOpenMasterKeyDialog={(isOpen) =>
          dispatch({ type: "TOGGLE_MASTER_KEY_DIALOG", payload: isOpen })
        }
        setStatusBar={(isError, message) => {
          dispatch({
            type: "SHOW_STATUS_BAR",
            payload: {
              isError,
              message,
            },
          });
        }}
      />

      <StatusBar
        isError={statusBarError}
        statusMessage={statusBarMessage}
        isOpen={isStatusBarVisible}
        onClose={(isOpen) =>
          dispatch({ type: "HIDE_STATUS_BAR", payload: isOpen })
        }
      />

      {encryptionKey && (
        <AddSecret
          openPopup={isAddSecretDialogOpen}
          setOpenPopup={(isOpen) =>
            dispatch({ type: "TOGGLE_ADD_SECRET_DIALOG", payload: isOpen })
          }
          algorithm={passwordManagerConfig.algorithm}
          masterKey={encryptionKey}
          addToSecretsList={addToFileDataSecretsSection}
          existingSecrets={Object.keys(fileData.secrets)}
          resetParentState={() => {
            if (isEmptyObj(fileData.secrets))
              dispatch({ type: "RESET_STATE_EXCEPT_MASTER_KEY" });
          }}
        />
      )}

      {isMessageDialogOpen && (
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
              variant={encryptionKey ? "outlined" : "contained"}
              color="primary"
              startIcon={<KeyRounded />}
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
      )}

      <LoadingOverlay open={isLoading} />
    </BaseLayout>
  );
};

export default CredentialEncryptor;
