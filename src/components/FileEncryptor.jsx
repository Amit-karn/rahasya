import { useRef, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  Box,
  Input,
  TextField,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { Delete, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  generateEncryptionKeyFromMasterKey,
  encrypt,
  decrypt,
} from "../utils/CredLockerUtils";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import PasswordFeedback from "./PasswordFeedback";

const FileEncryptor = () => {
  const [file, setFile] = useState(null);
  const [secret, setSecret] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [operation, setOperation] = useState("encrypt"); // "encrypt" or "decrypt"
  const fileInputRef = useRef(null);

  // Toggle show/hide password
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const convertStringToArrayBuffer = (str) => {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  };

  const validateSecret = (value) => {
    if (
      value.length < passwordManagerConfig.masterKeyMinLength ||
      value.length > passwordManagerConfig.masterKeyMaxLength
    ) {
      setError(
        `Secret key length must be between ${passwordManagerConfig.masterKeyMinLength} and ${passwordManagerConfig.masterKeyMaxLength} characters.`
      );
      return false;
    }
    setError("");
    return true;
  };

  const handleSecretChange = (e) => {
    const value = e.target.value;
    setSecret(value);

    if (value) {
      validateSecret(value);
    }
  };

  const encryptFile = async () => {
    if (!file || !secret) {
      setError("Please select a file and enter a secret key");
      return;
    }

    if (!validateSecret(secret)) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Read file data as Uint8Array
      const fileData = await file.text();
      // Generate an encoded encryption key from the secret.
      // You can adjust the iteration count as needed.
      let encodedKey = await generateEncryptionKeyFromMasterKey(
        secret,
        passwordManagerConfig.fileEncryptionIterations,
        passwordManagerConfig.fileEncryptionIterations
      );
      // Use the encrypt function from CredLockerUtils.
      const encryptedBase64 = await encrypt(encodedKey, fileData, "");
      encodedKey = null; // Clear the key from memory

      // Prepare file metadata
      const fileMetadata = {
        filename: file.name,
        type: file.type,
        data: encryptedBase64,
      };

      // Create and download encrypted file
      const blob = new Blob([JSON.stringify(fileMetadata)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name}.encrypted`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccess("File encrypted and downloaded successfully!");
    } catch (err) {
      setError("Encryption failed: " + err.message);
    } finally {
      setLoading(false);
      setFile(null);
      setSecret("");
      fileInputRef.current.value = ""; // Reset the file input
    }
  };

  const decryptFile = async (e) => {
    e.preventDefault();

    if (!file || !secret) {
      setError("Please select an encrypted file and enter the secret key");
      return;
    }

    if (!validateSecret(secret)) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Read encrypted file metadata
      const text = await file.text();
      const fileMetadata = JSON.parse(text);

      // Generate an encoded key for decryption
      let encodedKey = await generateEncryptionKeyFromMasterKey(
        secret,
        passwordManagerConfig.fileEncryptionIterations,
        passwordManagerConfig.fileEncryptionIterations
      );
      // Use the decrypt function from CredLockerUtils.
      const decryptedStr = await decrypt(encodedKey, fileMetadata.data, "");
      encodedKey = null; // Clear the key from memory
      
      // Create a blob from the decrypted string
      const blob = new Blob([convertStringToArrayBuffer(decryptedStr)], {
        type: fileMetadata.type,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileMetadata.filename;
      a.click();
      URL.revokeObjectURL(url);

      setSuccess("File decrypted and downloaded successfully!");
    } catch (err) {
      setError("Decryption failed. " + err.message);
    } finally {
      setLoading(false);
      setFile(null);
      setSecret("");
      fileInputRef.current.value = ""; // Reset the file input
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setSuccess("");
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    setSecret("");
    setSuccess("");
    fileInputRef.current.value = "";
  };

  const handleOperationChange = (_, newOp) => {
    if (newOp) {
      setOperation(newOp);
      setError("");
      setSuccess("");
      setFile(null);
      setSecret("");
      fileInputRef.current.value = "";
    }
  };

  return (
    <Paper sx={{ p: 3 }} elevation={3}>
      <Typography variant="h5" gutterBottom>
        File Encryption/Decryption
      </Typography>

      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          color="warning"
          value={operation}
          exclusive
          onChange={handleOperationChange}
          aria-label="Operation"
        >
          <ToggleButton value="encrypt">Encrypt</ToggleButton>
          <ToggleButton value="decrypt">Decrypt</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Select File
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Input
              type="file"
              onChange={handleFileChange}
              disabled={loading}
              inputRef={fileInputRef}
            />
            {file && (
              <IconButton size="small" onClick={removeFile} disabled={loading}>
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Box>

        <TextField
          label={file ? "Enter Secret Key" : "Please select a file first"}
          type={showPassword ? "text" : "password"}
          value={secret}
          onChange={handleSecretChange}
          fullWidth
          disabled={loading || !file}
          error={!!error && error.includes("length")}
          helperText={error && error.includes("length") ? error : ""}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowPassword} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {secret && operation !== "decrypt" && 
          secret.length >= passwordManagerConfig.masterKeyMinLength &&
          secret.length <= passwordManagerConfig.masterKeyMaxLength && (
            <PasswordFeedback
              password={secret}
            />
          )}

        {operation === "decrypt" ? (
          <Button
            variant="contained"
            onClick={decryptFile}
            disabled={!file || !secret || loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Decrypt and Download"}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={encryptFile}
            disabled={!file || !secret || loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Encrypt and Download"}
          </Button>
        )}
      </Stack>

      {error && !error.includes("length") && (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Paper>
  );
};

export default FileEncryptor;
