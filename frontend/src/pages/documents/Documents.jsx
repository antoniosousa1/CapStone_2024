{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Alert, AlertTitle, Snackbar } from "@mui/material";
import PurgeDB from "./components/PurgeDB";
import DataGrid from "./components/DocumentDataGrid";
import UploadDocsContainer from "./components/UploadDocsContainer";
import DeleteEntriesButton from "./components/DeleteEntriesButton";
import FileUploadProgress from "./components/FileUploadProgress";
import useFetchDocuments from "../../hooks/useFetchDocuments";
import useDocumentRowSelection from "../../hooks/useDocumentRowSelection";
import useSnackbar from "../../hooks/useSnackbar";

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
  const {
    open: snackbarOpen,
    alertInfo,
    handleCloseSnackbar,
    showSnackbar,
  } = useSnackbar();
  const { uploading, handleFileUploadStart, handleFileUploadEnd } =
    useFileUploadProgress();

  const triggerRefetch = () => setRefetchSignal((prev) => prev + 1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "99%" }}>
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
        showSnackbar={showSnackbar}
      />
      {uploading && (
        <FileUploadProgress onCancel={onCancelUpload} loading={uploading} />
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={alertInfo.severity}>
          <AlertTitle>{alertInfo.title}</AlertTitle>
          {alertInfo.message}
        </Alert>
      </Snackbar>
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
