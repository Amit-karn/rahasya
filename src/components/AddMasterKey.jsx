import { useState } from "react";
import PropTypes from "prop-types";
import {
  TextField,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { maskMasterKey } from "../utils/DataUtils";

const AddMasterKey = ({ masterKey, setMasterKey, openMasterKeyDialog, setOpenMasterKeyDialog}) => {
  const [tempMasterKey, setTempMasterKey] = useState("");
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);

  const generateMasterKey = async () => {
    setIsGeneratingKey(true);
    try {
      // Simulate key generation - replace with actual key generation logic
      await new Promise((resolve) => setTimeout(resolve, 1500));
      let generatedKey = `generated_${Date.now()}_${tempMasterKey}`;
      generatedKey = generatedKey + "E".repeat(256);
      setMasterKey(generatedKey);
      setOpenMasterKeyDialog(false);
      setTempMasterKey("");
    } catch {
      setTempMasterKey("");
      setMasterKey("");
    } finally {
      setIsGeneratingKey(false);
      setOpenMasterKeyDialog(false);
      setTempMasterKey("");
    }
  };

  const handleMasterKeyDialogClose = (event, reason) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      setOpenMasterKeyDialog(false);
      setTempMasterKey("");
    }
  };

  const handleClickShowSecret = () => {
    setShowSecret(!showSecret);
  };

  const handleClickShowMasterKey = () => {
    setShowMasterKey(!showMasterKey);
  };

  return (
    <Dialog
      open={openMasterKeyDialog}
      onClose={handleMasterKeyDialogClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {masterKey ? "Update Master Key" : "Set Master Key"}
      </DialogTitle>
      <DialogContent>
        {masterKey && (
          <>
            <Typography variant="body1" color="warning">
              This action will reset the application state.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                wordWrap: "break-word",
              }}
            >
              <strong>Master Key: </strong>
              {showMasterKey ? masterKey : maskMasterKey(masterKey)}
              <IconButton
                aria-label="toggle confirmation secret visibility"
                onClick={handleClickShowMasterKey}
                edge="end"
              >
                {showMasterKey ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Typography>
          </>
        )}
        <TextField
          required
          autoFocus
          margin="dense"
          label={masterKey ? "Enter New Master Key" : "Enter Master Key"}
          type={showSecret ? "text" : "password"}
          fullWidth
          variant="outlined"
          value={tempMasterKey}
          onChange={(e) => setTempMasterKey(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle secret visibility"
                    onClick={handleClickShowSecret}
                    edge="end"
                  >
                    {showSecret ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleMasterKeyDialogClose}>Cancel</Button>
        <Button
          onClick={generateMasterKey}
          disabled={!tempMasterKey || isGeneratingKey}
          variant="contained"
        >
          {isGeneratingKey ? "Generating..." : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddMasterKey.propTypes = {
    masterKey: PropTypes.string.isRequired,
    setMasterKey: PropTypes.func.isRequired,
    openMasterKeyDialog: PropTypes.bool.isRequired,
    setOpenMasterKeyDialog: PropTypes.func.isRequired
};

export default AddMasterKey;
