import { Snackbar, Alert } from "@mui/material";
import PropTypes from "prop-types";

const StatusBar = ({ isError, statusMessage, isOpen, onClose }) => (
  <Snackbar
    open={isOpen}
    autoHideDuration={2000}
    onClose={onClose}
    anchorOrigin={{ vertical: "top", horizontal: "right" }}
  >
    <Alert onClose={onClose} severity={isError ? "error" : "success"}>
      {statusMessage}
    </Alert>
  </Snackbar>
);

StatusBar.propTypes = {
  isError: PropTypes.bool.isRequired, // Indicates if the status is an error
  statusMessage: PropTypes.string.isRequired, // The message to display in the status bar
  isOpen: PropTypes.bool.isRequired, // Controls whether the status bar is open
  onClose: PropTypes.func.isRequired // Function to handle closing the status bar
};

export default StatusBar;
