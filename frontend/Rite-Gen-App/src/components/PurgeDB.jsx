// components/PurgeDB.jsx
import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Snackbar, Alert, AlertTitle } from '@mui/material';

const PurgeDB = ({ open, onClose, setAlertInfo, setRows }) => {
  const [loading, setLoading] = useState(false);

  // Function to confirm and purge the database.
  const confirmPurgeDatabase = () => {
    setLoading(true);
    // Simulate purging process, e.g., clearing local storage and rows.
    setRows([]); // Clear the local rows
    localStorage.setItem('documentFiles', JSON.stringify([])); // Purge the local storage

    setAlertInfo({
      title: "Success",
      message: "Database Collection Purged Successfully!",
      severity: "success",
    });

    setLoading(false);
    onClose(); // Close the dialog
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

      <Snackbar open={loading} autoHideDuration={5000}>
        <Alert severity="info">
          <AlertTitle>Purging</AlertTitle>
          Please wait while the database is being purged.
        </Alert>
      </Snackbar>
    </>
  );
};

export default PurgeDB;