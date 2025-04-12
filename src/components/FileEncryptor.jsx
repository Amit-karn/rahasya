import React, { useRef, useState } from "react";
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

  // Read file data as ArrayBuffer and convert to Uint8Array
  const readFileAsUint8Array = async (file) => {
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
  };

  const encryptFile = async () => {
    if (!file || !secret) {
      setError("Please select a file and enter a secret key");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Read file data as Uint8Array
      const fileData = await readFileAsUint8Array(file);
      // Generate an encoded encryption key from the secret.
      // You can adjust the iteration count as needed.
      const encodedKey = await generateEncryptionKeyFromMasterKey(
        secret,
        passwordManagerConfig.fileEncryptionIterations,
        passwordManagerConfig.fileEncryptionIterations
      );
      // Use the encrypt function from CredLockerUtils.
      const encryptedBase64 = await encrypt(encodedKey, fileData, "");

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

    try {
      setLoading(true);
      setError("");

      // Read encrypted file metadata
      const text = await file.text();
      const fileMetadata = JSON.parse(text);
      console.log(fileMetadata);

      // Generate an encoded key for decryption
      const encodedKey = await generateEncryptionKeyFromMasterKey(
        secret,
        passwordManagerConfig.fileEncryptionIterations,
        passwordManagerConfig.fileEncryptionIterations
      );
      // Use the decrypt function from CredLockerUtils.
      const decryptedStr = await decrypt(encodedKey, fileMetadata.data, "");

      // Create a blob from the decrypted string
      const blob = new Blob([decryptedStr], { type: fileMetadata.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileMetadata.filename;
      a.click();
      URL.revokeObjectURL(url);

      setSuccess("File decrypted and downloaded successfully!");
    } catch {
      setError("Decryption failed. Make sure you have the correct secret key.");
    } finally {
      setLoading(false);
      setFile(null);
      setSecret("");
      fileInputRef.current.value = ""; // Reset the file input
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setSuccess("");
    }
  };

  const removeFile = () => {
    setFile(null);
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
          onChange={(e) => setSecret(e.target.value)}
          fullWidth
          disabled={loading || !file}
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

      {error && (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }} >
          {success}
        </Alert>
      )}
    </Paper>
  );
};

export default FileEncryptor;
