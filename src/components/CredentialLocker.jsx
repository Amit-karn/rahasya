import React from 'react';
import { Paper, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

const CredentialLocker = () => {
  return (
    <Paper sx={{ p: 3 }} elevation={10}>
      <Typography variant="h6" gutterBottom>
        Portable Encrypted Credential Locker
      </Typography>
      <Stack spacing={2} direction={{ xs: "column", lg: "row" }}>
        <Button
          component={Link}
          to="/cred-encrypt"
          variant="contained"
          fullWidth
        >
          Credential Encrypt
        </Button>
        <Button
          component={Link}
          to="/cred-decrypt"
          variant="contained"
          fullWidth
        >
          Credential Decrypt
        </Button>
      </Stack>
    </Paper>
  );
};

export default CredentialLocker;