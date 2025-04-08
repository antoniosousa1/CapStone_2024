// pages/DocumentsPage.jsx
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Alert, AlertTitle, Snackbar, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import PurgeDB from '../components/PurgeDB';
import DataGrid from '../components/DataGrid';
import HandleDeleteRows from '../components/HandleDeleteRows';
import SearchField from '../components/SearchField';
import UploadDocsButton from '../components/UploadDocsButton';

const DocumentsPage = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: '', message: '', severity: 'success' });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [openPurgeDialog, setOpenPurgeDialog] = useState(false);
  const [refetchSignal, setRefetchSignal] = useState(0);

  useEffect(() => {
    const savedFiles = JSON.parse(localStorage.getItem('documentFiles') || '[]');
    setRows(savedFiles);
    setFilteredRows(savedFiles);
  }, []);

  useEffect(() => {
    const filtered = rows.filter((row) => row.documentName.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredRows(filtered);
  }, [searchQuery, rows]);

  const handleDeleteSelectedRows = HandleDeleteRows({
    rows,
    setRows,
    selectedRows,
    setSelectedRows,
    setOpenDeleteDialog,
    setAlertInfo,
    setOpen,
  });

  // Update refetchSignal when an action is completed (add, delete, purge)
  const triggerRefetch = () => setRefetchSignal(prev => prev + 1);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '99%' }}>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: '10px', marginTop: '0%', justifyContent: 'space-around' }}>
        <UploadDocsButton onRefetch={triggerRefetch}/>
        <SearchField searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Button
          variant="contained"
          startIcon={<DeleteForeverIcon />}
          sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
          disabled={rows.length}
          onClick={() => setOpenPurgeDialog(true)}
        >
          Purge Database Collection
        </Button>
      </Box>

      <DataGrid refetchSignal={refetchSignal} rows={filteredRows}/>

      {selectedRows.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: 2 }}>
          <Button
            variant="contained"
            onClick={() => setOpenDeleteDialog(true)}
            startIcon={<DeleteIcon />}
            sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' }, padding: '5px 10px', fontSize: '16px' }}
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

      <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
        <Alert severity={alertInfo.severity}>
          <AlertTitle>{alertInfo.title}</AlertTitle>
          {alertInfo.message}
        </Alert>
      </Snackbar>

      {loading && (
        <Box sx={{ position: 'fixed', bottom: 20, left: 20, zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ marginRight: 2 }} />
          <span>Uploading File(s)...</span>
        </Box>
      )}

      <PurgeDB onRefetch={triggerRefetch} open={openPurgeDialog} onClose={() => setOpenPurgeDialog(false)} setRows={setRows} setAlertInfo={setAlertInfo} />
    </Box>
  );
};

export default DocumentsPage;