import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Grid2 as Grid,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

const Base64Tool = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    setOutput(btoa(input));
  };

  const handleDecode = () => {
    try {
      setOutput(atob(input));
    } catch {
      setOutput("Invalid Base64 string");
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 200);
    });
  };

  return (
    <Paper sx={{ p: 3 }} elevation={10}>
      <Typography variant="h6" gutterBottom>
        Base64
      </Typography>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Enter something"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOutput("");
            setCopied(false);
          }}
          multiline
          rows={4}
        />
        <Typography variant="subtitle2">Output</Typography>
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
            {output}
          </Typography>
          <IconButton onClick={handleCopyToClipboard}>
            {copied ? <CheckIcon /> : <ContentCopyIcon />}
          </IconButton>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleEncode}
              disabled={!input}
            >
              Encode
            </Button>
          </Grid>
          <Grid size={6}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleDecode}
              disabled={!input}
            >
              Decode
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default Base64Tool;
