import { useEffect, useState } from "react";
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
} from "@mui/icons-material";
import FileUpload from "./components/FileUpload";
import StatusBar from "./components/StatusBar";
import { readFileLineByLineSync } from "./utils/EncryptionFileUtils";
import AddSecret from "./components/AddSecret";

const PasswordManager = () => {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState({
    secrets: {},
    integrity: {},
  }); // To store the content of the file
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [openStatusbar, setOpenStatusbar] = useState(false);
  const [addNewSecret, setAddNewSecret] = useState(false);
  const [isGenerateFile, setIsGenerateFile] = useState(false);

  const addToSecretsList = (key, secret) => {
    setFileContent((prevContent) => {
      return {
        ...prevContent,
        secrets: { [key]: secret, ...prevContent.secrets },
      };
    });
  };

  const generateFileContent = (fileContent) => {
    if (!fileContent || !fileContent?.secrets || !fileContent?.integrity) {
      return "";
    }
    const secretKeys = Object.keys(fileContent.secrets);
    const integrityKeys = Object.keys(fileContent.integrity);
    return `<<<<>>>>\n${secretKeys
      .map((key) => `${key}: ${fileContent.secrets[key]}`)
      .join("\n")}\n<<<<<>>>>>\n${integrityKeys
      .map((key) => `${key}: ${fileContent.integrity[key]}`)
      .join("\n")}\n>>>><<<<`;
  };

  // File validation function
  const validateFileTypeAndSize = (file) => {
    const maxSize = 1 * 1024 * 1024; // 1MB in bytes
    const allowedTypes = ["text/plain"];
    if (file.size > maxSize) {
      setIsError(true);
      setMessage("File size exceeds 1MB");
      return false;
    }
    if (!allowedTypes.includes(file.type)) {
      setIsError(true);
      setMessage("Invalid file type. Please upload correct file.");
      return false;
    }
    setIsError(false);
    return true;
  };

  // Handle file change
  const handleFileChange = (event) => {
    setFileContent({ secrets: {}, integrity: {} }); // Reset the file content
    setIsError(false);
    setMessage("");
    setOpenStatusbar(false);
    setFile(null);
    setIsGenerateFile(false);
    const selectedFile = event.target.files[0];
    if (selectedFile && validateFileTypeAndSize(selectedFile)) {
      // Read the file content to display in the preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const [status, result] = readFileLineByLineSync(e.target.result);
        if (status === "error") {
          setIsError(true);
          setMessage(result);
          setOpenStatusbar(true);
          return;
        }
        setFileContent(result);
        setFile(selectedFile);
        setMessage("File loaded successfully");
        setOpenStatusbar(true);
        console.log("fie contetnt");
        console.log(e); // Set the file content after reading
        console.log(typeof e.target.result); // Set the file content after reading
        console.log(readFileLineByLineSync(e.target.result));
      };
      reader.onerror = () => {
        setIsError(true);
        setMessage("Error reading file.");
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleFileChangeWhenNewFileIsGenerated = (event) => {
    const userConfirmed = window.confirm("Loading a new file will erase all the current data. Do you want to proceed?");
    if (userConfirmed) {
        handleFileChange(event);
    }
  };

  const removeSecret = (key) => () => {
    setFileContent((prevContent) => {
      const newSecrets = { ...prevContent.secrets };
      delete newSecrets[key];
      return { ...prevContent, secrets: newSecrets };
    });
  };

  const isEmptyObj = (obj) => {
    return Object.keys(obj).length === 0;
  };

  return (
    <Container maxWidth fixed sx={{ marginLeft: 10, padding: 2 }}>
      <Box>
        <Stack
          direction={"row"}
          justifyContent="space-between"
          alignItems="center"
          marginTop={1}
          marginBottom={1}
        >
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" startIcon={<Home />} />
            {isGenerateFile && (
              <FileUpload file={file} handleFileChange={handleFileChangeWhenNewFileIsGenerated} buttonVariant={"outlined"}/>
            )}
          </Stack>
          <Button variant="text" color="primary" startIcon={<Help />}>
            How it works?
          </Button>
        </Stack>
      </Box>

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
          {!isGenerateFile && <FileUpload file={file} handleFileChange={handleFileChange} buttonVariant={ file ? "outlined": "contained"} />}
          {file ? (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutline />}
                component="div"
                size="small"
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  marginBottom: 2,
                }}
                onClick={() => setAddNewSecret(true)}
              >
                Add Secret
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutline />}
              component="span"
              size="small"
              onClick={() => {
                setAddNewSecret(true);
                setIsGenerateFile(true);
                // check condition if while adding drst element i cancel and dont' add,
                //  check when loading a file everything is removedfrom UI, a popup should come
              }}
            >
              {isGenerateFile ? "Add Secret": "Generate New File"}
            </Button>
          )}
        </Stack>
        <Typography variant="h4">Password Manager</Typography>
      </Stack>

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
          algorithm="AES_GCM_256"
          masterKey="test123"
          addToSecretsList={addToSecretsList}
          existingSecrets={Object.keys(fileContent.secrets)}
        />
      )}

      {fileContent && !isEmptyObj(fileContent.secrets) && (
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
              {Object.keys(fileContent.secrets).map((key) => (
                <Stack direction="row" spacing={1} key={key} width="100%">
                  <TextField
                    label="Key"
                    variant="outlined"
                    size="small"
                    value={key}
                    contentEditable={false}
                  />
                  <TextField
                    label="Secret"
                    variant="outlined"
                    size="small"
                    value={fileContent.secrets[key]}
                    contentEditable={false}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Remove sx={{ m: 0, p: 0, width: "auto" }} />}
                    onClick={removeSecret(key)}
                  />
                </Stack>
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
                {generateFileContent(fileContent)}
              </Typography>
            </Paper>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default PasswordManager;
