import { Stack, Typography, IconButton } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import PropTypes from "prop-types";

const UploadedFileInfo = ({ file, onReset }) => {
  if (!file) {
    return null;
  }

  const displayedName =
    file?.name?.slice(0, 20) + (file?.name?.length > 20 ? "..." : "");

  return (
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
          whiteSpace: "nowrap"
        }}
      >
        {displayedName}
      </Typography>
      <IconButton
        size="small"
        onClick={onReset}
        sx={{
          padding: "2px",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)"
          }
        }}
      >
        <CloseOutlined sx={{ fontSize: "0.875rem" }} />
      </IconButton>
    </Stack>
  );
};

UploadedFileInfo.propTypes = {
  file: PropTypes.object,
  onReset: PropTypes.func.isRequired
};

export default UploadedFileInfo;
