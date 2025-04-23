import { useEffect, useReducer } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PropTypes from "prop-types";
import { maskMasterKey, maskSecret } from "../utils/DataUtils";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import { decrypt } from "../utils/CredLockerUtils";
import { base64ToUint8Array } from "../utils/CryptoUtils";

const initialDecryptState = {
  aad: "",
  aadError: "",
  showAad: false,
  showDecryptionDialog: false,
  showDecryptedSecret: false,
  showDecryptedAad: false,
  decryptionResult: {
    keyName: "",
    encryptedSecret: "",
    secretValue: "",
    algorithm: "",
    masterKey: "",
    aad: ""
  },
  loading: false,
  decryptionError: ""
};

function decryptReducer(state, action) {
  switch (action.type) {
  case "SET_AAD":
    return { ...state, aad: action.payload };
  case "SET_AAD_ERROR":
    return { ...state, aadError: action.payload };
  case "TOGGLE_SHOW_AAD":
    return { ...state, showAad: !state.showAad };
  case "SET_LOADING":
    return { ...state, loading: action.payload };
  case "SET_DECRYPTION_RESULT":
    return { ...state, decryptionResult: action.payload };
  case "SET_DECRYPTION_ERROR":
    return { ...state, decryptionError: action.payload };
  case "TOGGLE_SHOW_DECRYPTION_DIALOG":
    return { ...state, showDecryptionDialog: action.payload };
  case "TOGGLE_SHOW_DECRYPTED_SECRET":
    return { ...state, showDecryptedSecret: !state.showDecryptedSecret };
  case "TOGGLE_SHOW_DECRYPTED_AAD":
    return { ...state, showDecryptedAad: !state.showDecryptedAad };
  case "RESET_DECRYPT_STATE":
    return initialDecryptState;
  default:
    return state;
  }
}

