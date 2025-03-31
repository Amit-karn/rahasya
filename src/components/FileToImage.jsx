import React, { useState, useRef } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Stack, 
  Alert, 
  Box,
  Input,
  Divider
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

const FileImageConverter = () => {
  const [imageFile, setImageFile] = useState(null);
  const [textFile, setTextFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canvasRef = useRef(null);

  const validateImage = (file) => {
    if (!file) return false;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPEG, etc.)');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size should be less than 5MB');
      return false;
    }
    
    return true;
  };

  const validateText = (file) => {
    if (!file) return false;
    
    if (file.type !== 'text/plain') {
      setError('Please select a valid text file (.txt)');
      return false;
    }
    
    if (file.size > 1024 * 1024) {
      setError('Text file size should be less than 1MB');
      return false;
    }
    
    return true;
  };

  const embedTextInImage = async () => {
    if (!imageFile || !textFile) {
      setError('Please select both an image and a text file');
      return;
    }

    try {
      const text = await textFile.text();
      
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      
      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          
          // Add a marker to identify embedded text
          const marker = 'EMBEDDED_TEXT:';
          const markerBinary = marker.split('').map(char => 
            char.charCodeAt(0).toString(2).padStart(8, '0')
          ).join('');
          
          const binaryText = text.split('').map(char => 
            char.charCodeAt(0).toString(2).padStart(8, '0')
          ).join('');
          
          const textLength = binaryText.length.toString(2).padStart(32, '0');
          
          // Embed marker first
          for (let i = 0; i < markerBinary.length; i++) {
            pixels[i * 4] = (pixels[i * 4] & 254) | parseInt(markerBinary[i]);
          }
          
          // Embed text length after marker
          const markerOffset = markerBinary.length;
          for (let i = 0; i < textLength.length; i++) {
            pixels[(i + markerOffset) * 4] = (pixels[(i + markerOffset) * 4] & 254) | parseInt(textLength[i]);
          }
          
          // Embed actual text
          const lengthOffset = markerOffset + textLength.length;
          for (let i = 0; i < binaryText.length; i++) {
            pixels[(i + lengthOffset) * 4] = (pixels[(i + lengthOffset) * 4] & 254) | parseInt(binaryText[i]);
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          const link = document.createElement('a');
          link.download = 'embedded_image.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
          
          setSuccess('Image with embedded text has been downloaded!');
          resolve();
        };
      });
      
      setError('');
    } catch (err) {
      setError('Error processing files: ' + err.message);
    }
  };

  const extractTextFromImage = async (file) => {
    if (!validateImage(file)) return;

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          
          // Extract and verify marker
          const marker = 'EMBEDDED_TEXT:';
          const markerLength = marker.length * 8;
          let extractedMarker = '';
          
          for (let i = 0; i < markerLength; i += 8) {
            let byte = '';
            for (let j = 0; j < 8; j++) {
              byte += pixels[(i + j) * 4] & 1;
            }
            extractedMarker += String.fromCharCode(parseInt(byte, 2));
          }
          
          if (extractedMarker !== marker) {
            throw new Error('No embedded text found in this image');
          }
          
          // Extract text length
          let lengthBinary = '';
          for (let i = 0; i < 32; i++) {
            lengthBinary += pixels[(i + markerLength) * 4] & 1;
          }
          const textLength = parseInt(lengthBinary, 2);
          
          // Extract text data
          let binaryText = '';
          const startOffset = markerLength + 32;
          for (let i = 0; i < textLength; i++) {
            binaryText += pixels[(i + startOffset) * 4] & 1;
          }
          
          // Convert binary to text
          let text = '';
          for (let i = 0; i < binaryText.length; i += 8) {
            text += String.fromCharCode(parseInt(binaryText.substr(i, 8), 2));
          }
          
          // Download text file
          const blob = new Blob([text], { type: 'text/plain' });
          const link = document.createElement('a');
          link.download = 'extracted_text.txt';
          link.href = URL.createObjectURL(blob);
          link.click();
          
          setSuccess('Text has been successfully extracted and downloaded!');
          resolve();
        };
      });
      
      setError('');
    } catch (err) {
      setError('Error extracting text: ' + err.message);
    }
  };

  const handleEmbedImageChange = (e) => {
    const file = e.target.files[0];
    if (validateImage(file)) {
      setImageFile(file);
      setError('');
      setSuccess('');
    }
  };

  const handleTextChange = (e) => {
    const file = e.target.files[0];
    if (validateText(file)) {
      setTextFile(file);
      setError('');
      setSuccess('');
    }
  };

  const handleExtractImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      extractTextFromImage(file);
    }
  };

  return (
    <Paper sx={{ p: 3 }} elevation={3}>
      <Typography variant="h5" gutterBottom>
        File and Image Converter
      </Typography>
      
      {/* Embed Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Embed Text in Image
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select Text File (.txt)
            </Typography>
            <Input
              type="file"
              inputProps={{ accept: '.txt' }}
              onChange={handleTextChange}
              fullWidth
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select Image
            </Typography>
            <Input
              type="file"
              inputProps={{ accept: 'image/*' }}
              onChange={handleEmbedImageChange}
              fullWidth
            />
          </Box>

          <Button
            variant="contained"
            onClick={embedTextInImage}
            disabled={!imageFile || !textFile}
            fullWidth
          >
            Embed and Download
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Extract Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Extract Text from Image
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select Embedded Image
            </Typography>
            <Input
              type="file"
              inputProps={{ accept: 'image/*' }}
              onChange={handleExtractImageChange}
              fullWidth
            />
          </Box>
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

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Paper>
  );
};

export default FileImageConverter;