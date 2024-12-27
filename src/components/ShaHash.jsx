import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Stack } from '@mui/material';

const ShaHash = () => {
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');

  return (
    <Paper sx={{ p: 3 }} elevation={10}>
      <Typography variant="h6" gutterBottom>
        SHA 256
      </Typography>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Enter something"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          multiline
          rows={2}
        />
        <TextField
          fullWidth
          label="Output Hash"
          value={hash}
          InputProps={{ readOnly: true }}
          multiline
          rows={2}
        />
        <Button variant="contained" fullWidth>
          SHA256
        </Button>
      </Stack>
    </Paper>
  );
};

export default ShaHash;