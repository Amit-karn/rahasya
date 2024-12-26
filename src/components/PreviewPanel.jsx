import { Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const PreviewPanel = ({ fileContent }) => {
  return (
    <Paper
      sx={{
        backgroundColor: "#f3f4f6",
        width: "100%",
        height: "100%",
        overflow: "auto",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        borderLeft: "1px solid black"
      }}
      elevation={0}
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
        }}
      >
        {fileContent}
      </Typography>
    </Paper>
  );
};

PreviewPanel.propTypes = {
  fileContent: PropTypes.string.isRequired,
};

export default PreviewPanel;