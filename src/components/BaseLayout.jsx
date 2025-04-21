import { Container, Stack, Button, Typography, IconButton, Box } from "@mui/material";
import { Close } from "@mui/icons-material";
import { generateFileContentForPreview, isEmptyObj, maskMasterKey } from "../utils/DataUtils";
import PropTypes from "prop-types";
import TopHeader from "./TopHeader";
import DownloadFile from "./DownloadFile";

export const BaseLayout = ({
  children,
  masterKey,
  onUnloadMasterKey,
  headerActions,
  mainActions,
  fileData,
  mode
}) => {
  return (
    <Container
      maxWidth={false}
      sx={{
        padding: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        width: "90%",
        margin: "0 auto",
      }}
    >
      {/* Top Header */}
      <TopHeader mode={mode}/>

      {/* Header Actions and Main Actions */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        marginTop={2}
        gap={{ xs: 3, md: 2 }}
      >
        {/* Header Actions */}
        {headerActions}

        {/* Main Actions */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          {mode === "encrypt" && fileData && !isEmptyObj(fileData.secrets) && (
            <DownloadFile content={generateFileContentForPreview(fileData)} />
          )}
          {mainActions}

          {/* Display Masked Master Key */}
          {masterKey && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" color="primary">
                Master Key: {maskMasterKey(masterKey)}
              </Typography>
              <IconButton size="small" onClick={onUnloadMasterKey}>
                <Close />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* Main Content */}
      {children}
    </Container>
  );
};

BaseLayout.propTypes = {
  children: PropTypes.node, // Content to be rendered inside the layout
  masterKey: PropTypes.string, // Masked master key to display
  onUnloadMasterKey: PropTypes.func.isRequired, // Function to unload the master key
  headerActions: PropTypes.node, // Actions to display in the header
  mainActions: PropTypes.node, // Main actions to display
  fileData: PropTypes.shape({
    secrets: PropTypes.object, // Secrets object in fileData
  }), // File data to be used in the layout
  mode: PropTypes.oneOf(["encrypt", "decrypt"]).isRequired, // Mode of the layout (encrypt or decrypt)
}