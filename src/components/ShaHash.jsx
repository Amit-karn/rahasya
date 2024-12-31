import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import {
  sha256HashWithIterations,
  uint8ArrayToBase64,
} from "../utils/CryptoUtils";

const ShaHash = () => {
  const [input, setInput] = useState("");
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState(false);

  const handleHash = async () => {
    const hashedValue = await sha256HashWithIterations(input, 1);
    setHash(uint8ArrayToBase64(hashedValue.hash));
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 200);
    });
  };

  return (
    <Paper sx={{ p: 3 }} elevation={10}>
      <Typography variant="h6" gutterBottom>
        SHA256
      </Typography>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Enter something"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setHash("");
          }}
          multiline
          rows={4}
        />
        <Typography variant="subtitle2">Output as Base64</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="body1"
            sx={{
              wordBreak: "break-all",
              flexGrow: 1,
              border: "1px solid rgba(0, 0, 0, 0.23)",
              borderRadius: "4px",
              padding: "10px",
            }}
          >
            {hash}
          </Typography>
          <IconButton onClick={handleCopyToClipboard}>
          {copied ? <CheckIcon /> : <ContentCopyIcon />}
          </IconButton>
        </Stack>
        <Button
          variant="contained"
          fullWidth
          onClick={handleHash}
          disabled={!input}
        >
          SHA256
        </Button>
      </Stack>
    </Paper>
  );
};

export default ShaHash;
