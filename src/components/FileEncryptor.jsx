import React, { useRef, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const FileEncryptor = () => {
  const [file, setFile] = useState(null);
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileRemove = () => {
    setFile(null);
    setSecret("");
    fileInputRef.current.value = "";
  };

  const handleSecretChange = (event) => {
    setSecret(event.target.value);
  };

  const handleMouseDownShowSecret = () => {
    setShowSecret(true);
  };

  const handleMouseUpHideSecret = () => {
    setShowSecret(false);
  };

  const handleEncrypt = () => {
    // Add encryption logic here
    // After encryption, trigger download
    const encryptedFile = new Blob(["Encrypted content"], {
      type: "application/octet-stream",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(encryptedFile);
    link.download = "encrypted_file.enc";
    link.click();
  };

  const handleDecrypt = () => {
    // Add decryption logic here
    // After decryption, trigger download
    const decryptedFile = new Blob(["Decrypted content"], {
      type: "application/octet-stream",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(decryptedFile);
    link.download = "decrypted_file.txt";
    link.click();
  };

  return (
    <Paper sx={{ p: 3 }} elevation={10}>
      <Typography variant="h6" gutterBottom>
        File Encryptor (AES-GCM-256)
      </Typography>
      <Stack spacing={2} mb={2}>
        <Button variant="contained" component="label" disabled={file}>
          Load File
          <input type="file" hidden onChange={handleFileChange} ref={fileInputRef}/>
        </Button>
        {file && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: "5px", ml: "0rem" }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: "0.7rem",
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file.name}
            </Typography>
            <IconButton
              size="small"
              onClick={handleFileRemove}
              sx={{
                padding: "2px",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <CloseOutlined sx={{ fontSize: "0.875rem" }} />
            </IconButton>
          </Stack>
        )}
        <TextField
          label="Secret"
          type={showSecret ? "text" : "password"}
          value={secret}
          onChange={handleSecretChange}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onMouseDown={handleMouseDownShowSecret}
                    onMouseUp={handleMouseUpHideSecret}
                    onMouseLeave={handleMouseUpHideSecret}
                  >
                    {showSecret ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          fullWidth
        />
      </Stack>
      <Stack spacing={2} direction="row">
        <Button variant="contained" fullWidth onClick={handleEncrypt} disabled={!file || !secret}>
          Encrypt
        </Button>
        <Button variant="contained" fullWidth onClick={handleDecrypt} disabled={!file || !secret}>
          Decrypt
        </Button>
      </Stack>
    </Paper>
  );
};

export default FileEncryptor;
