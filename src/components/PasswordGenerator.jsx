import React, { useState } from 'react';
import { Paper, Typography, Stack, Slider, Checkbox, FormControlLabel, Button, Grid2 as Grid, IconButton } from '@mui/material';
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
    const upperCaseChars = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const lowerCaseChars = 'abcdefghjkmnpqrstuvwxyz';
    const numberChars = '23456789';
    const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    const devanagariChars = 'अआइईउऊऋऌऍऎएऐऑऒओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह';

    let charSet = '';
    if (includeUppercase) charSet += upperCaseChars;
    if (includeLowercase) charSet += lowerCaseChars;
    if (includeNumbers) charSet += numberChars;
    if (includeSymbols) charSet += symbolChars;
    if (includeDevanagari) charSet += devanagariChars;

    const avoidSequential = (str) => {
      for (let i = 0; i < str.length - 2; i++) {
        if (
          str.charCodeAt(i) + 1 === str.charCodeAt(i + 1) &&
          str.charCodeAt(i + 1) + 1 === str.charCodeAt(i + 2)
        ) {
          return true;
        }
      }
      return false;
    };

    let generatedPassword = '';
    let usedChars = new Set();

    while (generatedPassword.length < length) {
      const randomIndex = Math.floor(Math.random() * charSet.length);
      const char = charSet[randomIndex];

      if (
        !usedChars.has(char) &&
        !avoidSequential(generatedPassword + char) &&
        (generatedPassword.length > 0 || !numberChars.includes(char) && !symbolChars.includes(char))
      ) {
        generatedPassword += char;
        usedChars.add(char);
      }
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
          <Grid size={{xs: 12, sm: 6}}>
            <FormControlLabel
              control={<Checkbox checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)} />}
              label="Include Uppercase Letters"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6}}>
            <FormControlLabel
              control={<Checkbox checked={includeLowercase} onChange={(e) => setIncludeLowercase(e.target.checked)} />}
              label="Include Lowercase Letters"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6}}>
            <FormControlLabel
              control={<Checkbox checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} />}
              label="Include Numbers"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6}}>
            <FormControlLabel
              control={<Checkbox checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} />}
              label="Include Symbols"
            />
          </Grid>
          <Grid size={{xs: 12, sm: 6}}>
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