import React from 'react';
import { Paper, Typography, Button, Stack } from '@mui/material';

const FileToImage = () => {
  return (
    <Paper sx={{ p: 3 }} elevation={10}>
      <Typography variant="h6" gutterBottom>
        File to Image
      </Typography>
      <Stack spacing={2}>
        <Button variant="contained" component="label">
          Load File
          <input type="file" hidden />
        </Button>
      </Stack>
    </Paper>
  );
};

export default FileToImage;