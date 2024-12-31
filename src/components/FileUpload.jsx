import PropTypes from "prop-types";
import { Button, Input, Typography, Stack, IconButton } from "@mui/material";
import { AddCircleOutline, CloseOutlined } from "@mui/icons-material";
import passwordManagerConfig from "../config/PasswordManagerConfig";
import { useRef, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";

function FileUpload({ file, handleFileChange, buttonVariant, reset, disabled, open }) {
  const fileInputRef = useRef(null);

  const handleFileSelection = (event) => {
    // Handle file change
    handleFileChange(event);

    
    fileInputRef.current.value = ""; // Reset the input field
    
  };

  return (
    <div>
      <Input
        type="file"
        inputProps={{ accept: passwordManagerConfig.acceptFileExtension }}
        style={{ display: "none" }}
        onChange={handleFileSelection}
        id="file-upload-input"
        disabled={disabled}
        inputRef={fileInputRef} // Associate ref with input element
      />

      {/* Button to trigger file upload */}
      <label htmlFor="file-upload-input">
        <Button
          variant={buttonVariant || "contained"}
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
      {file && (
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
      )}
    </div>
  );
}

FileUpload.propTypes = {
  file: PropTypes.object,
  handleFileChange: PropTypes.func.isRequired,
  buttonVariant: PropTypes.oneOf(["outlined", "contained", "text"]).isRequired,
  reset: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  open: PropTypes.bool.isRequired,
 // setIsOpen: PropTypes.func.isRequired,
};

export default FileUpload;
