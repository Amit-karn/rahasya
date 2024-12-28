import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Slider, 
  TextField, 
  Checkbox,
  FormControlLabel,
  Button,
  Stack 
} from '@mui/material';

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [includeSpecial, setIncludeSpecial] = useState(false);
  const [password, setPassword] = useState('');

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
        <FormControlLabel
          control={
            <Checkbox 
              checked={includeSpecial}
              onChange={(e) => setIncludeSpecial(e.target.checked)}
            />
          }
          label="Include Special Characters"
        />
        <TextField
          fullWidth
          value={password}
          placeholder="Generated password"
          slotProps={{
            input: {
              readOnly: true,
          }}}
        />
        <Button variant="contained" fullWidth>
          Generate
        </Button>
      </Stack>
    </Paper>
  );
};

export default PasswordGenerator;