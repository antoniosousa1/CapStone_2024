// pages/DocumentsPage.jsx
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Alert, AlertTitle, Snackbar, CircularProgress } from "@mui/material";
import PurgeDB from "../components/DocPagePurgeDB";
import DataGrid from "../components/DocPageDataGrid";
import SearchField from "../components/DocPageSearchField";
import UploadDocsButton from "../components/DocPageUploadDocsButton";
import DeleteEntriesButton from "../components/DocPageDeleteEntriesButton";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const DocumentsPage = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    title: "",
    message: "",
    severity: "success",
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [openPurgeDialog, setOpenPurgeDialog] = useState(false);
  const [refetchSignal, setRefetchSignal] = useState(0);

  // Fetch rows on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/list-files`);
        setRows(res.data.files); // Set full rows from API response
        setFilteredRows(res.data.files); // Set filtered rows initially to all rows
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, [refetchSignal]); // Fetch new data when refetchSignal changes

  const handleRowSelection = (rows) => {
    setSelectedRows(rows);
  };

  const triggerRefetch = () => setRefetchSignal((prev) => prev + 1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "99.5%" }}>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          marginBottom: "10px",
          marginTop: "0%",
          justifyContent: "space-around",
        }}
      >
        <UploadDocsButton onRefetch={triggerRefetch} />
        <SearchField
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Button
          variant="contained"
          startIcon={<DeleteForeverIcon />}
          sx={{
            backgroundColor: "darkred",
            "&:hover": { backgroundColor: "red" },
          }}
          disabled={!rows.length}
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
      />
      <DeleteEntriesButton
        onRefetch={triggerRefetch}
        selectedRows={selectedRows}
      />

      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
      >
        <Alert severity={alertInfo.severity}>
          <AlertTitle>{alertInfo.title}</AlertTitle>
          {alertInfo.message}
        </Alert>
      </Snackbar>

      {loading && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: 20,
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress sx={{ marginRight: 2 }} />
          <span>Uploading File(s)...</span>
        </Box>
      )}

      <PurgeDB
        onRefetch={triggerRefetch}
        open={openPurgeDialog}
        onClose={() => setOpenPurgeDialog(false)}
        setRows={setRows}
        setAlertInfo={setAlertInfo}
      />
    </Box>
  );
};

export default DocumentsPage;
