import React from "react";
import PropTypes from "prop-types";
import { Box, Stack, Button } from "@mui/material";
import { Home, Help } from "@mui/icons-material";
import { Link } from "react-router-dom";

const TopHeader = ({ node }) => {
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
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            startIcon={<Home />}
          >
          </Button>
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