import { useLayoutEffect, useState, useEffect } from "react";
import {
  Container,
  Box,
  Paper,
  IconButton,
  Button,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import {
  AddCircleOutline,
  LibraryAddOutlined,
  VpnKeyOutlined,
  DeleteForeverOutlined,
  Close,
  LockOpenOutlined,
} from "@mui/icons-material";
import FileUpload from "./components/FileUpload";
import StatusBar from "./components/StatusBar";
import { readFileLineByLine } from "./utils/FileUtils";
import AddSecret from "./components/AddSecret";
import passwordManagerConfig from "./config/PasswordManagerConfig";
import { bytesToMB, maskMasterKey } from "./utils/DataUtils";
import TopHeader from "./components/TopHeader";
import SecretItem from "./components/SecretItem";
import AddMasterKey from "./components/AddMasterKey";
import MessageDialog from "./components/MessageDialog";
import PreviewPanel from "./components/PreviewPanel";
import DownloadFile from "./components/DownloadFile";
import DecryptSecret from "./components/DecryptSecret";

const CredentialDecryptor = () => {
  // State variables
  const [file, setFile] = useState(null);
  const [fileContentJson, setFileContentJson] = useState({
    secrets: {},
    integrity: {},
  });
  const [openStatusbar, setOpenStatusbar] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [IsDecryptingSecret, setIsDecryptingSecret] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [openMasterKeyDialog, setOpenMasterKeyDialog] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const [currentKey, setCurrentKey] = useState("");
  const [currentEncryptedSecret, setCurrentEncryptedSecret] = useState("");

  useEffect(() => {
    if (!masterKey) {
      showDialog(
        "Master Key Required",
        "Please add your master key to proceed."
      );
    }
  }, []);

  // Helper functions
  const resetState = () => {
    setFileContentJson({ secrets: {}, integrity: {} });
    setIsError(false);
    setMessage("");
    setOpenStatusbar(false);
    setFile(null);
    setIsDecryptingSecret(false);
  };

  const setFileDetails = (fileContentJson, file) => {
    setFileContentJson(fileContentJson);
    setFile(file);
  };

  const setStatusbar = (isError, message, openStatusbar) => {
    setIsError(isError);
    setMessage(message);
    setOpenStatusbar(openStatusbar);
  };

  const unloadMasterKey = () => {
    const userConfirmed = window.confirm(
      "This action will reset the application state. Do you want to proceed?"
    );
    if (userConfirmed) {
      resetState();
      setMasterKey("");
      setStatusbar(
        false,
        "Master key removed and application state has been reset.",
        true
      );
    }
  };

  const showDialog = (title, message) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  // Function to show master key not added status
  const showMasterKeyNotAddedStatus = () => {
    setStatusbar(
      true,
      "Master key not added. Please add your master key.",
      true
    );
  };

  const addToFileContentJsonSecretsSection = (key, secret) => {
    if (!masterKey) {
      showMasterKeyNotAddedStatus();
      return;
    }
    setFileContentJson((prevContent) => ({
      ...prevContent,
      secrets: { [key]: secret, ...prevContent.secrets },
    }));
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

    return `This is an auto generated File. Please don't tamper with it.\n<<<<>>>>\n${secretKeys
      .map((key) => `${key}: ${fileContentJson.secrets[key]}`)
      .join("\n")}\n<<<<<>>>>>\n${integrityKeys
      .map((key) => `${key}: ${fileContentJson.integrity[key]}`)
      .join("\n")}\n>>>><<<<`;
  };

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

  const handleFileUpload = (event) => {
    if (!masterKey) {
      showMasterKeyNotAddedStatus();
      return;
    }
    resetState();
    const uploadedFile = event.target.files[0];
    if (uploadedFile && validateFileTypeAndSize(uploadedFile)) {
      processAndDisplayUploadedFile(uploadedFile);
    }
  };

  const processAndDisplayUploadedFile = (uploadedFile) => {
    const reader = new FileReader();
    reader.onload = async(e) => {
      const [status, result] = await readFileLineByLine(e.target.result, masterKey);
      if (status === "error") {
        setStatusbar(true, result, true);
        return;
      }
      setFileDetails(result, uploadedFile);
      setStatusbar(false, "File loaded successfully", true);
    };
    reader.onerror = () => {
      setStatusbar(true, "Error reading file", true);
    };
    reader.readAsText(uploadedFile);
  };

  const handleFileUploadWhenNewFileGenerationInProgress = (event) => {
    if (!masterKey) {
      showMasterKeyNotAddedStatus();
      return;
    }
    const userConfirmed = window.confirm(
      "Loading a new file will erase all the current data. Do you want to proceed?"
    );
    if (userConfirmed) {
      handleFileUpload(event);
    }
  };

  const handleDecryptButton = (key, encryptedSecret) => () => {
    if (!masterKey) {
      showMasterKeyNotAddedStatus();
      return;
    }
    setCurrentKey(key);
    setCurrentEncryptedSecret(encryptedSecret);
    setIsDecryptingSecret(true);
  };

  const isEmptyObj = (obj) => {
    return Object.keys(obj).length === 0;
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        padding: {
          xs: 2, // 16px padding on extra-small screens
          sm: 3, // 24px padding on small screens
          md: 4, // 32px padding on medium and up screens
        },
        width: "90%",
        margin: "0 auto", // Center the container
      }}
    >
      {/* Top header Starts */}
      <TopHeader />

      {/* Upload File Section Starts */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        marginTop={2}
        gap={{ xs: 3, md: 2 }}
      >
        <FileUpload
          file={file}
          handleFileChange={handleFileUpload}
          buttonVariant={file ? "outlined" : "contained"}
          reset={resetState}
          disabled={!masterKey}
          isGenerateFile={false}
        />
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <Button
            variant={masterKey ? "outlined" : "contained"}
            color="primary"
            startIcon={<VpnKeyOutlined />}
            size="small"
            onClick={() => setOpenMasterKeyDialog(true)}
          >
            {masterKey ? "Update Master Key" : "Add Master Key"}
          </Button>
          {masterKey && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" color="primary">
                Master Key: {maskMasterKey(masterKey)}
              </Typography>
              <IconButton size="small" onClick={unloadMasterKey}>
                <Close />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* Display Secrets Section */}
      {fileContentJson && !isEmptyObj(fileContentJson.secrets) && (
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
          {/* Left Panel */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              maxHeight: { xs: "40vh", md: "100%" },
              height: "100%",
              padding: { xs: 2, md: 1.5 },
              "&::-webkit-scrollbar": {
                display: "none",
              },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              width: { xs: "95%", md: "45%" },
            }}
          >
            <Stack direction="column" spacing={1.5}>
              {Object.keys(fileContentJson.secrets).map((key) => (
                <SecretItem
                  key={key}
                  keyName={key}
                  icon={<LockOpenOutlined />}
                  secret={fileContentJson.secrets[key]}
                  handleClick={handleDecryptButton(
                    key,
                    fileContentJson.secrets[key]
                  )}
                  buttonContent={"decrypt"}
                />
              ))}
            </Stack>
          </Box>

          {/* Right Panel */}
          <Box
            sx={{
              width: { xs: "95%", md: "45%" },
              height: { xs: "40vh", md: "100%" },
              display: "flex", // Add this
              flexDirection: "column", // Add this
              overflow: "hidden", // Add this
            }}
          >
            <PreviewPanel
              fileContent={generateFileContentForPreview(fileContentJson)}
            />
          </Box>
        </Box>
      )}

      {/* Add Master Key Section */}
      <AddMasterKey
        masterKey={masterKey}
        setMasterKey={(key) => {
          resetState();
          setMasterKey(key);
          setStatusbar(
            false,
            `${
              masterKey
                ? "Master key updated successfully"
                : "Master key added successfully"
            }`,
            true
          );
        }}
        openMasterKeyDialog={openMasterKeyDialog}
        setOpenMasterKeyDialog={setOpenMasterKeyDialog}
        setStatusBar={setStatusbar}
      />

      <DecryptSecret
        openPopup={IsDecryptingSecret}
        setOpenPopup={setIsDecryptingSecret}
        algorithm={passwordManagerConfig.algorithm}
        masterKey={masterKey}
        keyName={currentKey}
        encryptedSecret={currentEncryptedSecret}
      />

      {/* Status Bar Section */}
      <StatusBar
        isError={isError}
        message={message}
        openStatusbar={openStatusbar}
        setOpenStatusbar={setOpenStatusbar}
      />
      <MessageDialog
        open={dialogOpen}
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            setDialogOpen(false);
          }
        }}
        title={dialogTitle}
        message={dialogMessage}
        node={
          <Button
            variant={masterKey ? "outlined" : "contained"}
            color="primary"
            startIcon={<VpnKeyOutlined />}
            size="small"
            onClick={() => {
              setDialogOpen(false);
              setOpenMasterKeyDialog(true);
            }}
            disableElevation
          >
            Add Master Key
          </Button>
        }
      />
    </Container>
  );
};

export default CredentialDecryptor;
