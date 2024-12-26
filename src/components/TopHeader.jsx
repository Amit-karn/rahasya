import PropTypes from 'prop-types';
import {Box, Stack, Button} from '@mui/material';
import { Help, Home } from '@mui/icons-material';

const TopHeader = ({node}) => {
  return (
    <Box>
        <Stack
          direction={"row"}
          justifyContent="space-between"
          alignItems="center"
          marginTop={1}
          marginBottom={1}
        >
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" startIcon={<Home />} />
            {node}
          </Stack>
          <Button variant="text" color="primary" startIcon={<Help />}>
            How it works?
          </Button>
        </Stack>
      </Box>
  );
};

TopHeader.propTypes = {
  node: PropTypes.node,
};

export default TopHeader;

