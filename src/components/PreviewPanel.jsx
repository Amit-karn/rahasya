import { Paper, Typography } from "@mui/material";
import PropTypes from "prop-types";

const PreviewPanel = ({ fileContent }) => {
  return (
    <Paper
      sx={{
        backgroundColor: "#f3f4f6",
        width: { xs: "100%", md: "50%" },
        height: { xs: "50%", md: "100%" },
        display: "flex", // Add flex display
        flexDirection: "column", // Stack children vertically
        overflow: "hidden", // Change to hidden to prevent double scrollbars
        position: "relative" // Add positioning context
      }}
      variant="outlined"
    >
      <Typography
        variant="body1"
        component="pre"
        sx={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          margin: 0,
          padding: { xs: 2, md: 1.5 },
          fontFamily: "monospace",
          fontSize: { xs: "0.675rem", md: "0.875rem" },
          overflow: "auto", // Move overflow to Typography
          position: "absolute", // Position absolutely
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          // Custom scrollbar styling
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px"
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1"
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "4px",
            "&:hover": {
              background: "#555"
            }
          }
        }}
      >
        {fileContent}
      </Typography>
    </Paper>
  );
};

PreviewPanel.propTypes = {
  fileContent: PropTypes.string.isRequired
};

export default PreviewPanel;
