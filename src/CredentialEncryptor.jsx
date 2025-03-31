import { useLayoutEffect, useEffect, useState } from "react";
import { Button, Stack, Box, Typography } from "@mui/material";
import {
  AddCircleOutline,
  LibraryAddOutlined,
  Lock,
} from "@mui/icons-material";

import { useAppState } from './hooks/useAppState';
import { useFileOperations } from './hooks/useFileOperations';
import { useHelpers } from './hooks/useHelpers';
import { BaseLayout } from './components/BaseLayout';
import { SecretsList } from './components/SecretsList';
import FileUpload from "./components/FileUpload";
import StatusBar from "./components/StatusBar";
import AddSecret from "./components/AddSecret";
import AddMasterKey from "./components/AddMasterKey";
import MessageDialog from "./components/MessageDialog";
import PreviewPanel from "./components/PreviewPanel";
import DownloadFile from "./components/DownloadFile";
import LoadingOverlay from "./components/LoadingOverlay";
import { generateFileHmac } from "./utils/FileUtils";
import passwordManagerConfig from "./config/PasswordManagerConfig";

const CredentialEncryptor = () => {
  const [isGenerateFile, setIsGenerateFile] = useState(false);
  const [addNewSecret, setAddNewSecret] = useState(false);
  
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
    setIsGenerateFile,
    setAddNewSecret
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
    if (
      isGenerateFile &&
      isEmptyObj(fileContentJson.secrets) &&
      !addNewSecret
    ) {
      const userConfirmed = window.confirm(
        "No secrets added. Do you want to reset the application state?"
      );
      if (userConfirmed) {
        resetState();
      } else {
        setAddNewSecret(true);
      }
    }
  }, [fileContentJson.secrets, isGenerateFile, addNewSecret, isEmptyObj, resetState]);

  useEffect(() => {
    if (!masterKey) {
      showDialog(
        "Master Key Required",
        "Please add your master key to proceed."
      );
    }
  }, []);

  const addToFileContentJsonSecretsSection = async (key, secret) => {
    const currentDate = new Date().toLocaleDateString("en-CA");
    const tempFileContentJson = {
      secrets: {...fileContentJson.secrets, [key]: secret },
      integrity: { ...fileContentJson.integrity, DATE: currentDate, HMAC: "" },
    };
    
    const tempFileContentStr = generateFileContentForPreview(tempFileContentJson);
    const newHmac = await generateFileHmac(
      tempFileContentStr.slice(0, tempFileContentStr.indexOf("HMAC: ")),
      masterKey
    );

    state.setFileContentJson({
      secrets:  {...fileContentJson.secrets, [key]: secret },
      integrity: { DATE: currentDate, HMAC: newHmac },
    });
  };

  const removeSecret = async (key) => {
    if (fileContentJson && Object.keys(fileContentJson.secrets).length === 1) {
      const userConfirmed = window.confirm(
        "This action will remove all secrets and reset application state. Do you want to proceed?"
      );
      if (userConfirmed) {
        resetState();
      }
    } else {
      const currentDate = new Date().toLocaleDateString("en-CA");
      const tempSecrets = { ...fileContentJson.secrets };
      delete tempSecrets[key];
      
      const tempFileContentJson = {
        secrets: tempSecrets,
        integrity: { ...fileContentJson.integrity, DATE: currentDate },
      };
      
      const tempFileContentStr = generateFileContentForPreview(tempFileContentJson);
      const newHmac = await generateFileHmac(
        tempFileContentStr.slice(0, tempFileContentStr.indexOf("HMAC: ")),
        masterKey
      );

      state.setFileContentJson({
        secrets: tempSecrets,
        integrity: { DATE: currentDate, HMAC: newHmac },
      });
    }
  };

  const headerActions = (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems="flex-start"
      justifyContent="flex-start"
      divider={!file && <Typography>- or -</Typography>}
    >
      {!isGenerateFile && (
        <FileUpload
          file={file}
          handleFileChange={fileOps.handleFileUpload}
          buttonVariant={file ? "outlined" : "contained"}
          reset={resetState}
          disabled={!masterKey}
          open={backDrop}
        />
      )}
      <Button
        variant="contained"
        color="primary"
        startIcon={file ? <AddCircleOutline /> : <LibraryAddOutlined />}
        component="div"
        size="small"
        onClick={file ? () => setAddNewSecret(true) : () => {
          if (!masterKey) {
            setStatusbar(true, "Master key not added. Please add your master key.", true);
            return;
          }
          setAddNewSecret(true);
          setIsGenerateFile(true);
        }}
        disabled={!masterKey}
      >
        {file || isGenerateFile ? "Add Secret" : "Generate New File"}
      </Button>
    </Stack>
  );

  const mainActions = (
    <>
      <Button
        variant={masterKey ? "outlined" : "contained"}
        color="primary"
        startIcon={<Lock />}
        size="small"
        onClick={() => state.setOpenMasterKeyDialog(true)}
      >
        {masterKey ? "Update Master Key" : "Add Master Key"}
      </Button>
      {fileContentJson && !isEmptyObj(fileContentJson.secrets) && (
        <DownloadFile
          content={generateFileContentForPreview(fileContentJson)}
        />
      )}
    </>
  );

  return (
    <BaseLayout
      masterKey={masterKey}
      unloadMasterKey={unloadMasterKey}
      headerActions={headerActions}
      mainActions={mainActions}
    >
      {console.log("fileContentJson", fileContentJson)}
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
            onRemoveSecret={removeSecret}
            mode="encrypt"
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

      <StatusBar
        isError={isError}
        message={message}
        openStatusbar={openStatusbar}
        setOpenStatusbar={state.setOpenStatusbar}
      />

      <AddSecret
        openPopup={addNewSecret}
        setOpenPopup={setAddNewSecret}
        algorithm={passwordManagerConfig.algorithm}
        masterKey={masterKey}
        addToSecretsList={addToFileContentJsonSecretsSection}
        existingSecrets={Object.keys(fileContentJson.secrets)}
      />

    {/* First dialog, when page loads to add master key  */}
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
            startIcon={<Lock />}
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

export default CredentialEncryptor;