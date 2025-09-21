import React, { useEffect } from "react";
import { Container, Typography, Paper, Box, Link, Stack } from "@mui/material";
import { useLocation } from "react-router-dom";

const AesGcmInfo = () => {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;

    if (hash) {
      window.scrollTo({ top: 0, behavior: "auto" });

      const timeout = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.classList.add("highlight");
          setTimeout(() => el.classList.remove("highlight"), 4000);
        }
      }, 100); // delay after scrolling to top

      return () => clearTimeout(timeout);
    }
  }, [location.hash]);

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 2 }}>
      <Paper sx={{ p: 4, mb: 4 }} elevation={3}>
        <Typography variant="h4" fontWeight="bold">
          What is AES-GCM?
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }} id="aes-gcm-heading">
          <strong>AES-GCM</strong> (Advanced Encryption Standard -
          Galois/Counter Mode) is a modern, secure way to encrypt data. It is
          widely used for protecting sensitive information in browsers, apps,
          and cloud services. AES-GCM is fast, secure, and provides both
          confidentiality (hiding your data) and integrity (detecting
          tampering).
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>How it works (in simple terms):</strong> Your data is
          scrambled using a secret key, a random number (IV), and (optionally)
          some extra info (AAD). When you decrypt, you must provide the same
          key, IV, and AAD. If anything is wrong, decryption fails—so you know
          if your data was changed or the wrong info was used.
        </Typography>
      </Paper>
      <Paper sx={{ p: 4, mb: 4 }} elevation={2}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Key Parameters in AES-GCM
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Key
            </Typography>
            <Typography variant="body2">
              The secret password or passphrase used to encrypt and decrypt your
              data. Only you should know this!
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              IV (Initialization Vector)
            </Typography>
            <Typography variant="body2">
              A random number that makes every encryption unique, even if you
              encrypt the same data twice. It does not need to be secret, but it
              must be different for every file.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" id="aad-tag">
              AAD (Additional Authenticated Data)
            </Typography>
            <Typography variant="body2">
              Extra information you can add to your encryption. It acts like a
              second password. If you use AAD, you must provide it during both
              encryption and decryption. If you forget it, you cannot decrypt
              your file.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Tag (Authentication Tag)
            </Typography>
            <Typography variant="body2">
              A short code added to your encrypted file. It lets you (and your
              app) check that nothing was changed or tampered with. If the tag
              doesn’t match, decryption fails.
            </Typography>
          </Box>
        </Stack>
      </Paper>
      <Paper sx={{ p: 4, mb: 4 }} elevation={1}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Want to Learn More?
        </Typography>
        <ul>
          <li>
            <Link
              href="https://www.youtube.com/watch?v=-fpVv_T4xwA"
              target="_blank"
              rel="noopener"
            >
              YouTube: AES-GCM Explained (by Dr Mike Pound)
            </Link>
          </li>
          <li>
            <Link
              href="https://eureka.patsnap.com/article/how-aes-gcm-combines-encryption-and-authentication"
              target="_blank"
              rel="noopener"
            >
              Blog: AES-GCM Combines Encryption and Authentication (PatSnap
              Eureka)
            </Link>
          </li>
          <li>
            <Link
              href="https://andrea.corbellini.name/2023/03/09/authenticated-encryption/#authenticated-encryption-with-associated-data-aead"
              target="_blank"
              rel="noopener"
            >
              Blog: Authenticated Encryption with Associated Data (AEAD) (Andrea
              Corbellini)
            </Link>
          </li>
        </ul>
      </Paper>
    </Container>
  );
};

export default AesGcmInfo;
