import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Stack, 
  Alert, 
  Box, 
  Input,
  TextField,
  Divider,
  CircularProgress
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

const FileCrypto = () => {
  const [file, setFile] = useState(null);
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Convert string to ArrayBuffer
  const str2ab = (str) => {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  };

  // Convert ArrayBuffer to Base64
  const ab2base64 = (ab) => {
    return btoa(String.fromCharCode(...new Uint8Array(ab)));
  };

  // Convert Base64 to ArrayBuffer
  const base642ab = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Derive key from password
  const deriveKey = async (password) => {
    const passwordBuffer = str2ab(password);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return { key, salt };
  };

  const encryptFile = async (e) => {
    e.preventDefault();
    
    if (!file || !secret) {
      setError('Please select a file and enter a secret key');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Read file
      const fileData = await file.arrayBuffer();
      
      // Generate key and IV
      const { key, salt } = await deriveKey(secret);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        fileData
      );
      
      // Prepare final file
      const fileMetadata = {
        filename: file.name,
        type: file.type,
        iv: ab2base64(iv),
        salt: ab2base64(salt),
        data: ab2base64(encryptedData)
      };
      
      // Create and download encrypted file
      const blob = new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}.encrypted`;
      a.click();
      URL.revokeObjectURL(url);
      
      setSuccess('File encrypted and downloaded successfully!');
      setFile(null);
      setSecret('');
      
    } catch (err) {
      setError('Encryption failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const decryptFile = async (e) => {
    e.preventDefault();
    
    if (!file || !secret) {
      setError('Please select an encrypted file and enter the secret key');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Read encrypted file
      const text = await file.text();
      const fileMetadata = JSON.parse(text);
      
      // Derive key using provided salt
      const { key } = await deriveKey(secret);
      
      // Decrypt
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: base642ab(fileMetadata.iv)
        },
        key,
        base642ab(fileMetadata.data)
      );
      
      // Download decrypted file
      const blob = new Blob([decryptedData], { type: fileMetadata.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileMetadata.filename;
      a.click();
      URL.revokeObjectURL(url);
      
      setSuccess('File decrypted and downloaded successfully!');
      setFile(null);
      setSecret('');
      
    } catch (err) {
      setError('Decryption failed. Make sure you have the correct secret key.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  return (
    <Paper sx={{ p: 3 }} elevation={3}>
      <Typography variant="h5" gutterBottom>
        File Encryption/Decryption
      </Typography>
      
      {/* Encrypt Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Encrypt File
        </Typography>
        <Stack spacing={2} component="form" onSubmit={encryptFile}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select File to Encrypt
            </Typography>
            <Input
              type="file"
              onChange={handleFileChange}
              fullWidth
            />
          </Box>

          <TextField
            label="Secret Key"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!file || !secret || loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Encrypt and Download'}
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Decrypt Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Decrypt File
        </Typography>
        <Stack spacing={2} component="form" onSubmit={decryptFile}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select Encrypted File
            </Typography>
            <Input
              type="file"
              onChange={handleFileChange}
              fullWidth
            />
          </Box>

          <TextField
            label="Secret Key"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={!file || !secret || loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Decrypt and Download'}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Paper>
  );
};

export default FileCrypto;