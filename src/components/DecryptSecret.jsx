import { useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PropTypes from "prop-types";
import { maskMasterKey, maskSecret } from "../utils/DataUtils";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import { decrypt } from "../utils/CredLockerUtils";

const DecryptSecret = ({
  openPopup,
  setOpenPopup,
  algorithm,
  masterKey,
  keyName,
  encryptedSecret,
  text,
}) => {
  const [aad, setAad] = useState("");
  const [aadError, setAadError] = useState("");
  const [showAad, setShowAad] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConfirmationSecret, setShowConfirmationSecret] = useState(false);
  const [decryptionResult, setDecryptionResult] = useState({
    keyName: "",
    encryptedSecret: "",
    secretValue: "",
    algorithm: "",
    masterKey: "",
    aad: "", // Additional authenticated data
  });
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setAad("");
    setAadError("");
    setShowAad(false);
    setShowConfirmation(false);
    setShowConfirmationSecret(false);
    setDecryptionResult({
      keyName: "",
      encryptedSecret: "",
      secretValue: "",
      algorithm: "",
      masterKey: "",
      aad: "",
    });
    setLoading(false);
    setOpenPopup(false);
  };

  const handleAadChange = (e) => {
    const { value } = e.target;
    if (
      value.length < passwordManagerConfig.aadMinLength ||
      value.length > passwordManagerConfig.aadMaxLength
    ) {
      setAadError(
        `AAD: The length should be between ${passwordManagerConfig.aadMinLength} and ${passwordManagerConfig.aadMaxLength} characters.`
      );
    } else {
      setAadError("");
    }
    setAad(value);
  };

  const handleDecrypt = async () => {
    setLoading(true);
    const decryptedOutput = await decrypt(masterKey, encryptedSecret, aad);
    setDecryptionResult({
      keyName: keyName,
      secretValue: decryptedOutput,
      algorithm,
      masterKey,
      aad,
      encryptedSecret: encryptedSecret,
    });
    setLoading(false);
    setShowConfirmation(true);
  };

  const isFormValid = () => {
    const isAADValid =
      !isAadRequired() ||
      (aad.length >= passwordManagerConfig.aadMinLength &&
        aad.length <= passwordManagerConfig.aadMaxLength);
    return (
      keyName.trim() !== "" &&
      encryptedSecret.trim() !== "" &&
      isAADValid &&
      aadError === ""
    );
  };

  const handleCancel = () => {
    resetState();
  };

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      handleCancel();
    }
  };

  const handleClickShowAad = () => {
    setShowAad(!showAad);
  };

  const isAadRequired = () => {
    return encryptedSecret.length > 500;
  };

  const handleClickShowConfirmationSecret = () => {
    setShowConfirmationSecret(!showConfirmationSecret);
  };

  return (
    <div>
      <Dialog open={openPopup} onClose={handleClose}>
        <DialogTitle>Decrypt Secret</DialogTitle>
        <DialogContent>
          {text && (
            <Typography variant="body2" color="warning">
              {text}
            </Typography>
          )}
          <TextField
            required
            autoFocus
            margin="dense"
            name="keyName"
            label="Key"
            type="text"
            fullWidth
            value={keyName}
            error={!keyName}
            helperText={
              !keyName &&
              "The key is empty. This should not have happened. Please try again."
            }
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <TextField
            required
            margin="dense"
            name="encryptedSecret"
            label="Encrypted Secret"
            type="text"
            fullWidth
            value={encryptedSecret}
            error={!encryptedSecret}
            helperText={
              !encryptedSecret &&
              "The encrypted secret is empty. This should not have happened. Please try again."
            }
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <TextField
            required
            margin="dense"
            name="masterKey"
            label="Master Key"
            type="text"
            fullWidth
            value={maskMasterKey(masterKey)}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <TextField
            margin="dense"
            name="algorithm"
            label="Algorithm"
            type="text"
            fullWidth
            value={algorithm}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          {isAadRequired() && (
            <TextField
              required
              margin="dense"
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
                        aria-label="toggle secret visibility"
                        onClick={handleClickShowAad}
                        edge="end"
                      >
                        {showAad ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            color="primary"
            variant="outlined"
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

      <Dialog open={showConfirmation} onClose={handleClose} maxWidth="lg">
        <DialogTitle>Decrypted Secret Details</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            wordBreak: "break-word",
          }}
        >
          <Typography variant="body1">
            <strong>Key Name:</strong> {decryptionResult.keyName}
          </Typography>
          <Typography variant="body1">
            <strong>Secret: </strong>
            {showConfirmationSecret
              ? decryptionResult.secretValue
              : maskSecret(decryptionResult.secretValue)}
            <IconButton
              aria-label="toggle confirmation secret visibility"
              onClick={handleClickShowConfirmationSecret}
              edge="end"
            >
              {showConfirmationSecret ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Typography>
          <Typography variant="body1">
            <strong>Encrypted Secret:</strong>{" "}
            {decryptionResult.encryptedSecret}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              wordWrap: "break-word",
            }}
          >
            <strong>Master Key:</strong>{" "}
            {maskMasterKey(decryptionResult.masterKey)}
          </Typography>
          <Typography variant="body1">
            <strong>Algorithm:</strong> {decryptionResult.algorithm}
          </Typography>
          <Typography variant="body1">
            <strong>AAD:</strong>{" "}
            {isAadRequired() ? decryptionResult.aad : "No AAD used"}
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
  encryptedSecret: PropTypes.string.isRequired,
  text: PropTypes.string,
};

export default DecryptSecret;
