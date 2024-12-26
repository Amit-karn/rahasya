import PropTypes from "prop-types";
import { Backdrop, CircularProgress, Typography } from "@mui/material";

function LoadingOverlay({open, message}) {
  return (
    <div>
      {/* Backdrop overlay with loading spinner */}
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open}>
        <div style={{ textAlign: "center" }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            {message}
          </Typography>
        </div>
      </Backdrop>
    </div>
  );
};

LoadingOverlay.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
};

export default LoadingOverlay;
