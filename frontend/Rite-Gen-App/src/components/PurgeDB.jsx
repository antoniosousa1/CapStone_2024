import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Snackbar, Alert, AlertTitle } from '@mui/material';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const PurgeDB = ({ open, onClose, setAlertInfo, setRows }) => {
  const [loading, setLoading] = useState(false);

  // Function to confirm and purge the database via API call
  const confirmPurgeDatabase = async () => {
    setLoading(true);

    try {
      console.log("BACKEND_URL:", BACKEND_URL);
      const response = await axios.delete(`${BACKEND_URL}/clear-db-content`);

      // Check if the response is successful
      if (response.status === 200) {
        setRows([]); // Clear the local rows
        localStorage.setItem('documentFiles', JSON.stringify([])); // Purge the local storage

        setAlertInfo({
          title: "Success",
          message: "Database content cleared successfully!",
          severity: "success",
        });
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
      onClose(); // Close the dialog
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
