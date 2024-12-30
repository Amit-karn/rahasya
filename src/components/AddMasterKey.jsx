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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowDropDownTwoTone,
  ArrowDropUpTwoTone
} from "@mui/icons-material";
import { maskMasterKey } from "../utils/DataUtils";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import { generateEncryptionKeyFromMasterKey } from "../utils/CredLockerUtils";

const AddMasterKey = ({
  masterKey,
  setMasterKey,
  openMasterKeyDialog,
  setOpenMasterKeyDialog,
  setStatusBar,
}) => {
  const [tempMasterKey, setTempMasterKey] = useState("");
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [error, setError] = useState("");
  const [showIterationsDropdown, setShowIterationsDropdown] = useState(false);
  const [iterations, setIterations] = useState(passwordManagerConfig.masterKeyDefaultIteraion);

  const resetState = () => {
    setIsGeneratingKey(false);
    setOpenMasterKeyDialog(false);
    setTempMasterKey("");
    setShowMasterKey(false);
    setShowEncryptionKey(false);
    setError("");
    setShowIterationsDropdown(false);
    setIterations(passwordManagerConfig.masterKeyDefaultIteraion);
  };

  const generateMasterKey = async () => {
    if (
      tempMasterKey.length < passwordManagerConfig.masterKeyMinLength ||
      tempMasterKey.length > passwordManagerConfig.masterKeyMaxLength
    ) {
      setError(
        `Master key length must be between ${passwordManagerConfig.masterKeyMinLength} and ${passwordManagerConfig.masterKeyMaxLength} characters.`
      );
      return;
    }
    setIsGeneratingKey(true);
    try {
      setStatusBar(false, "", false);
      const generatedKey = await generateEncryptionKeyFromMasterKey(tempMasterKey, iterations);
      setMasterKey(generatedKey);
      setOpenMasterKeyDialog(false);
      setTempMasterKey("");
    } catch {
      setTempMasterKey("");
      setMasterKey("");
      setStatusBar(
        true,
        "Error in <b>key generation</b>. Please refresh and try again.",
        true
      );
    } finally {
      resetState();
    }
  }
    

  const handleMasterKeyDialogClose = (event, reason) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      setOpenMasterKeyDialog(false);
      setTempMasterKey("");
      setError("");
      setShowIterationsDropdown(false);
      setIterations(passwordManagerConfig.masterKeyDefaultIteraion);
    }
  };

  const handleClickShowSecret = () => {
    setShowMasterKey(!showMasterKey);
  };

  const handleClickShowMasterKey = () => {
    setShowEncryptionKey(!showEncryptionKey);
  };

  const handleToggleIterationsDropdown = () => {
    setShowIterationsDropdown(!showIterationsDropdown);
  };

  const handleIterationsChange = (event) => {
    setIterations(parseInt(event.target.value));
  };

  return (
    <Dialog
      open={openMasterKeyDialog}
      onClose={handleMasterKeyDialogClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {masterKey ? "Update Master Key" : "Add Master Key"}
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
              {showEncryptionKey ? masterKey : maskMasterKey(masterKey)}
              <IconButton
                aria-label="toggle confirmation secret visibility"
                onClick={handleClickShowMasterKey}
                edge="end"
              >
                {showEncryptionKey ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Typography>
          </>
        )}
        <TextField
          required
          autoFocus
          margin="dense"
          label={masterKey ? "Enter New Master Key" : "Enter Master Key"}
          type={showMasterKey ? "text" : "password"}
          fullWidth
          variant="outlined"
          value={tempMasterKey}
          onChange={(e) => {
            setTempMasterKey(e.target.value);
            if (
              e.target.value.length >=
                passwordManagerConfig.masterKeyMinLength &&
              e.target.value.length <= passwordManagerConfig.masterKeyMaxLength
            ) {
              setError("");
            } else {
              setError(
                `Master key length must be between ${passwordManagerConfig.masterKeyMinLength} and ${passwordManagerConfig.masterKeyMaxLength} characters.`
              );
            }
          }}
          error={!!error}
          helperText={error}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle secret visibility"
                    onClick={handleClickShowSecret}
                    edge="end"
                  >
                    {showMasterKey ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        {isGeneratingKey && <Typography variant="body2" color="info">
              Key generation might take a minute. Please wait...
        </Typography>}
        <IconButton onClick={handleToggleIterationsDropdown}>
          {showIterationsDropdown ? <ArrowDropUpTwoTone />: <ArrowDropDownTwoTone /> }
        </IconButton>
        {showIterationsDropdown && (
          <FormControl fullWidth disabled={!!isGeneratingKey}>
            <InputLabel id="iterations-label">Iterations</InputLabel>
            <Select
              labelId="iterations-label"
              id="iterations-label-id"
              value={iterations}
              onChange={handleIterationsChange}
            >
              {passwordManagerConfig.masterKeyIteraionList.map((itr) => (
                <MenuItem key={itr} value={itr}>
                  {itr}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleMasterKeyDialogClose}
          disabled={!!isGeneratingKey}
        >
          Cancel
        </Button>
        <Button
          onClick={generateMasterKey}
          disabled={!!(!tempMasterKey || isGeneratingKey || error)}
          variant="contained"
          startIcon={isGeneratingKey ? <CircularProgress size={24} /> : null}
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
  setOpenMasterKeyDialog: PropTypes.func.isRequired,
  setStatusBar: PropTypes.func.isRequired,
};

export default AddMasterKey;
