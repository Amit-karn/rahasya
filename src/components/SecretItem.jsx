import React from 'react';
import PropTypes from 'prop-types';
import { Stack, TextField, Button } from '@mui/material';
import { Remove } from '@mui/icons-material';

const SecretItem = ({ keyName, secret, icon, handleClick }) => {
  return (
    <Stack direction="row" spacing={1} width="100%">
      <TextField
        label="Key"
        variant="outlined"
        size="small"
        value={keyName}
        contentEditable={false}
      />
      <TextField
        label="Secret"
        variant="outlined"
        size="small"
        value={secret}
        contentEditable={false}
      />
      <Button
        variant="contained"
        color="primary"
        endIcon={null}
        startIcon={icon}
        onClick={handleClick}
      />
    </Stack>
  );
};

SecretItem.propTypes = {
  keyName: PropTypes.string.isRequired,
  secret: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  handleClick: PropTypes.func.isRequired,
};

export default SecretItem;