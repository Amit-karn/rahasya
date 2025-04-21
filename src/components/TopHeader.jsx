import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Stack, Button } from "@mui/material";
import { Home, Help, HelpOutline } from "@mui/icons-material";
import { Link } from "react-router-dom";
import HowEncryptorWorksDialog from "./HowEncryptorWorksDialog";
import HowDecryptorWorksDialog from "./HowDecryptorWorksDialog";

const TopHeader = ({ mode }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <Box>
      <Stack
        direction={"row"}
        justifyContent="space-between"
        alignItems="center"
        marginTop={1}
        marginBottom={1}
      >
        <Button
          component={Link}
          to="/"
          variant="contained"
          color="primary"
          startIcon={<Home />}
        ></Button>
        <Button onClick={() => setShowHelp(true)} startIcon={<HelpOutline />}>
          How it works?
        </Button>
        { mode === "encrypt" ? <HowEncryptorWorksDialog open={showHelp} onClose={() => setShowHelp(false)} />
          : <HowDecryptorWorksDialog open={showHelp} onClose={() => setShowHelp(false)} />}
      </Stack>
    </Box>
  );
};

TopHeader.propTypes = {
  mode: PropTypes.oneOf(["encrypt", "decrypt"]).isRequired, // Mode of the layout (encrypt or decrypt)
};

export default TopHeader;