const DecryptSecret = ({
  openPopup,
  setOpenPopup,
  algorithm,
  masterKey,
  keyName,
  encryptedSecret
}) => {
  const [state, dispatch] = useReducer(decryptReducer, initialDecryptState);
  const {
    aad,
    aadError,
    showAad,
    loading,
    decryptionResult,
    decryptionError,
    showDecryptionDialog,
    showDecryptedSecret,
    showDecryptedAad // Add this
  } = state;

  // Add state sanitization
  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_DECRYPT_STATE" });
    };
  }, []);

  const resetState = () => {
    dispatch({ type: "RESET_DECRYPT_STATE" });
    setOpenPopup(false);
  };

  const handleAadChange = (e) => {
    const { value } = e.target;
    if (
      value.length < passwordManagerConfig.aadMinLength ||
      value.length > passwordManagerConfig.aadMaxLength
    ) {
      dispatch({
        type: "SET_AAD_ERROR",
        payload: `AAD length must be between ${passwordManagerConfig.aadMinLength} and ${passwordManagerConfig.aadMaxLength} characters.`
      });
    } else {
      dispatch({ type: "SET_AAD_ERROR", payload: "" });
    }
    dispatch({ type: "SET_AAD", payload: value });
  };

  const handleDecrypt = async() => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const decryptedOutput = await decrypt(masterKey, encryptedSecret, aad);
      dispatch({
        type: "SET_DECRYPTION_RESULT",
        payload: {
          keyName,
          secretValue: decryptedOutput,
          algorithm,
          masterKey,
          aad,
          encryptedSecret
        }
      });
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "TOGGLE_SHOW_DECRYPTION_DIALOG", payload: true });
      dispatch({ type: "SET_DECRYPTION_ERROR", payload: "" });
    } catch {
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "TOGGLE_SHOW_DECRYPTION_DIALOG", payload: false });
      dispatch({
        type: "SET_DECRYPTION_ERROR",
        payload: "Decryption failed. Please check your inputs."
      });
    }
  };

  const isFormValid = () => {
    const isAadValid =
      !isAadRequired() ||
      (aad.length >= passwordManagerConfig.aadMinLength &&
        aad.length <= passwordManagerConfig.aadMaxLength);
    return (
      keyName.trim() !== "" &&
      encryptedSecret.trim() !== "" &&
      isAadValid &&
      aadError === ""
    );
  };

  const handleCancel = () => {
    resetState();
  };

  const handleClose = (_, reason) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      handleCancel();
    }
  };

  const handleToggleShowAad = () => {
    dispatch({ type: "TOGGLE_SHOW_AAD" });
  };

  const isAadRequired = () => {
    return base64ToUint8Array(encryptedSecret)[0] === 1;
  };

  const handleToggleShowDecryptedSecret = () => {
    dispatch({ type: "TOGGLE_SHOW_DECRYPTED_SECRET" });
  };

  const handleToggleShowDecryptedAad = () => {
    dispatch({ type: "TOGGLE_SHOW_DECRYPTED_AAD" });
  };

  return (
    <div>
      <Dialog open={openPopup} onClose={handleClose}>
        <DialogTitle>Decrypt Secret</DialogTitle>
        <DialogContent>
          {decryptionError && (
            <Typography variant="body2" color="warning">
              {decryptionError}
            </Typography>
          )}
          <TextField
            required
            autoComplete="off"
            autoFocus
            margin="dense"
            name="keyName"
            label="Key"
            type="text"
            fullWidth
            value={keyName}
            error={!keyName}
            helperText={!keyName && "Key is missing. Please try again."}
            slotProps={{ input: { readOnly: true } }}
          />
          <TextField
            required
            autoComplete="off"
            margin="dense"
            name="encryptedSecret"
            label="Encrypted Secret"
            type="text"
            fullWidth
            value={encryptedSecret}
            error={!encryptedSecret}
            helperText={
              !encryptedSecret &&
              "Encrypted secret is missing. Please try again."
            }
            slotProps={{ input: { readOnly: true } }}
          />
          <TextField
            required
            autoComplete="off"
            margin="dense"
            name="masterKey"
            label="Master Key"
            type="text"
            fullWidth
            value={maskMasterKey(masterKey)}
            slotProps={{ input: { readOnly: true } }}
          />
          <TextField
            margin="dense"
            autoComplete="off"
            name="algorithm"
            label="Algorithm"
            type="text"
            fullWidth
            value={algorithm}
            slotProps={{ input: { readOnly: true } }}
          />
          {isAadRequired() && (
            <TextField
              required
              margin="dense"
              autoComplete="off"
              name="aad"
              label="Additional Authenticated Data (AAD)"
              type={showAad ? "text" : "password"}
              fullWidth
              value={aad}
              onChange={handleAadChange}
              error={!!aadError}
              helperText={aadError}
              disabled={loading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle AAD visibility"
                        onClick={handleToggleShowAad}
                        edge="end"
                      >
                        {showAad ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            color="primary"
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDecrypt}
            color="primary"
            variant="contained"
            disabled={!isFormValid() || loading}
            startIcon={loading ? <CircularProgress size={24} /> : null}
          >
            {loading ? "Decrypting..." : "Decrypt"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDecryptionDialog} onClose={handleClose} maxWidth="lg">
        <DialogTitle>Decrypted Secret Details</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            wordBreak: "break-word"
          }}
        >
          <Typography variant="body1">
            <strong>Key Name:</strong> {decryptionResult.keyName}
          </Typography>
          <Typography variant="body1">
            <strong>Secret: </strong>
            {showDecryptedSecret
              ? decryptionResult.secretValue
              : maskSecret(decryptionResult.secretValue)}
            <IconButton
              aria-label="toggle secret visibility"
              onClick={handleToggleShowDecryptedSecret}
              edge="end"
            >
              {showDecryptedSecret ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Typography>
          <Typography variant="body1">
            <strong>Encrypted Secret:</strong>{" "}
            {decryptionResult.encryptedSecret}
          </Typography>
          <Typography variant="body1" sx={{ wordWrap: "break-word" }}>
            <strong>Master Key:</strong>{" "}
            {maskMasterKey(decryptionResult.masterKey)}
          </Typography>
          <Typography variant="body1">
            <strong>Algorithm:</strong> {decryptionResult.algorithm}
          </Typography>
          <Typography variant="body1">
            <strong>AAD:</strong>{" "}
            {isAadRequired() ? (
              <>
                {showDecryptedAad
                  ? decryptionResult.aad
                  : maskSecret(decryptionResult.aad)}
                <IconButton
                  aria-label="toggle aad visibility"
                  onClick={handleToggleShowDecryptedAad}
                  edge="end"
                  size="small"
                >
                  {showDecryptedAad ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </>
            ) : (
              "No AAD used"
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

DecryptSecret.propTypes = {
  openPopup: PropTypes.bool.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
  algorithm: PropTypes.string.isRequired,
  masterKey: PropTypes.string.isRequired,
  keyName: PropTypes.string.isRequired,
  encryptedSecret: PropTypes.string.isRequired
};

export default DecryptSecret;
