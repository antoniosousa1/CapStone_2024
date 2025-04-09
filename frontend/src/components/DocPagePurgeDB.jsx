import React, { useState } from "react";
import { Button } from "@mui/material";
import ConfirmationDialog from "./PurgeDBConfirmationDialog";
import LoadingSnackbar from "./PurgeDBLoadingSnackbar";
import SuccessSnackbar from "./PurgeDBSuccessSnackbar";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const PurgeDB = ({ onRefetch, open, onClose, setAlertInfo, setRows }) => {
  const [loading, setLoading] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

  const handleCloseSuccessSnackbar = (event, reason) => {
    if (reason === "clickaway") {
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
        localStorage.setItem("documentFiles", JSON.stringify([]));
        setSuccessSnackbarOpen(true);
        onRefetch();
      } else {
        throw new Error("Failed to purge database");
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
      <ConfirmationDialog
        open={open}
        onClose={onClose}
        title="Confirm Purge Database Collection"
        content="Are you sure you want to purge your entire database collection?"
        onConfirm={confirmPurgeDatabase}
        confirmText="Purge"
        confirmColor="error"
        loading={loading} 
      />

      <LoadingSnackbar open={loading} message="Purging database..." />

      <SuccessSnackbar
        open={successSnackbarOpen}
        onClose={handleCloseSuccessSnackbar}
        message="Collection Purged successfully!"
      />
    </>
  );
};

export default PurgeDB;