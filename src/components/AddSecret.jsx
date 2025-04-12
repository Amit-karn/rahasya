import { useReducer } from "react";
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

const initialState = {
  secretDetails: {
    keyName: "",
    secretValue: "",
    additionalData: "", // Additional authenticated data (AAD)
  },
  isAADVisible: false,
  keyNameError: "",
  secretValueError: "",
  additionalDataError: "",
  isAADEnabled: false,
  isConfirmationDialogVisible: false,
  isSecretVisible: false,
  isConfirmationSecretVisible: false,
  encryptionResult: {
    keyName: "",
    secretValue: "",
    algorithm: "",
    masterKey: "",
    additionalData: "",
    encryptedSecret: "",
  },
  isEncrypting: false,
  passwordStrength: "",
  passwordWarnings: [],
  passwordSuggestions: [],
  passwordCrackDetails: [],
  isAddingSecret: false,
};

function addSecretReducer(state, action) {
  switch (action.type) {
    case "SET_SECRET_DETAILS":
      return { ...state, secretDetails: { ...state.secretDetails, ...action.payload } };
    case "SET_KEY_NAME_ERROR":
      return { ...state, keyNameError: action.payload };
    case "SET_SECRET_VALUE_ERROR":
      return { ...state, secretValueError: action.payload };
    case "SET_ADDITIONAL_DATA_ERROR":
      return { ...state, additionalDataError: action.payload };
    case "TOGGLE_AAD_ENABLED":
      return { ...state, isAADEnabled: !state.isAADEnabled };
    case "TOGGLE_AAD_VISIBILITY":
      return { ...state, isAADVisible: !state.isAADVisible };
    case "TOGGLE_SECRET_VISIBILITY":
      return { ...state, isSecretVisible: !state.isSecretVisible };
    case "TOGGLE_CONFIRMATION_SECRET_VISIBILITY":
      return { ...state, isConfirmationSecretVisible: !state.isConfirmationSecretVisible };
    case "SET_ENCRYPTION_RESULT":
      return { ...state, encryptionResult: action.payload };
    case "SET_IS_ENCRYPTING":
      return { ...state, isEncrypting: action.payload };
    case "SET_PASSWORD_FEEDBACK":
      return {
        ...state,
        passwordStrength: action.payload.strength,
        passwordWarnings: action.payload.warnings,
        passwordSuggestions: action.payload.suggestions,
        passwordCrackDetails: action.payload.crackDetails,
      };
    case "TOGGLE_CONFIRMATION_DIALOG":
      return { ...state, isConfirmationDialogVisible: !state.isConfirmationDialogVisible };
    case "SET_IS_ADDING_SECRET":
      return { ...state, isAddingSecret: action.payload };
    case "RESET_STATE":
      return initialState;
    default:
      return state;
  }
}

