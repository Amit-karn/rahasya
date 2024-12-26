import { Button, Link } from "@mui/material";
import { FileDownloadOutlined } from "@mui/icons-material";
import PropTypes from 'prop-types';

const DownloadFile = ({ content }) => {
  const generateDownloadUrl = () => {
    const blob = new Blob([content], { type: "text/plain" });
    return URL.createObjectURL(blob);
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `secrets-${timestamp}.txt`;

  return (
    <Link
      component={Button}
      href={generateDownloadUrl()}
      download={fileName}
      variant="button"
      color="primary"
      startIcon={<FileDownloadOutlined />}
      size="small"
      onClick={(e) => {
        // Cleanup the URL object after download starts
        setTimeout(() => URL.revokeObjectURL(e.currentTarget.href), 150);
      }}
      disabled={!content}
      underline="none"
      sx={{ textDecoration: 'none' }}
    >
      Download File
    </Link>
  );
};
DownloadFile.propTypes = {
  content: PropTypes.string.isRequired,
};

export default DownloadFile;