import { useLayoutEffect, useState } from "react";
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import {
  Add,
  Cancel,
  Key,
  Help,
  Home,
  Remove,
  AddCircleOutline,
  LibraryAddOutlined,
} from "@mui/icons-material";
import FileUpload from "./components/FileUpload";
import StatusBar from "./components/StatusBar";
import { readFileLineByLineSync } from "./utils/EncryptionFileUtils";
import AddSecret from "./components/AddSecret";
import passwordManagerConfig from "./config/PasswordManagerConfig";
import { bytesToMB } from "./utils/DataUtils";
import TopHeader from "./components/TopHeader";
import SecretItem from "./components/SecretItem";

const PasswordManager = () => {
  //Generate New File
  const [isGenerateFile, setIsGenerateFile] = useState(false);
  //load Existing file
  const [file, setFile] = useState(null);
  const [fileContentJson, setFileContentJson] = useState({
    secrets: {},
    integrity: {},
  }); // To store the content of the file

  //To show success/error message
  const [openStatusbar, setOpenStatusbar] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");

  //Add New Secret
  const [addNewSecret, setAddNewSecret] = useState(false);

  useLayoutEffect(() => {
    if (
      isGenerateFile &&
      isEmptyObj(fileContentJson.secrets) &&
      !addNewSecret
    ) {
      const userConfirmed = window.confirm(
        "No secrets added. Do you want to reset the application state ?"
      );
      if (userConfirmed) {
        resetState();
      } else {
        setAddNewSecret(true);
      }
    }
  }, [fileContentJson.secrets, isGenerateFile, addNewSecret]);

  const resetState = () => {
    setIsGenerateFile(false);
    setFileContentJson({ secrets: {}, integrity: {} }); // Reset the file content
    setIsError(false);
    setMessage("");
    setOpenStatusbar(false);
    setFile(null);
    setAddNewSecret(false);
  };

  const setFileDetails = (isGenerateFile, fileContentJson, file) => {
    setIsGenerateFile(isGenerateFile);
    setFileContentJson(fileContentJson);
    setFile(file);
  };

  const setStatusbar = (isError, message, openStatusbar) => {
    setIsError(isError);
    setMessage(message);
    setOpenStatusbar(openStatusbar);
  };

  const addToFileContentJsonSecretsSection = (key, secret) => {
    setFileContentJson((prevContent) => {
      return {
        ...prevContent,
        secrets: { [key]: secret, ...prevContent.secrets },
      };
    });
  };

  const startNewFileCreation = () => {
    setAddNewSecret(true);
    setIsGenerateFile(true);
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

    return `This is an auto generated File. Please don't tamper with it.\n
      <<<<>>>>\n${secretKeys
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
    resetState();
    const uploadedFile = event.target.files[0];
    if (uploadedFile && validateFileTypeAndSize(uploadedFile)) {
      // Read the file content to display in the preview
      processAndDisplayUploadedFile(uploadedFile);
    }
  };

  const processAndDisplayUploadedFile = (uploadedFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const [status, result] = readFileLineByLineSync(e.target.result);
      if (status === "error") {
        setStatusbar(true, result, true);
        return;
      }
      setFileDetails(false, result, uploadedFile);
      setStatusbar(false, "File loaded successfully", true);
    };
    reader.onerror = () => {
      setStatusbar(true, "Error reading file", true);
    };
    reader.readAsText(uploadedFile);
  };

  const handleFileUploadWhenNewFileGenerationInProgress = (event) => {
    const userConfirmed = window.confirm(
      "Loading a new file will erase all the current data. Do you want to proceed?"
    );
    if (userConfirmed) {
      handleFileUpload(event);
    }
  };

  const removeSecret = (key) => () => {
    if (fileContentJson && Object.keys(fileContentJson.secrets).length === 1) {
      const userConfirmed = window.confirm(
        "This action will remove all secrets and resert application state. Do you want to proceed ?"
      );
      if (userConfirmed) {
        resetState();
      }
    } else {
      setFileContentJson((prevContent) => {
        const newSecrets = { ...prevContent.secrets };
        delete newSecrets[key];
        return { ...prevContent, secrets: newSecrets };
      });
    }
  };

  const isEmptyObj = (obj) => {
    return Object.keys(obj).length === 0;
  };

  return (
    <Container maxWidth fixed sx={{ marginLeft: 10, padding: 2 }}>
      {/* Top header Starts*/}
      {isGenerateFile ? (
        <TopHeader
          node={
            <FileUpload
              file={file}
              handleFileChange={handleFileUploadWhenNewFileGenerationInProgress}
              buttonVariant={"outlined"}
            />
          }
        />
      ) : (
        <TopHeader />
      )}

      {/* Upload/Generate File Section Starts */}
      <Stack
        direction={{ xs: "column", sm: "column", md: "row", lg: "row" }}
        justifyContent={{
          xs: "wrap",
          sm: "wrap",
          md: "space-between",
          lg: "space-between",
        }}
        alignItems="center"
        marginTop={2}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="flex-start"
          divider={!file && <Typography>- or -</Typography>}
        >
          {!isGenerateFile && (
            <FileUpload
              file={file}
              handleFileChange={handleFileUpload}
              buttonVariant={file ? "outlined" : "contained"}
            />
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={file ? <AddCircleOutline /> : <LibraryAddOutlined />}
            component="div"
            size="small"
            // sx={
            //   file && { position: "sticky", top: 0, zIndex: 1, marginBottom: 2 }
            // }
            onClick={file ? () => setAddNewSecret(true) : startNewFileCreation}
          >
            {file ? "Add Secret" : "Generate New File"}
          </Button>
        </Stack>
        <Typography variant="h4">Password Manager</Typography>
      </Stack>

      {/* Display Secrets Section */}
      {fileContentJson && !isEmptyObj(fileContentJson.secrets) && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
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
              padding: 2,
              "&::-webkit-scrollbar": {
                display: "none",
              },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              width: { xs: "100%", md: "50%" },
            }}
          >
            <Stack direction="column" spacing={2}>
              {Object.keys(fileContentJson.secrets).map((key) => (
                <SecretItem
                  key={key}
                  keyName={key}
                  icon={<Remove sx={{ m: 0, p: 0, width: "auto" }} />}
                  secret={fileContentJson.secrets[key]}
                  handleClick={removeSecret(key)}
                />
              ))}
            </Stack>
          </Box>

          {/* Right Panel */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              maxHeight: { xs: "40vh", md: "100%" },
            }}
          >
            <Paper
              sx={{
                backgroundColor: "#f3f4f6",
                width: "100%",
                height: "100%",
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
              elevation={0}
            >
              <Typography
                variant="body1"
                component="pre"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  margin: 0,
                  padding: 2,
                  fontFamily: "monospace",
                  fontSize: { xs: "0.875rem", md: "1rem" },
                }}
              >
                {generateFileContentForPreview(fileContentJson)}
              </Typography>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Status Bar and Add Secret Section */}
      {openStatusbar && (
        <StatusBar
          isError={isError}
          message={message}
          openStatusbar={openStatusbar}
          setOpenStatusbar={setOpenStatusbar}
        />
      )}

      {addNewSecret && (
        <AddSecret
          openPopup={addNewSecret}
          setOpenPopup={setAddNewSecret}
          algorithm={passwordManagerConfig.algorithm}
          masterKey="test123"
          addToSecretsList={addToFileContentJsonSecretsSection}
          existingSecrets={Object.keys(fileContentJson.secrets)}
        />
      )}
    </Container>
  );
};

export default PasswordManager;
