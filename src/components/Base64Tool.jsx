import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Stack, Grid2 as Grid } from '@mui/material';

const Base64Tool = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

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
          onChange={(e) => setInput(e.target.value)}
          multiline
          rows={2}
        />
        <TextField
          fullWidth
          label="Output"
          value={output}
          InputProps={{ readOnly: true }}
          multiline
          rows={2}
        />
        <Grid container spacing={2}>
          <Grid size={6}>
            <Button variant="contained" fullWidth>
              Encode
            </Button>
          </Grid>
          <Grid size={6}>
            <Button variant="contained" fullWidth>
              Decode
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default Base64Tool;