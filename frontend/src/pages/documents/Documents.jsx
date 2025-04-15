{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import React, { useState, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Alert, AlertTitle, Snackbar } from "@mui/material";
import PurgeDB from "./components/PurgeDB";
import DataGrid from "./components/DocumentDataGrid";
import UploadDocsContainer from "./components/UploadDocsContainer";
import DeleteEntriesButton from "./components/DeleteEntriesButton";
import useFileUploadProgress from "../../hooks/useFileUploadProgress";
import useFetchDocuments from "../../hooks/useFetchDocuments";
import useDocumentRowSelection from "../../hooks/useDocumentRowSelection";
import DeleteEntriesSnackbar from "./components/DeleteEntriesSnackbar"; // It's a component
import FileUploadProgress from "./components/FileUploadProgress";

const DocumentsPage = ({ cancelToken, onCancelUpload }) => {
  const [openPurgeDialog, setOpenPurgeDialog] = useState(false);
  const [refetchSignal, setRefetchSignal] = useState(0);
  const {
    rows,
    loading: fetchLoading,
    error: fetchError,
    setRows,
  } = useFetchDocuments(refetchSignal);
  const { selectedRows, handleRowSelection } = useDocumentRowSelection();
  const { uploading, handleFileUploadStart, handleFileUploadEnd } =
    useFileUploadProgress();
  const [uploadMessage, setUploadMessage] = useState(null);
  const [deleteSuccessSnackbarOpen, setDeleteSuccessSnackbarOpen] =
    useState(false);
  const [deletedCount, setDeletedCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // For general messages
  const [alertInfo, setAlertInfo] = useState({
    title: "",
    message: null, // Allow message to be a string or an array
    severity: "success",
  });

  const triggerRefetch = () => setRefetchSignal((prev) => prev + 1);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const showSnackbar = useCallback((severity, title, message) => {
    setAlertInfo({ severity, title, message });
    setSnackbarOpen(true);
  }, []);

  useEffect(() => {
    if (uploadMessage) {
      showSnackbar(
        uploadMessage.severity,
        uploadMessage.title || "Upload Status",
        uploadMessage.message
      );
      setUploadMessage(null);
    }
  }, [uploadMessage, showSnackbar]);

  const handleUploadResult = useCallback(
    (result) => {
      console.log("handleUploadResult CALLED with:", result);
      setUploadMessage(result);
    },
    [setUploadMessage]
  );

  const handleShowDeleteSnackbar = (count) => {
    setDeletedCount(count);
    setDeleteSuccessSnackbarOpen(true);
  };

  const handleCloseDeleteSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setDeleteSuccessSnackbarOpen(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "99%", p: 1}}>
      <Box
        sx={{
          display: "flex",
          marginBottom: "10px",
          marginTop: "0%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <UploadDocsContainer
          onRefetch={triggerRefetch}
          onUploadStart={handleFileUploadStart}
          onUploadEnd={handleFileUploadEnd}
          cancelToken={cancelToken}
          setUploadResult={handleUploadResult}
        />
        <Button
          variant="contained"
          startIcon={<DeleteForeverIcon />}
          sx={{
            backgroundColor: "darkred",
            "&:hover": { backgroundColor: "red" },
          }}
          disabled={fetchLoading || !rows.length || uploading}
          onClick={() => setOpenPurgeDialog(true)}
        >
          Purge Database Collection
        </Button>
      </Box>
      <DataGrid
        refetchSignal={refetchSignal}
        handleRowSelection={handleRowSelection}
        rows={rows}
        selectedRows={selectedRows}
        loading={fetchLoading}
        error={fetchError}
      />
      <DeleteEntriesButton
        onRefetch={triggerRefetch}
        selectedRows={selectedRows}
        onDeleteSuccess={handleShowDeleteSnackbar}
      />
      {uploading && (
        <FileUploadProgress onCancel={onCancelUpload} loading={uploading} />
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={null}
        onClose={handleCloseSnackbar}
      >
        <Alert
          severity={alertInfo.severity}
          onClose={handleCloseSnackbar}
          sx={{
            width: "100%",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          <AlertTitle>{alertInfo.title}</AlertTitle>
          {Array.isArray(alertInfo.message)
            ? alertInfo.message.map((item, index) => (
                <div key={index}>{item}</div>
              ))
            : alertInfo.message}
        </Alert>
      </Snackbar>
      <DeleteEntriesSnackbar
        open={deleteSuccessSnackbarOpen}
        onClose={handleCloseDeleteSnackbar}
        deletedFileCount={deletedCount}
      />
      <PurgeDB
        onRefetch={triggerRefetch}
        open={openPurgeDialog}
        onClose={() => setOpenPurgeDialog(false)}
        setRows={setRows}
        setAlertInfo={showSnackbar}
      />
    </Box>
  );
};

export default DocumentsPage;
