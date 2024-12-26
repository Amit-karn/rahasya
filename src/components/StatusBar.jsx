import { Snackbar, Alert } from "@mui/material";
import PropTypes from "prop-types";

const StatusBar = ({ isError, message, openStatusbar, setOpenStatusbar }) => (
        <Snackbar 
            open={openStatusbar} 
            autoHideDuration={2000} 
            onClose={() => setOpenStatusbar(false)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
        <Alert onClose={() => setOpenStatusbar(false)} severity={isError ? "error" : "success"}>
          {message}
        </Alert>
      </Snackbar>
);

StatusBar.propTypes = {
    isError: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    openStatusbar: PropTypes.bool.isRequired,
    setOpenStatusbar: PropTypes.func.isRequired,
}; 

export default StatusBar;