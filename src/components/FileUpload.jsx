import PropTypes from "prop-types";
import { Button, Input, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add"; // For the plus sign icon

function FileUpload({ file, handleFileChange }) {
    return (
        <div>
            <Input
                type="file"
                inputProps={{ accept: ".txt" }}
                style={{ display: "none" }}
                onChange={handleFileChange}
                id="file-upload-input"
            />

            {/* Button to trigger file upload */}
            <label htmlFor="file-upload-input">
                <Button
                    variant={file ? "outlined" : "contained"}
                    color="primary"
                    startIcon={<AddIcon />}
                    component="span"
                    size="small"
                    width="20%"
                >
                    {file ? "Reload file": "Upload Existing File"}
                </Button>
            </label>

            {/* Display the file name once the file is uploaded successfully */}
            {file && (
                <Typography variant="body1" style={{ marginTop: "5px", marginLeft: "0rem", fontSize: "0.7rem" }}>
                    {file?.name.slice(0, 20) + (file?.name.length > 20 ? "..." : "")}
                </Typography>
            )}
        </div>
    );
}
FileUpload.propTypes = {
    file: PropTypes.object,
    handleFileChange: PropTypes.func.isRequired,
};

export default FileUpload;
