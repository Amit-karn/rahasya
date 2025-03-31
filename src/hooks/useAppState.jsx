import { useState } from 'react';

export const useAppState = () => {
  const [file, setFile] = useState(null);
  const [fileContentJson, setFileContentJson] = useState({
    secrets: {},
    integrity: {},
  });
  const [openStatusbar, setOpenStatusbar] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [openMasterKeyDialog, setOpenMasterKeyDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [backDrop, setBackDrop] = useState(false);

  return {
    file,
    setFile,
    fileContentJson,
    setFileContentJson,
    openStatusbar,
    setOpenStatusbar,
    isError,
    setIsError,
    message,
    setMessage,
    masterKey,
    setMasterKey,
    openMasterKeyDialog,
    setOpenMasterKeyDialog,
    dialogOpen,
    setDialogOpen,
    dialogTitle,
    setDialogTitle,
    dialogMessage,
    setDialogMessage,
    backDrop,
    setBackDrop
  };
};