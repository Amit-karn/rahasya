import { Button } from "@mui/material";
import { FileDownloadOutlined } from "@mui/icons-material";
import PropTypes from "prop-types";
import passwordManagerConfig from "../config/PasswordManagerConfig";

const DownloadFile = ({ content }) => {
  const generateDownloadUrl = () => {
    const blob = new Blob([content], {
      type: passwordManagerConfig.fileType[0]
    });
    return URL.createObjectURL(blob);
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `secrets-${timestamp}${passwordManagerConfig.acceptFileExtension}`;

  const handleDownload = () => {
    const url = generateDownloadUrl();
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={<FileDownloadOutlined />}
      size="small"
      onClick={handleDownload}
      disabled={!content}
    >
      Download File
    </Button>
  );
};

DownloadFile.propTypes = {
  content: PropTypes.string.isRequired
};

export default DownloadFile;
