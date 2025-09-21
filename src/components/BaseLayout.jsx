import React from "react";
import PropTypes from "prop-types";
import { Container, Stack, Typography, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import {
  generateFileContentForPreview,
  isEmptyObj,
  maskMasterKey
} from "../utils/DataUtils";
import DownloadFile from "./DownloadFile";

const BaseLayout = ({
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
          md: 4
        },
        width: "90%",
        margin: "0 auto"
      }}
    >
      {/* Header Actions and Main Actions */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
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
          sx={{
            "& > *": {
              width: { xs: "100%", md: "auto" },
              minWidth: 0
            }
          }}
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
  children: PropTypes.node,
  masterKey: PropTypes.string,
  onUnloadMasterKey: PropTypes.func.isRequired,
  headerActions: PropTypes.node,
  mainActions: PropTypes.node,
  fileData: PropTypes.shape({
    secrets: PropTypes.object
  }),
  mode: PropTypes.oneOf(["encrypt", "decrypt"]).isRequired
};

export default BaseLayout;
