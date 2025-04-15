{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import { useState } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const usePurgeDatabase = ({ onRefetch, setRows, setAlertInfo, onClose }) => {
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

  return {
    loading,
    successSnackbarOpen,
    handleCloseSuccessSnackbar,
    confirmPurgeDatabase,
  };
};

export default usePurgeDatabase;
