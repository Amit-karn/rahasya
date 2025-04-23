import React, { useState } from "react";
import {
  Paper,
  Typography,
  Stack,
  Slider,
  Checkbox,
  FormControlLabel,
  Button,
  Grid2 as Grid,
  IconButton
} from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import PasswordFeedback from "./PasswordFeedback";

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [includeDevanagari, setIncludeDevanagari] = useState(false);
  const [password, setPassword] = useState("");

  const getRandomInt = (max) => {
    const mask = Math.pow(2, Math.ceil(Math.log2(max))) - 1;
    let result;
    do {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      result = array[0] & mask;
    } while (result >= max);
    return result;
  };

  const generatePassword = () => {
    const upperCaseChars = "ABCDEFGHJKMNPQRSTUVWXYZ";
    const lowerCaseChars = "abcdefghjkmnpqrstuvwxyz";
    const numberChars = "23456789";
    const symbolChars = "!@#$%^&*()_+[]{}|;:,.<>?";
    const devanagariChars = "अआइईउऊऋऌऍऎएऐऑऒओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह";

    let charSet = "";
    let mandatoryChars = "";

    if (includeUppercase) {
      charSet += upperCaseChars;
      mandatoryChars += upperCaseChars[getRandomInt(upperCaseChars.length)];
    }
    if (includeLowercase) {
      charSet += lowerCaseChars;
      mandatoryChars += lowerCaseChars[getRandomInt(lowerCaseChars.length)];
    }
    if (includeNumbers) {
      charSet += numberChars;
      mandatoryChars += numberChars[getRandomInt(numberChars.length)];
    }
    if (includeSymbols) {
      charSet += symbolChars;
      mandatoryChars += symbolChars[getRandomInt(symbolChars.length)];
    }
    if (includeDevanagari) {
      charSet += devanagariChars;
      mandatoryChars += devanagariChars[getRandomInt(devanagariChars.length)];
    }

    let generatedPassword = mandatoryChars;
    while (generatedPassword.length < length) {
      const randomIndex = getRandomInt(charSet.length);
      generatedPassword += charSet[randomIndex];
    }

    // Shuffle the generated password to avoid predictable patterns
    generatedPassword = generatedPassword
      .split("")
      .sort(() => getRandomInt(2) - 1)
      .join("");
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                />
              }
              label="Include Uppercase Letters"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                />
              }
              label="Include Lowercase Letters"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                />
              }
              label="Include Numbers"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                />
              }
              label="Include Symbols"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeDevanagari}
                  onChange={(e) => setIncludeDevanagari(e.target.checked)}
                />
              }
              label="Include Devanagari Characters"
            />
          </Grid>
        </Grid>
        <Button variant="contained" onClick={generatePassword}>
          Generate Password
        </Button>
        {password && (
          <>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                Generated Password: {password}
              </Typography>
              <IconButton onClick={copyToClipboard} color="primary">
                <ContentCopy />
              </IconButton>
            </Stack>
            <PasswordFeedback password={password} />
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default PasswordGenerator;
