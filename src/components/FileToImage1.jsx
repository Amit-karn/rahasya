import React from "react";
import { Paper, Typography, Button, Stack } from "@mui/material";

const FileImageConverter = () => {
  return (
    <Paper sx={{ p: 3 }} elevation={10}>
        <Typography variant="h6" gutterBottom>
          File and Image Converter
        </Typography>
        <Stack spacing={2} direction={{ xs: "column", lg: "row" }}>
          <Button variant="contained" component="label" fullWidth>
            Load File
            <input type="file" hidden />
          </Button>
          <Button variant="contained" component="label" fullWidth>
            Load Image
            <input type="file" hidden />
          </Button>
        </Stack>
    </Paper>
  );
};

export default FileImageConverter;