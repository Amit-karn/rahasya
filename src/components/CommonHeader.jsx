import React, { useState } from "react";
import { Box, Stack, Button, Typography, IconButton, useMediaQuery } from "@mui/material";
import { HelpOutline } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import HowItWorksDialog from "./HowItWorksDialog";

const CommonHeader = () => {
  const [showHelp, setShowHelp] = useState(false);
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Box sx={{ width: "100%", py: { xs: 1, md: 2 }, px: { xs: 1, md: 4 }, boxShadow: 1, bgcolor: "background.paper", position: "sticky", top: 0, zIndex: 100 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 10 }}>
        {/* Left side - Logo */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              component="span"
              sx={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 1
              }}
            >
              <img
                src="/favicon.svg"
                alt="Rahasya Logo"
                style={{ width: 36, height: 36, display: "block" }}
                draggable={false}
              />
            </Box>
            {!isMobile && (
              <Typography
                variant="h5"
                color="primary"
                sx={{ fontWeight: "bold", letterSpacing: 2, fontFamily: "monospace", fontSize: 28 }}
              >
                Rahasya
              </Typography>
            )}
          </Box>
        </Link>

        {/* Center - Navigation (always visible) */}
        <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
          <Button
            component={Link}
            to="/encrypt"
            color={location.pathname === "/encrypt" ? "primary" : "inherit"}
            variant={location.pathname === "/encrypt" ? "contained" : "text"}
            sx={{ fontWeight: location.pathname === "/encrypt" ? "bold" : "normal", minWidth: 0, px: { xs: 1, md: 2 }, fontSize: { xs: 12, md: 16 } }}
          >
            Encrypt
          </Button>
          <Button
            component={Link}
            to="/decrypt"
            color={location.pathname === "/decrypt" ? "primary" : "inherit"}
            variant={location.pathname === "/decrypt" ? "contained" : "text"}
            sx={{ fontWeight: location.pathname === "/decrypt" ? "bold" : "normal", minWidth: 0, px: { xs: 1, md: 2 }, fontSize: { xs: 12, md: 16 } }}
          >
            Decrypt
          </Button>
          <Button
            component={Link}
            to="/tools"
            color={location.pathname === "/tools" ? "primary" : "inherit"}
            variant={location.pathname === "/tools" ? "contained" : "text"}
            sx={{ fontWeight: location.pathname === "/tools" ? "bold" : "normal", minWidth: 0, px: { xs: 1, md: 2 }, fontSize: { xs: 12, md: 16 } }}
          >
            Tools
          </Button>
        </Stack>

        {/* Right side - How it works */}
        <Box>
          {isMobile ? (
            <IconButton onClick={() => setShowHelp(true)} color="primary" size="large" sx={{ ml: 2, mr: 5 }}>
              <HelpOutline />
            </IconButton>
          ) : (
            <Button
              onClick={() => setShowHelp(true)}
              startIcon={<HelpOutline />}
              variant="outlined"
              size="small"
              sx={{ ml: 2, mr: 10 }}
            >
              How it works
            </Button>
          )}
        </Box>

        {showHelp && (
          <HowItWorksDialog
            open={showHelp}
            onClose={() => setShowHelp(false)}
          />
        )}
      </Stack>
    </Box>
  );
};

export default CommonHeader;