import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Typography
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PropTypes from "prop-types";

const AddSecret = ({
  openPopup,
  setOpenPopup,
  algorithm,
  masterKey,
  addToSecretsList,
  existingSecrets,
}) => {
  const [newSecret, setNewSecret] = useState({
    keyName: "",
    secretValue: "",
    masterKey: masterKey || "",
    algorithm: algorithm || "",
    aad: "", // Additional authenticated data
  });
  const [keyError, setKeyError] = useState("");
  const [secretError, setSecretError] = useState("");
  const [aadError, setAadError] = useState("");
  const [useAAD, setUseAAD] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [encryptedSecret, setEncryptedSecret] = useState("");
  const [showConfirmationSecret, setShowConfirmationSecret] = useState(false);

  const handlePopupChange = (e) => {
    const { name, value } = e.target;
    if (name === "keyName") {
      if (existingSecrets.includes(value)) {
        setKeyError("Key: A secret with this key name already exists.");
      } else {
        setKeyError("");
      }
    } else if (name === "secretValue") {
      if (value.length < 16 || value.length > 32) {
        setSecretError("Secret: It should be between 16 and 32 characters.");
      } else {
        setSecretError("");
      }
    } else if (name === "aad" && useAAD) {
      if (value.length < 8 || value.length > 16) {
        setAadError("AAD: The length should be between 8 and 16 characters.");
      } else {
        setAadError("");
      }
    }
    setNewSecret((prev) => ({ ...prev, [name]: value }));
  };

  const handleEncryptAndAddSecret = () => {
    setEncryptedSecret(newSecret.secretValue+"ENC:hvfbhjjjjjjj561651≤6561561561561561156156166666666666");
    setShowConfirmation(true);
  };

  const handleConfirmEncryptAndAdd = () => {
    addToSecretsList(newSecret.keyName, newSecret.secretValue, newSecret.aad);
    setOpenPopup(false);
    setNewSecret({
      keyName: "",
      secretValue: "",
      masterKey: masterKey || "",
      algorithm: algorithm || "",
      aad: "",
    });
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setOpenPopup(false);
    setNewSecret({
      keyName: "",
      secretValue: "",
      masterKey: masterKey || "",
      algorithm: algorithm || "",
      aad: "",
    });
  };

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      handleCancel();
    }
  };

  const isFormValid = () => {
    const isSecretValid =
      newSecret.secretValue.length >= 16 && newSecret.secretValue.length <= 32;
    const isAADValid =
      !useAAD || (newSecret.aad.length >= 8 && newSecret.aad.length <= 16);
    return (
      newSecret.keyName.trim() !== "" &&
      isSecretValid &&
      isAADValid &&
      keyError === "" &&
      secretError === "" &&
      aadError === ""
    );
  };

  const maskMasterKey = (key) => {
    if (key.length <= 5) return key;
    return `${key.slice(0, 2)}${"*".repeat(key.length - 5)}${key.slice(-3)}`;
  };

  const maskSecret = (secret) => {
    if (secret.length <= 2) return secret;
    return `${"*".repeat(secret.length - 2)}${secret.slice(-2)}`;
  };

  const handleClickShowSecret = () => {
    setShowSecret(!showSecret);
  };

  const handleClickShowConfirmationSecret = () => {
    setShowConfirmationSecret(!showConfirmationSecret);
  };

  return (
    <div>
      <Dialog open={openPopup} onClose={handleClose}>
        <DialogTitle>Add New Secret</DialogTitle>
        <DialogContent>
          <TextField
            required
            autoFocus
            margin="dense"
            name="keyName"
            label="Key"
            type="text"
            fullWidth
            value={newSecret.keyName}
            onChange={handlePopupChange}
            error={keyError !== ""}
            helperText={keyError}
          />
          <TextField
            required
            margin="dense"
            name="secretValue"
            label="Secret"
            type={showSecret ? "text" : "password"}
            fullWidth
            value={newSecret.secretValue}
            onChange={handlePopupChange}
            error={secretError !== ""}
            helperText={secretError}
            disabled={newSecret.keyName.trim() === ""}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle secret visibility"
                      onClick={handleClickShowSecret}
                      edge="end"
                    >
                      {showSecret ? <Visibility />: <VisibilityOff /> }
                    </IconButton>
                  </InputAdornment>
                ),
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
            value={maskMasterKey(newSecret.masterKey)}
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
            value={newSecret.algorithm}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={useAAD}
                onChange={(e) => setUseAAD(e.target.checked)}
                name="useAAD"
                color="primary"
                disabled={
                  newSecret.keyName.trim() === "" ||
                  newSecret.secretValue.trim() === ""
                }
              />
            }
            label="Use Additional Authenticated Data (AAD)"
          />
          {useAAD && (
            <TextField
              required
              margin="dense"
              name="aad"
              label="Additional Authenticated Data (AAD)"
              type="text"
              fullWidth
              value={newSecret.aad}
              onChange={handlePopupChange}
              error={aadError !== ""}
              helperText={aadError}
              disabled={
                newSecret.keyName.trim() === "" ||
                newSecret.secretValue.trim() === ""
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleEncryptAndAddSecret}
            color="primary"
            variant="contained"
            disabled={!isFormValid()}
          >
            Encrypt
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showConfirmation} onClose={handleClose} maxWidth="lg">
        <DialogTitle>Confirm Secret Details</DialogTitle>
        <DialogContent>
        <Typography variant="body1">
            <strong>Key Name:</strong> {newSecret.keyName}
          </Typography>
          <Typography variant="body1">
            <strong>Secret: </strong>
            {showConfirmationSecret
              ? newSecret.secretValue
              : maskSecret(newSecret.secretValue)}
            <IconButton
              aria-label="toggle confirmation secret visibility"
              onClick={handleClickShowConfirmationSecret}
              edge="end"
            >
              {showConfirmationSecret ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Typography>
          <Typography variant="body1" >
            <strong>Encrypted Secret:</strong> {encryptedSecret}
          </Typography>
          <Typography variant="body1" >
            <strong>Master Key:</strong> {maskMasterKey(newSecret.masterKey)}
          </Typography>
          <Typography variant="body1" >
            <strong>Algorithm:</strong> {newSecret.algorithm}
          </Typography>
          <Typography variant="body1" >
            <strong>AAD:</strong> {useAAD ? newSecret.aad : "No AAD used"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowConfirmation(false)}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmEncryptAndAdd}
            color="primary"
            variant="contained"
          >
            Confirm & Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

AddSecret.propTypes = {
  openPopup: PropTypes.bool.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
  algorithm: PropTypes.string.isRequired,
  masterKey: PropTypes.string.isRequired,
  addToSecretsList: PropTypes.func.isRequired,
  existingSecrets: PropTypes.array.isRequired,
};

export default AddSecret;
