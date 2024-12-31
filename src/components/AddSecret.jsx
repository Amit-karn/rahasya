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
  Typography,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PropTypes from "prop-types";
import { maskMasterKey, maskSecret } from "../utils/DataUtils";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import { encrypt } from "../utils/CredLockerUtils";
import { checkPasswordStrength } from "../utils/PasswordStrengthUtils";
import PasswordFeedback from "./PasswordFeedback";

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
    aad: "", // Additional authenticated data
  });
  const [showAad, setShowAad] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [secretError, setSecretError] = useState("");
  const [aadError, setAadError] = useState("");
  const [useAAD, setUseAAD] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showConfirmationSecret, setShowConfirmationSecret] = useState(false);
  const [encryptionResult, setEncryptionResult] = useState({
    keyName: "",
    secretValue: "",
    algorithm: "",
    masterKey: "",
    aad: "", // Additional authenticated data
    encryptedSecret: "",
  });
  const [loading, setLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordWarnings, setPasswordWarnings] = useState([]);
  const [passwordSuggestions, setPasswordSuggestions] = useState([]);
  const [passwordCrackDetails, setPasswordCrackDetails] = useState([]);
  const [isAddingKey, setIsAddingKey] = useState(false);

  const resetState = () => {
    setNewSecret({
      keyName: "",
      secretValue: "",
      aad: "",
    });
    setShowAad(false);
    setKeyError("");
    setSecretError("");
    setAadError("");
    setUseAAD(false);
    setShowConfirmation(false);
    setShowSecret(false);
    setShowConfirmationSecret(false);
    setEncryptionResult({
      keyName: "",
      secretValue: "",
      algorithm: "",
      masterKey: "",
      aad: "",
      encryptedSecret: "",
    });
    setLoading(false);
    setOpenPopup(false);
    setPasswordStrength("");
    setPasswordWarnings([]);
    setPasswordSuggestions([]);
    setPasswordCrackDetails([]);
    setIsAddingKey(false);
  };

  const handlePopupChange = (e) => {
    const { name, value } = e.target;
    if (name === "keyName") {
      if (existingSecrets.includes(value)) {
        setKeyError("Key: A secret with this key name already exists.");
      } else {
        setKeyError("");
      }
    } else if (name === "secretValue") {
      if (
        value.length < passwordManagerConfig.secretMinLength ||
        value.length > passwordManagerConfig.secretMaxLength
      ) {
        setSecretError(
          `Secret: It should be between ${passwordManagerConfig.secretMinLength} and ${passwordManagerConfig.secretMaxLength} characters.`
        );
      } else {
        setSecretError("");
        const { strength, warning, suggestions, passwordCrackDetails } =
          checkPasswordStrength(value);
        setPasswordStrength(strength);
        setPasswordWarnings(warning);
        setPasswordSuggestions(suggestions);
        setPasswordCrackDetails(passwordCrackDetails);
      }
    } else if (useAAD && name === "aad") {
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
    }
    setNewSecret((prev) => ({ ...prev, [name]: value }));
  };

  const handleEncrypt = async () => {
    setLoading(true);
    const encryptedOutput = await encrypt(
      masterKey,
      newSecret.secretValue,
      newSecret.aad
    );
    setEncryptionResult({
      keyName: newSecret.keyName,
      secretValue: newSecret.secretValue,
      algorithm: algorithm,
      masterKey: masterKey,
      aad: newSecret.aad,
      encryptedSecret: encryptedOutput,
    });
    setLoading(false);
    setShowConfirmation(true);
  };

  const handleConfirmEncryptAndAdd = async() => {
    setIsAddingKey(true);
    await addToSecretsList(encryptionResult.keyName, encryptionResult.encryptedSecret, encryptionResult.aad);
    resetState();
  };

  const handleCancel = () => {
    resetState();
  };

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      handleCancel();
    }
  };

  const isFormValid = () => {
    const isSecretValid =
      newSecret.secretValue.length >= passwordManagerConfig.secretMinLength &&
      newSecret.secretValue.length <= passwordManagerConfig.secretMaxLength;
    const isAADValid =
      !useAAD ||
      (newSecret.aad.length >= passwordManagerConfig.aadMinLength &&
        newSecret.aad.length <= passwordManagerConfig.aadMaxLength);
    return (
      newSecret.keyName.trim() !== "" &&
      isSecretValid &&
      isAADValid &&
      keyError === "" &&
      secretError === "" &&
      aadError === ""
    );
  };

  const handleClickShowSecret = () => {
    setShowSecret(!showSecret);
  };

  const handleClickShowAad = () => {
    setShowAad(!showAad);
  };

  const handleClickShowConfirmationSecret = () => {
    setShowConfirmationSecret(!showConfirmationSecret);
  };

  const resetConfimationDialogState = () => {
    handleClickShowConfirmationSecret();
    setShowConfirmation(false);
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
                      {showSecret ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {secretError === "" && newSecret.secretValue != "" &&
          <PasswordFeedback
          passwordStrength={passwordStrength}
          passwordWarnings={passwordWarnings}
          passwordSuggestions={passwordSuggestions}
          passwordCrackDetails={passwordCrackDetails}
        />
          }
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
          <FormControlLabel
            control={
              <Checkbox
                checked={useAAD}
                onChange={(e) => setUseAAD(e.target.checked)}
                name="useAAD"
                color="primary"
                disabled={
                  newSecret.keyName.trim() === "" ||
                  newSecret.secretValue.trim() === ""||
                  loading
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
              type={showAad ? "text" : "password"}
              fullWidth
              value={newSecret.aad}
              onChange={handlePopupChange}
              error={aadError !== ""}
              helperText={aadError}
              disabled={
                newSecret.keyName.trim() === "" ||
                newSecret.secretValue.trim() === ""||
                loading
              }
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
            onClick={handleEncrypt}
            color="primary"
            variant="contained"
            disabled={!isFormValid() || loading}
            startIcon={loading ? <CircularProgress size={24} /> : null}
          >
            {loading ? "Encrypting..." : "Encrypt"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showConfirmation} onClose={handleClose} maxWidth="lg">
        <DialogTitle>Confirm Secret Details</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            wordBreak: "break-word",
          }}
        >
          <Typography variant="body1">
            <strong>Key Name:</strong> {encryptionResult.keyName}
          </Typography>
          <Typography variant="body1">
            <strong>Secret: </strong>
            {showConfirmationSecret
              ? encryptionResult.secretValue
              : maskSecret(encryptionResult.secretValue)}
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
            {encryptionResult.encryptedSecret}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              wordWrap: "break-word",
            }}
          >
            <strong>Master Key:</strong>{" "}
            {maskMasterKey(encryptionResult.masterKey)}
          </Typography>
          <Typography variant="body1">
            <strong>Algorithm:</strong> {encryptionResult.algorithm}
          </Typography>
          <Typography variant="body1">
            <strong>AAD:</strong>{" "}
            {useAAD ? encryptionResult.aad : "No AAD used"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={resetConfimationDialogState}
            color="primary"
            variant="outlined"
            disabled={isAddingKey}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmEncryptAndAdd}
            color="primary"
            variant="contained"
            startIcon={isAddingKey ? <CircularProgress size={24} /> : null}
            disabled={isAddingKey}
            >
              {isAddingKey ? "Generating Hmac..." : "Confirm & Add"}
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
