import React from "react";
import { Container, Paper, Typography, Button, Stack, Box } from "@mui/material";
import { Lock, LockOpen } from "@mui/icons-material";
import { Link } from "react-router-dom";
import CommonHeader from "./CommonHeader";

const LandingPage = () => {
  return (
    <>
      <CommonHeader />
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            mt: 2,
            mb: 2,
            textAlign: "center",
            backgroundColor: "primary.main",
            color: "white",
            py: 4,
            px: 3,
            borderRadius: 2
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              mb: 3
            }}
          >
            Rahasya
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 3, fontWeight: "light" }}
          >
            A zero-trust, offline file-based password manager
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 800, mx: "auto", mb: 2 }}>
            No cloud storage—your encrypted vault is yours to store wherever you want.
          </Typography>
        </Box>

        {/* Main Actions */}
        <Box
          sx={{
            position: "relative",
            width: "100vw",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
            minHeight: 350,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: "url('/binary.avif')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain"
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
            sx={{ width: "100%", zIndex: 2 }}
          >
            {/* Encrypt Box */}
            <Paper
              elevation={4}
              sx={{
                p: 4,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: 400,
                borderRadius: 2,
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)"
                }
              }}
            >
              <Lock sx={{ fontSize: 48, mb: 2, color: "primary.main" }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                Encrypt Secrets to File
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
                sx={{ mb: 4 }}
              >
                Encrypt your passwords and sensitive information into a file. You decide where to store it—cloud, USB, or local disk. The app never stores your data.
              </Typography>
              <Button
                component={Link}
                to="/encrypt"
                variant="contained"
                size="large"
                startIcon={<Lock />}
                sx={{
                  mt: "auto",
                  py: 1.5,
                  px: 4
                }}
              >
                Encrypt Secrets
              </Button>
            </Paper>

            {/* Decrypt Box */}
            <Paper
              elevation={4}
              sx={{
                p: 4,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: 400,
                borderRadius: 2,
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)"
                }
              }}
            >
              <LockOpen sx={{ fontSize: 48, mb: 2, color: "primary.main" }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                Decrypt Secrets from File
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
                sx={{ mb: 4 }}
              >
                Open your encrypted file and decrypt secrets locally in your browser. Nothing ever leaves your device.
              </Typography>
              <Button
                component={Link}
                to="/decrypt"
                variant="contained"
                size="large"
                startIcon={<LockOpen />}
                sx={{
                  mt: "auto",
                  py: 1.5,
                  px: 4
                }}
              >
                Decrypt Secrets
              </Button>
            </Paper>
          </Stack>
        </Box>

        {/* Security Features */}
        <Paper
          sx={{
            p: 4,
            mb: 6,
            backgroundColor: "grey.50",
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Zero-Trust Security Features
          </Typography>
          <Stack spacing={2}>
            <Typography variant="body1">
              • <strong>100% Offline:</strong> All encryption happens in your browser
            </Typography>
            <Typography variant="body1">
              • <strong>No cloud storage:</strong> You control where your encrypted file is stored
            </Typography>
            <Typography variant="body1">
              • <strong>Zero Data Transfer:</strong> Your information never leaves your device
            </Typography>
            <Typography variant="body1">
              • <strong>Military-Grade Encryption:</strong> AES-GCM encryption with PBKDF2 key derivation {" "}
              <Link to="/aes-gcm" style={{ fontSize: 14 }}>
                (Read more)
              </Link>
            </Typography>
            <Typography variant="body1">
              • <strong>AAD Support:</strong> Supports Additional Authenticated Data (AAD) for extra security {" "}
              <Link to="/aes-gcm" style={{ fontSize: 14 }}>
                (Read more)
              </Link>
            </Typography>
            <Typography variant="body1">
              • <strong>Complete Control:</strong> You are the only one with access to your keys
            </Typography>
            <Typography variant="body1" color="error">
              ⚠️ Important: Keep your master key safe! There are no recovery options.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default LandingPage;