import PropTypes from "prop-types";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Typography } from "@mui/material";

const MessageDialog = ({ open, onClose, title, message, node }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Typography variant="body1">{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">
          Close
        </Button>
        {node}
      </DialogActions>
    </Dialog>
  );
};

MessageDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  node: PropTypes.node
};

export default MessageDialog;