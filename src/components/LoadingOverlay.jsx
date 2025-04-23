import PropTypes from "prop-types";
import { Backdrop, CircularProgress } from "@mui/material";

function LoadingOverlay({ open }) {
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
      onClick={(_, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          //doNothing
        }
      }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

LoadingOverlay.propTypes = {
  open: PropTypes.bool.isRequired
};

export default LoadingOverlay;
