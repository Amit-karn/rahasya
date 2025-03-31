import { Box, Stack } from '@mui/material';
import { DeleteForeverOutlined, LockOutlined } from '@mui/icons-material';
import SecretItem from './SecretItem';
import PropTypes from 'prop-types';

export const SecretsList = ({ 
  secrets, 
  onRemoveSecret, 
  onDecryptSecret,
  mode = 'encrypt' // 'encrypt' or 'decrypt'
}) => {
  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        maxHeight: { xs: '40vh', md: '100%' },
        height: '100%',
        padding: { xs: 2, md: 1.5 },
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        width: { xs: '95%', md: '45%' },
      }}
    >
      <Stack direction="column" spacing={1.5}>
        {Object.keys(secrets).map((key) => (
          <SecretItem
            key={key}
            keyName={key}
            icon={mode === 'encrypt' ? 
              <DeleteForeverOutlined sx={{ m: 0, p: 0, width: 'auto' }} /> : 
              <LockOutlined />
            }
            secret={secrets[key]}
            handleClick={mode === 'encrypt' ? 
              () => onRemoveSecret(key) :
              () => onDecryptSecret(key, secrets[key])
            }
            buttonContent={mode === 'encrypt' ? 'remove' : 'decrypt'}
          />
        ))}
      </Stack>
    </Box>
  );
};

SecretsList.propTypes = {
  secrets: PropTypes.object.isRequired,
  onRemoveSecret: PropTypes.func.isRequired,
  onDecryptSecret: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['encrypt', 'decrypt']),
};


