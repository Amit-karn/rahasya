import React, { useState } from 'react';
import { Paper, Typography, Stack, Slider, Checkbox, FormControlLabel, Button, Grid, IconButton } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(false);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [includeDevanagari, setIncludeDevanagari] = useState(false);
  const [password, setPassword] = useState('');

  const generatePassword = () => {
    const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    const devanagariChars = 'अआइईउऊऋऌऍऎएऐऑऒओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह';

    let charSet = '';
    if (includeUppercase) charSet += upperCaseChars;
    if (includeLowercase) charSet += lowerCaseChars;
    if (includeNumbers) charSet += numberChars;
    if (includeSymbols) charSet += symbolChars;
    if (includeDevanagari) charSet += devanagariChars;

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charSet.length);
      generatedPassword += charSet[randomIndex];
    }

    setPassword(generatedPassword);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
  };

  return (
    <Paper sx={{ p: 3 }} elevation={10}>
      <Typography variant="h6" gutterBottom>
        Random Password Generator
      </Typography>
      <Stack spacing={2}>
        <Typography>Password Length: {length}</Typography>
        <Slider
          value={length}
          onChange={(_, value) => setLength(value)}
          min={8}
          max={32}
          marks
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Checkbox checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)} />}
              label="Include Uppercase Letters"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Checkbox checked={includeLowercase} onChange={(e) => setIncludeLowercase(e.target.checked)} />}
              label="Include Lowercase Letters"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Checkbox checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} />}
              label="Include Numbers"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Checkbox checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} />}
              label="Include Symbols"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={<Checkbox checked={includeDevanagari} onChange={(e) => setIncludeDevanagari(e.target.checked)} />}
              label="Include Devanagari Characters"
            />
          </Grid>
        </Grid>
        <Button variant="contained" onClick={generatePassword}>
          Generate Password
        </Button>
        {password && (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              Generated Password: {password}
            </Typography>
            <IconButton onClick={copyToClipboard} color="primary">
              <ContentCopy />
            </IconButton>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default PasswordGenerator;