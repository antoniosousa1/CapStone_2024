import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Snackbar, Alert, AlertTitle } from '@mui/material';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const PurgeDB = ({ open, onClose, setAlertInfo, setRows }) => {
  const [loading, setLoading] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

  const handleCloseSuccessSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessSnackbarOpen(false);
  };

  const confirmPurgeDatabase = async () => {
    setLoading(true);

    try {
      console.log("BACKEND_URL:", BACKEND_URL);
      const response = await axios.delete(`${BACKEND_URL}/clear-db-content`);

      if (response.status === 200) {
        setRows([]);
        localStorage.setItem('documentFiles', JSON.stringify([]));
        setSuccessSnackbarOpen(true); // Open the success Snackbar
      } else {
        throw new Error('Failed to purge database');
      }
    } catch (error) {
      console.error("Purge failed:", error);
      setAlertInfo({
        title: "Error",
        message: "Failed to purge database. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Confirm Purge Database Collection</DialogTitle>
        <DialogContent>Are you sure you want to purge the entire database collection?</DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={confirmPurgeDatabase} color="error" disabled={loading}>
            {loading ? 'Purging...' : 'Purge'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={loading} autoHideDuration={6000}>
        <Alert severity="info">
          <AlertTitle>Purging</AlertTitle>
          Please wait while the database is being purged.
        </Alert>
      </Snackbar>

      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSuccessSnackbar}
          severity="success"
          sx={{
            width: '100%',
            backgroundColor: (theme) => theme.palette.success.dark,
            color: (theme) => theme.palette.success.contrastText,
          }}
        >
          Collection Purged successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default PurgeDB;