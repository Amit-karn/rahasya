import PropTypes from "prop-types";
import { Box, TextField, Button } from "@mui/material";

const SecretItem = ({ keyName, secret, icon, handleClick }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1, // Similar to spacing in Stack
        width: "100%",
      }}
    >
        <TextField
          label="Key"
          variant="outlined"
          size="small"
          value={keyName}
          contentEditable={false}
          fullWidth
          sx={{ flex: 1 }}
        />
    
        <TextField
          label="Secret"
          variant="outlined"
          size="small"
          value={secret}
          contentEditable={false}
          sx={{ flex: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={null}
          startIcon={icon}
          onClick={handleClick}
        />
    </Box>
  );
};

SecretItem.propTypes = {
  keyName: PropTypes.string.isRequired,
  secret: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  handleClick: PropTypes.func.isRequired,
};

export default SecretItem;
