import { useEffect, useReducer } from "react";
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
  ArrowDropUpTwoTone,
} from "@mui/icons-material";
import { maskMasterKey } from "../utils/DataUtils";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import { generateEncryptionKeyFromMasterKey } from "../utils/CredLockerUtils";
import PasswordFeedback from "./PasswordFeedback";

const initialState = {
  masterKeyInput: "", // Input for the master key
  isKeyBeingGenerated: false, // Indicates if the key is being generated
  isMasterKeyVisible: false, // Toggles visibility of the master key input
  isEncryptionKeyVisible: false, // Toggles visibility of the encryption key
  inputError: "", // Error message for invalid input
  isIterationsDropdownVisible: false, // Toggles visibility of the iterations dropdown
  iterationsCount: passwordManagerConfig.masterKeyDefaultIteraion, // Default iteration count
};

const masterKeyReducer = (state, action) => {
  switch (action.type) {
    case "SET_MASTER_KEY_INPUT":
      return { ...state, masterKeyInput: action.payload };
    case "SET_IS_KEY_BEING_GENERATED":
      return { ...state, isKeyBeingGenerated: action.payload };
    case "TOGGLE_MASTER_KEY_VISIBILITY":
      return { ...state, isMasterKeyVisible: !state.isMasterKeyVisible };
    case "TOGGLE_ENCRYPTION_KEY_VISIBILITY":
      return {
        ...state,
        isEncryptionKeyVisible: !state.isEncryptionKeyVisible,
      };
    case "SET_INPUT_ERROR":
      return { ...state, inputError: action.payload };
    case "TOGGLE_ITERATIONS_DROPDOWN":
      return {
        ...state,
        isIterationsDropdownVisible: !state.isIterationsDropdownVisible,
      };
    case "SET_ITERATIONS_COUNT":
      return { ...state, iterationsCount: action.payload };
    case "RESET_STATE":
      return initialState;
    default:
      return state;
  }
};

const AddMasterKey = ({
  masterKey,
  setMasterKey,
  openMasterKeyDialog,
  setOpenMasterKeyDialog,
  setStatusBar,
}) => {
  const [state, dispatch] = useReducer(masterKeyReducer, initialState);

  const {
    masterKeyInput,
    isKeyBeingGenerated,
    isMasterKeyVisible,
    isEncryptionKeyVisible,
    inputError,
    isIterationsDropdownVisible,
    iterationsCount,
  } = state;

  // Add state sanitization
  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_STATE" });
    };
  }, []);

  const resetState = () => {
    dispatch({ type: "RESET_STATE" });
    setOpenMasterKeyDialog(false);
  };

  const generateMasterKey = async () => {
    if (
      masterKeyInput.length < passwordManagerConfig.masterKeyMinLength ||
      masterKeyInput.length > passwordManagerConfig.masterKeyMaxLength
    ) {
      dispatch({
        type: "SET_INPUT_ERROR",
        payload: `Master key length must be between ${passwordManagerConfig.masterKeyMinLength} and ${passwordManagerConfig.masterKeyMaxLength} characters.`,
      });
      return;
    }
    dispatch({ type: "SET_IS_KEY_BEING_GENERATED", payload: true });
    try {
      const generatedKey = await generateEncryptionKeyFromMasterKey(
        masterKeyInput,
        iterationsCount
      );
      setMasterKey(generatedKey);
      setOpenMasterKeyDialog(false);
      dispatch({ type: "SET_MASTER_KEY_INPUT", payload: "" });
    } catch {
      dispatch({ type: "SET_MASTER_KEY_INPUT", payload: "" });
      setMasterKey("");
      setStatusBar(
        true,
        "Error in <b>key generation</b>. Please refresh and try again."
      );
    } finally {
      resetState();
    }
  };

  const handleMasterKeyDialogClose = (event, reason) => {
    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
      resetState();
    }
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
              {isEncryptionKeyVisible ? masterKey : maskMasterKey(masterKey)}
              <IconButton
                aria-label="toggle confirmation secret visibility"
                onClick={() =>
                  dispatch({ type: "TOGGLE_ENCRYPTION_KEY_VISIBILITY" })
                }
                edge="end"
              >
                {isEncryptionKeyVisible ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Typography>
          </>
        )}
        <TextField
          required
          autoFocus
          autoComplete="off"
          margin="dense"
          label={masterKey ? "Enter New Master Key" : "Enter Master Key"}
          type={isMasterKeyVisible ? "text" : "password"}
          fullWidth
          variant="outlined"
          value={masterKeyInput}
          onChange={(e) => {
            dispatch({ type: "SET_MASTER_KEY_INPUT", payload: e.target.value });
            if (
              e.target.value.length >=
                passwordManagerConfig.masterKeyMinLength &&
              e.target.value.length <= passwordManagerConfig.masterKeyMaxLength
            ) {
              dispatch({ type: "SET_INPUT_ERROR", payload: "" });
            } else {
              dispatch({
                type: "SET_INPUT_ERROR",
                payload: `Master key length must be between ${passwordManagerConfig.masterKeyMinLength} and ${passwordManagerConfig.masterKeyMaxLength} characters.`,
              });
            }
          }}
          error={!!inputError}
          helperText={inputError}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle secret visibility"
                    onClick={() =>
                      dispatch({ type: "TOGGLE_MASTER_KEY_VISIBILITY" })
                    }
                    edge="end"
                  >
                    {isMasterKeyVisible ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        {masterKeyInput.length >= passwordManagerConfig.masterKeyMinLength &&
          masterKeyInput.length <= passwordManagerConfig.masterKeyMaxLength && (
            <PasswordFeedback password={masterKeyInput} />
          )}
        {isKeyBeingGenerated && (
          <Typography variant="body2" color="info">
            Key generation might take a minute or two. Please wait...
          </Typography>
        )}
        <IconButton
          onClick={() => dispatch({ type: "TOGGLE_ITERATIONS_DROPDOWN" })}
        >
          {isIterationsDropdownVisible ? (
            <ArrowDropUpTwoTone />
          ) : (
            <ArrowDropDownTwoTone />
          )}
        </IconButton>
        {isIterationsDropdownVisible && (
          <FormControl fullWidth disabled={!!isKeyBeingGenerated}>
            <InputLabel id="iterations-label">Iterations</InputLabel>
            <Select
              labelId="iterations-label"
              id="iterations-label-id"
              value={iterationsCount}
              onChange={(e) =>
                dispatch({
                  type: "SET_ITERATIONS_COUNT",
                  payload: e.target.value,
                })
              }
              label="Iterations"
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
          disabled={!!isKeyBeingGenerated}
        >
          Cancel
        </Button>
        <Button
          onClick={generateMasterKey}
          disabled={!!(!masterKeyInput || isKeyBeingGenerated || inputError)}
          variant="contained"
          startIcon={
            isKeyBeingGenerated ? <CircularProgress size={24} /> : null
          }
        >
          {isKeyBeingGenerated ? "Generating..." : "Confirm"}
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
