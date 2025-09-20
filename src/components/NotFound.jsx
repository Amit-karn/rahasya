import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      textAlign="center"
    >
      <Typography variant="h2" color="error" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
  Oops! This page does not exist.
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
  Maybe you took a wrong turn at Cryptonia? <br />
        Or perhaps you were looking for the secret vault of lost passwords? <br />
        Either way, this isn&apos;t the page you&apos;re looking for.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate("/")}>Back to Safety</Button>
    </Box>
  );
};

export default NotFound;
