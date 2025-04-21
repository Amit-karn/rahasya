import React from "react";
import { Paper, Typography, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import passwordManagerConfig from "../config/PasswordManagerConfig";

const CredentialLocker = () => {
  // Use the length of the array to choose a valid random item
  const namesArray = passwordManagerConfig.portableEncryptorName;
  const randomIndex = Math.floor(Math.random() * namesArray.length);
  const portableEncryptorName = namesArray[randomIndex];

  return (
    <Paper sx={{ p: 3 }} elevation={10}>
      <Typography variant="h6" gutterBottom>
        ZeroTrust, All Yours
      </Typography>
      <Stack spacing={2} direction="row">
        <Button
          component={Link}
          to="/cred-encrypt"
          variant="contained"
          fullWidth
        >
          {portableEncryptorName && portableEncryptorName[0]
            ? portableEncryptorName[0]
            : namesArray[0] && namesArray[0][0]}
        </Button>
        <Button
          component={Link}
          to="/cred-decrypt"
          variant="contained"
          fullWidth
        >
          {portableEncryptorName && portableEncryptorName[1]
            ? portableEncryptorName[1]
            : namesArray[0] && namesArray[0][1]}
        </Button>
      </Stack>
    </Paper>
  );
};

export default CredentialLocker;