const AddSecret = ({
  openPopup,
  setOpenPopup,
  algorithm,
  masterKey,
  addToSecretsList,
  existingSecrets,
  resetParentState
}) => {
  const [state, dispatch] = useReducer(addSecretReducer, initialState);

  const {
    secretDetails,
    isAADVisible,
    keyNameError,
    secretValueError,
    additionalDataError,
    isAADEnabled,
    isConfirmationDialogVisible,
    isSecretVisible,
    isConfirmationSecretVisible,
    encryptionResult,
    isEncrypting,
    passwordStrength,
    passwordWarnings,
    passwordSuggestions,
    passwordCrackDetails,
    isAddingSecret,
  } = state;

  const resetState = () => {
    dispatch({ type: "RESET_STATE" });
    setOpenPopup(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "keyName") {
      if (existingSecrets.includes(value)) {
        dispatch({ type: "SET_KEY_NAME_ERROR", payload: "Key: A secret with this key name already exists." });
      } else {
        dispatch({ type: "SET_KEY_NAME_ERROR", payload: "" });
      }
    } else if (name === "secretValue") {
      if (
        value.length < passwordManagerConfig.secretMinLength ||
        value.length > passwordManagerConfig.secretMaxLength
      ) {
        dispatch({
          type: "SET_SECRET_VALUE_ERROR",
          payload: `Secret: It should be between ${passwordManagerConfig.secretMinLength} and ${passwordManagerConfig.secretMaxLength} characters.`,
        });
      } else {
        dispatch({ type: "SET_SECRET_VALUE_ERROR", payload: "" });
        const { strength, warning, suggestions, passwordCrackDetails } =
          checkPasswordStrength(value);
        dispatch({
          type: "SET_PASSWORD_FEEDBACK",
          payload: { strength, warnings: warning, suggestions, crackDetails: passwordCrackDetails },
        });
      }
    } else if (isAADEnabled && name === "additionalData") {
      if (
        value.length < passwordManagerConfig.aadMinLength ||
        value.length > passwordManagerConfig.aadMaxLength
      ) {
        dispatch({
          type: "SET_ADDITIONAL_DATA_ERROR",
          payload: `AAD: The length should be between ${passwordManagerConfig.aadMinLength} and ${passwordManagerConfig.aadMaxLength} characters.`,
        });
      } else {
        dispatch({ type: "SET_ADDITIONAL_DATA_ERROR", payload: "" });
      }
    }
    dispatch({ type: "SET_SECRET_DETAILS", payload: { [name]: value } });
  };

  const handleEncrypt = async () => {
    dispatch({ type: "SET_IS_ENCRYPTING", payload: true });
    const encryptedOutput = await encrypt(
      masterKey,
      secretDetails.secretValue,
      secretDetails.additionalData
    );
    dispatch({
      type: "SET_ENCRYPTION_RESULT",
      payload: {
        keyName: secretDetails.keyName,
        secretValue: secretDetails.secretValue,
        algorithm: algorithm,
        masterKey: masterKey,
        additionalData: secretDetails.additionalData,
        encryptedSecret: encryptedOutput,
      },
    });
    dispatch({ type: "SET_IS_ENCRYPTING", payload: false });
    dispatch({ type: "TOGGLE_CONFIRMATION_DIALOG" });
  };

  const handleConfirmEncryptAndAdd = async () => {
    dispatch({ type: "SET_IS_ADDING_SECRET", payload: true });
    await addToSecretsList(
      encryptionResult.keyName,
      encryptionResult.encryptedSecret,
      encryptionResult.additionalData
    );
    resetState();
  };

  const handleCancel = () => {
    resetState();
    resetParentState();
  };

  const handleClose = (_, reason) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      handleCancel();
    }
  };

  const isFormValid = () => {
    const isSecretValid =
      secretDetails.secretValue.length >= passwordManagerConfig.secretMinLength &&
      secretDetails.secretValue.length <= passwordManagerConfig.secretMaxLength;
    const isAADValid =
      !isAADEnabled ||
      (secretDetails.additionalData.length >= passwordManagerConfig.aadMinLength &&
        secretDetails.additionalData.length <= passwordManagerConfig.aadMaxLength);
    return (
      secretDetails.keyName.trim() !== "" &&
      isSecretValid &&
      isAADValid &&
      keyNameError === "" &&
      secretValueError === "" &&
      additionalDataError === ""
    );
  };

  return (
    <>
      <Dialog open={openPopup} onClose={handleClose}>
        <DialogTitle>Add New Secret</DialogTitle>
        <DialogContent>
          {/* Key Name Input */}
          <TextField
            required
            autoFocus
            margin="dense"
            name="keyName"
            label="Key Name"
            type="text"
            fullWidth
            value={secretDetails.keyName}
            onChange={handleInputChange}
            error={keyNameError !== ""}
            helperText={keyNameError}
          />
          {/* Secret Value Input */}
          <TextField
            required
            margin="dense"
            name="secretValue"
            label="Secret Value"
            type={isSecretVisible ? "text" : "password"}
            fullWidth
            value={secretDetails.secretValue}
            onChange={handleInputChange}
            error={secretValueError !== ""}
            helperText={secretValueError}
            disabled={secretDetails.keyName.trim() === ""}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle secret visibility"
                      onClick={() => dispatch({ type: "TOGGLE_SECRET_VISIBILITY" })}
                      edge="end"
                    >
                      {isSecretVisible ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {/* Password Feedback */}
          {secretValueError === "" && secretDetails.secretValue !== "" && (
            <PasswordFeedback
              passwordStrength={passwordStrength}
              passwordWarnings={passwordWarnings}
              passwordSuggestions={passwordSuggestions}
              passwordCrackDetails={passwordCrackDetails}
            />
          )}
          {/* Master Key Input */}
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
          {/* Algorithm Input */}
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
          {/* AAD Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isAADEnabled}
                onChange={() => dispatch({ type: "TOGGLE_AAD_ENABLED" })}
                name="isAADEnabled"
                color="primary"
                disabled={
                  secretDetails.keyName.trim() === "" ||
                  secretDetails.secretValue.trim() === "" ||
                  isEncrypting
                }
              />
            }
            label="Use Additional Authenticated Data (AAD)"
          />
          {/* AAD Input */}
          {isAADEnabled && (
            <TextField
              required
              margin="dense"
              name="additionalData"
              label="Additional Authenticated Data (AAD)"
              type={isAADVisible ? "text" : "password"}
              fullWidth
              value={secretDetails.additionalData}
              onChange={handleInputChange}
              error={additionalDataError !== ""}
              helperText={additionalDataError}
              disabled={
                secretDetails.keyName.trim() === "" ||
                secretDetails.secretValue.trim() === "" ||
                isEncrypting
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle AAD visibility"
                        onClick={() => dispatch({ type: "TOGGLE_AAD_VISIBILITY" })}
                        edge="end"
                      >
                        {isAADVisible ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleEncrypt}
            color="primary"
            variant="contained"
            disabled={!isFormValid() || isEncrypting}
            startIcon={isEncrypting ? <CircularProgress size={24} /> : null}
          >
            {isEncrypting ? "Encrypting..." : "Encrypt"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationDialogVisible} onClose={handleClose} maxWidth="lg">
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
            {isConfirmationSecretVisible
              ? encryptionResult.secretValue
              : maskSecret(encryptionResult.secretValue)}
            <IconButton
              aria-label="toggle confirmation secret visibility"
              onClick={() =>
                dispatch({ type: "TOGGLE_CONFIRMATION_SECRET_VISIBILITY" })
              }
              edge="end"
            >
              {isConfirmationSecretVisible ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Typography>
          <Typography variant="body1">
            <strong>Encrypted Secret:</strong> {encryptionResult.encryptedSecret}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              wordWrap: "break-word",
            }}
          >
            <strong>Master Key:</strong> {maskMasterKey(encryptionResult.masterKey)}
          </Typography>
          <Typography variant="body1">
            <strong>Algorithm:</strong> {encryptionResult.algorithm}
          </Typography>
          <Typography variant="body1">
            <strong>AAD:</strong> {isAADEnabled ? encryptionResult.additionalData : "No AAD used"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              dispatch({ type: "TOGGLE_CONFIRMATION_DIALOG" });
              dispatch({ type: "TOGGLE_CONFIRMATION_SECRET_VISIBILITY" });
            }}
            color="primary"
            variant="outlined"
            disabled={isAddingSecret}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmEncryptAndAdd}
            color="primary"
            variant="contained"
            startIcon={isAddingSecret ? <CircularProgress size={24} /> : null}
            disabled={isAddingSecret}
          >
            {isAddingSecret ? "Adding..." : "Confirm & Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

AddSecret.propTypes = {
  openPopup: PropTypes.bool.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
  algorithm: PropTypes.string.isRequired,
  masterKey: PropTypes.string.isRequired,
  addToSecretsList: PropTypes.func.isRequired,
  existingSecrets: PropTypes.array.isRequired,
  resetParentState: PropTypes.func.isRequired,
};

export default AddSecret;
