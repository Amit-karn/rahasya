import PropTypes from "prop-types";
import { Button, Input } from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import { useRef } from "react";

function FileUpload({
  file,
  handleFileChange,
  buttonVariant,
  reset,
  disabled,
  isGeneratingFile
}) {
  const fileInputRef = useRef(null);

  // Ask for confirmation before opening file picker
  const handleInputClick = (event) => {
    if (isGeneratingFile) {
      const userConfirmed = window.confirm(
        "Uploading a new file will reset the application state. Do you want to proceed ?"
      );
      if (!userConfirmed) {
        event.preventDefault();
      }
    }
  };

  const handleFileSelection = (event) => {
    // File has been selected (after confirmation)
    reset();
    handleFileChange(event);
    fileInputRef.current.value = ""; // Reset the input field
  };

  return (
    <div>
      <Input
        type="file"
        inputProps={{ accept: passwordManagerConfig.acceptFileExtension }}
        style={{ display: "none" }}
        onClick={handleInputClick}
        onChange={handleFileSelection}
        id="file-upload-input"
        disabled={disabled}
        inputRef={fileInputRef} // Associate ref with input element
      />

      {/* Button to trigger file upload */}
      <label htmlFor="file-upload-input">
        <Button
          variant={isGeneratingFile ? "outlined" : buttonVariant || "contained"}
          color="primary"
          startIcon={<AddCircleOutline />}
          component="span"
          size="small"
          width="20%"
          disabled={disabled}
        >
          {file ? "Reload file" : "Upload Existing File"}
        </Button>
      </label>

      {/* Display the file name and close button */}
      {/* {file && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mt: "5px", ml: "0rem" }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: "0.7rem",
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file?.name?.slice(0, 20) + (file?.name?.length > 20 ? "..." : "")}
          </Typography>
          <IconButton
            size="small"
            onClick={reset}
            sx={{
              padding: "2px",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <CloseOutlined sx={{ fontSize: "0.875rem" }} />
          </IconButton>
        </Stack>
      )} */}
    </div>
  );
}

FileUpload.propTypes = {
  file: PropTypes.object,
  handleFileChange: PropTypes.func.isRequired,
  buttonVariant: PropTypes.oneOf(["outlined", "contained", "text"]),
  reset: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  isGeneratingFile: PropTypes.bool
};

export default FileUpload;
