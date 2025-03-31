import { Container, Stack, Button, Typography, IconButton, Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import { maskMasterKey } from '../utils/DataUtils';
import PropTypes from 'prop-types';
import TopHeader from './TopHeader';

export const BaseLayout = ({ 
  children, 
  masterKey,
  unloadMasterKey,
  headerActions,
  mainActions 
}) => {
  return (
    <Container
      maxWidth={false}
      sx={{
        padding: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        width: "90%",
        margin: "0 auto",
      }}
    >
      <TopHeader />
      
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        marginTop={2}
        gap={{ xs: 3, md: 2 }}
      >
        {headerActions}
        
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          {mainActions}
          
          {masterKey && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" color="primary">
                Master Key: {maskMasterKey(masterKey)}
              </Typography>
              <IconButton size="small" onClick={unloadMasterKey}>
                <Close />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Stack>

      {children}
    </Container>
)
};

BaseLayout.propTypes = {
  children: PropTypes.node,
  masterKey: PropTypes.string,
  unloadMasterKey: PropTypes.func.isRequired,
  headerActions: PropTypes.node,
  mainActions: PropTypes.node,
};