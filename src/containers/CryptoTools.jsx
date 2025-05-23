import { Container, Typography, Box, Grid2 as Grid } from "@mui/material";
import PasswordGenerator from "../components/PasswordGenerator";
import CredentialLocker from "../components/CredentialLocker";
import FileEncryptor from "../components/FileEncryptor";
import ShaHash from "../components/ShaHash";
import Base64Tool from "../components/Base64Tool";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import { useEffect } from "react";
import { validateSecurityRequirements } from "../utils/SecurityUtils";

const CryptoTools = () => {
  useEffect(() => {
    const { isValid, errorOutput } = validateSecurityRequirements();

    if (!isValid) {
      alert(errorOutput);
    }
  }, []);

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "100vh",
        py: 4,
        px: 4,
        background: `
          linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.90)),
          url(/binary.avif)
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        mb={6}
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          textAlign: { xs: "center", sm: "left" },
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "white"
        }}
      >
        <Typography
          variant="h3"
          component="div"
          sx={{
            fontFamily: "Noto Sans Devanagari, sans-serif",
            fontSize: { xs: "2.5rem", sm: "3.5rem" },
            fontWeight: "cursive",
            background: "linear-gradient(45deg, #000000 30%, #444444 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.05em"
          }}
        >
          {passwordManagerConfig.rahaysa}
        </Typography>
      </Box>

      <Grid
        container
        spacing={2}
        width="100%"
        sx={{
          "& .MuiPaper-root": {
            background: "white",
            border: "1.5px solid rgba(0, 0, 0, 0.1)",
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 48px rgba(0, 0, 0, 0.12)"
            }
          },
          "& .MuiButton-root": {
            background: "#000",
            color: "white",
            borderRadius: "8px",
            textTransform: "none",
            py: 1.5,
            "&:hover": {
              background: "#222"
            }
          },
          "& .MuiTextField-root": {
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              "& fieldset": {
                borderColor: "rgba(0, 0, 0, 0.1)"
              },
              "&:hover fieldset": {
                borderColor: "rgba(0, 0, 0, 0.2)"
              }
            }
          },
          "& .MuiTypography-h6": {
            fontWeight: 600,
            mb: 3
          }
        }}
        direction={{ sm: "column", md: "row" }}
      >
        <Grid
          container
          spacing={2}
          direction="column"
          width={{ sm: "95%", md: "45%" }}
        >
          <CredentialLocker />
          <Base64Tool />
          <FileEncryptor />
        </Grid>
        <Grid
          container
          spacing={2}
          direction="column"
          width={{ sm: "95%", md: "50%" }}
        >
          <PasswordGenerator />
          <ShaHash />
        </Grid>
      </Grid>
    </Container>
  );
};

export default CryptoTools;
