import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import { Alert, AlertTitle, Snackbar, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import UploadDocsButton from './UploadDocsButton';

// Define columns for the DataGrid.
const columns = [
  { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'documentName', headerName: 'Document Name', flex: 2 },
  { field: 'fileType', headerName: 'File Type', flex: 1 },
  { field: 'fileSize', headerName: 'File Size', flex: 1 },
  { field: 'uploadDate', headerName: 'Upload Date', flex: 1.5 },
  { field: 'lastModified', headerName: 'Last Modified', flex: 1.5 },
  { field: 'pageCount', headerName: 'Page Count', flex: 1 },
];

const DocumentsPage = () => {
  // State variables.
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: "", message: "", severity: "success" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPurgeDialog, setOpenPurgeDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // useEffect to load saved files from local storage on component mount.
  useEffect(() => {
    const savedFiles = JSON.parse(localStorage.getItem('documentFiles') || '[]');
    setRows(savedFiles);
    setFilteredRows(savedFiles);
    // API Call Needed Here to get data from backend instead of local storage
  }, []);

  // useEffect to filter rows based on search query.
  useEffect(() => {
    const filtered = rows.filter(row =>
      row.documentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRows(filtered);
  }, [searchQuery, rows]);

  // Function to open the purge database confirmation dialog.
  const handlePurgeDatabase = () => {
    setOpenPurgeDialog(true);
  };

  // Function to confirm and purge the database.
  const confirmPurgeDatabase = () => {
    setRows([]);
    localStorage.setItem('documentFiles', JSON.stringify([]));
    setAlertInfo({ title: "Success", message: "Database Collection Purged Successfully!", severity: "success" });
    setOpen(true);
    setOpenPurgeDialog(false);
    // API Call needed here to send a purge request to the backend.
  };

  // Function to delete selected rows.
  const handleDeleteSelectedRows = () => {
    const newRows = rows.filter(row => !selectedRows.includes(row.id));
    setRows(newRows);
    localStorage.setItem('documentFiles', JSON.stringify(newRows));
    setSelectedRows([]);
    setOpenDeleteDialog(false);
    setAlertInfo({ title: "Success", message: `${selectedRows.length === 1 ? 'File' : 'Files'} deleted successfully`, severity: "success" });
    setOpen(true);
    // API Call needed here to send the delete request to the backend.
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '99%' }}>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: '10px', marginTop: '0%', justifyContent: 'space-around' }}>
        <UploadDocsButton/>
        <TextField
          label="Search Documents"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon />,
          }}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<DeleteForeverIcon />}
          sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
          disabled={!rows.length}
          onClick={handlePurgeDatabase}
        >
          Purge Database Collection
        </Button>
      </Box>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        checkboxSelection
        onRowSelectionModelChange={(selection) => setSelectedRows(selection)}
        autoHeight
        sx={{ flexGrow: 1 }}
      />

      {selectedRows.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: 2 }}>
          <Button
            variant="contained"
            onClick={() => setOpenDeleteDialog(true)}
            startIcon={<DeleteIcon />}
            sx={{
              backgroundColor: 'red',
              '&:hover': { backgroundColor: 'darkred' },
              padding: '5px 10px',
              fontSize: '16px',
            }}
          >
            Delete Selected {selectedRows.length === 1 ? 'File' : 'Files'}
          </Button>
        </Box>
      )}

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete the selected {selectedRows.length === 1 ? 'file' : 'files'}?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteSelectedRows} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPurgeDialog} onClose={() => setOpenPurgeDialog(false)}>
        <DialogTitle>Confirm Purge Database Collection</DialogTitle>
        <DialogContent>Are you sure you want to purge the entire database collection?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPurgeDialog(false)}>Cancel</Button>
          <Button onClick={confirmPurgeDatabase} color="error">Purge</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
        <Alert severity={alertInfo.severity}>
          <AlertTitle>{alertInfo.title}</AlertTitle>
          {alertInfo.message}
        </Alert>
      </Snackbar>

      {loading && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress sx={{ marginRight: 2 }} />
          <span>Uploading File(s)...</span>
        </Box>
      )}
    </Box>
  );
};

export default DocumentsPage;