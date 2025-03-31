import React, { useEffect, useState } from "react";
import { Button, Box } from "@mui/material";
import { VpnKeyOutlined } from "@mui/icons-material";

import { useAppState } from './hooks/useAppState';
import { useFileOperations } from './hooks/useFileOperations';
import { useHelpers } from './hooks/useHelpers';
import { BaseLayout } from './components/BaseLayout';
import { SecretsList } from './components/SecretsList';
import FileUpload from "./components/FileUpload";
import StatusBar from "./components/StatusBar";
import AddMasterKey from "./components/AddMasterKey";
import MessageDialog from "./components/MessageDialog";
import PreviewPanel from "./components/PreviewPanel";
import DecryptSecret from "./components/DecryptSecret";
import LoadingOverlay from "./components/LoadingOverlay";
import passwordManagerConfig from "./config/PasswordManagerConfig";

const CredentialDecryptor = () => {
  const [isDecryptingSecret, setIsDecryptingSecret] = useState(false);
  const [currentKey, setCurrentKey] = useState("");
  const [currentEncryptedSecret, setCurrentEncryptedSecret] = useState("");
  
  const state = useAppState();
  const {
    file,
    fileContentJson,
    masterKey,
    openMasterKeyDialog,
    dialogOpen,
    dialogTitle,
    dialogMessage,
    backDrop,
    openStatusbar,
    isError,
    message
  } = state;

  const helpers = useHelpers(state, {
    ...state,
    setIsDecryptingSecret
  });
  
  const {
    showDialog,
    setStatusbar,
    resetState,
    unloadMasterKey,
    generateFileContentForPreview,
    isEmptyObj
  } = helpers;

  const fileOps = useFileOperations(state, helpers);

  useEffect(() => {
    if (!masterKey) {
      showDialog(
        "Master Key Required",
        "Please add your master key to proceed."
      );
    }
  }, []);

  const handleDecryptButton = (key, encryptedSecret) => {
    if (!masterKey) {
      setStatusbar(
        true,
        "Master key not added. Please add your master key.",
        true
      );
      return;
    }
    setCurrentKey(key);
    setCurrentEncryptedSecret(encryptedSecret);
    setIsDecryptingSecret(true);
  };

  const headerActions = (
    <FileUpload
      file={file}
      handleFileChange={fileOps.handleFileUpload}
      buttonVariant={file ? "outlined" : "contained"}
      reset={resetState}
      disabled={!masterKey}
      open={backDrop}
    />
  );

  const mainActions = (
    <Button
      variant={masterKey ? "outlined" : "contained"}
      color="primary"
      startIcon={<VpnKeyOutlined />}
      size="small"
      onClick={() => state.setOpenMasterKeyDialog(true)}
    >
      {masterKey ? "Update Master Key" : "Add Master Key"}
    </Button>
  );

  return (
    <BaseLayout
      masterKey={masterKey}
      unloadMasterKey={unloadMasterKey}
      headerActions={headerActions}
      mainActions={mainActions}
    >
      {fileContentJson && !isEmptyObj(fileContentJson.secrets) && (
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 1 },
          marginTop: 1,
          height: { xs: "80vh", md: "calc(100vh - 200px)" },
          width: "100%",
        }}>
          <SecretsList
            secrets={fileContentJson.secrets}
            onDecryptSecret={handleDecryptButton}
            mode="decrypt"
          />
          <PreviewPanel
            fileContent={generateFileContentForPreview(fileContentJson)}
          />
        </Box>
      )}

      <AddMasterKey
        masterKey={masterKey}
        setMasterKey={(key) => {
          resetState();
          state.setMasterKey(key);
          setStatusbar(
            false,
            `${masterKey ? "Master key updated successfully" : "Master key added successfully"}`,
            true
          );
        }}
        openMasterKeyDialog={openMasterKeyDialog}
        setOpenMasterKeyDialog={state.setOpenMasterKeyDialog}
        setStatusBar={setStatusbar}
      />

      <DecryptSecret
        openPopup={isDecryptingSecret}
        setOpenPopup={setIsDecryptingSecret}
        algorithm={passwordManagerConfig.algorithm}
        masterKey={masterKey}
        keyName={currentKey}
        encryptedSecret={currentEncryptedSecret}
      />

      <StatusBar
        isError={isError}
        message={message}
        openStatusbar={openStatusbar}
        setOpenStatusbar={state.setOpenStatusbar}
      />

      <MessageDialog
        open={dialogOpen}
        onClose={(_, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            state.setDialogOpen(false);
          }
        }}
        title={dialogTitle}
        message={dialogMessage}
        node={
          <Button
            variant={masterKey ? "outlined" : "contained"}
            color="primary"
            startIcon={<VpnKeyOutlined />}
            size="small"
            onClick={() => {
              state.setDialogOpen(false);
              state.setOpenMasterKeyDialog(true);
            }}
            disableElevation
          >
            Add Master Key
          </Button>
        }
      />

      <LoadingOverlay open={backDrop} />
    </BaseLayout>
  );
};

export default CredentialDecryptor;