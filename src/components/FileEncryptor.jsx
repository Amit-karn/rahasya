import React from "react";
import { Paper, Typography, Button, Stack, IconButton } from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";

const FileEncryptor = () => {
  return (
    <Paper sx={{ p: 3 }} elevation={10}>
      <Typography variant="h6" gutterBottom>
        File Encryptor (AES-GCM-256)
      </Typography>
      <Stack spacing={2} mb={2}>
        <Button variant="contained" component="label">
          Load File
          <input type="file" hidden />
        </Button>
        {/* <Stack
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
            dfvdsfvsdfv
          </Typography>
          <IconButton
            size="small"
            // onClick={reset}
            sx={{
              padding: "2px",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <CloseOutlined sx={{ fontSize: "0.875rem" }} />
          </IconButton>
        </Stack> */}
      </Stack>
      <Stack spacing={2} direction="row">
        <Button variant="contained" fullWidth>
          Encrypt
        </Button>
        <Button variant="contained" fullWidth>
          Decrypt
        </Button>
      </Stack>
    </Paper>
  );
};

export default FileEncryptor;
