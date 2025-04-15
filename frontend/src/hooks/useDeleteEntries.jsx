{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function useDeleteEntries({ onRefetch, selectedRows }) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [deleteButtonText, setDeleteButtonText] = useState(
    "Delete Selected Files"
  );
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [deletedFileCount, setDeletedFileCount] = useState(0);

  useEffect(() => {
    setIsVisible(selectedRows && selectedRows.length > 0);

    if (selectedRows && selectedRows.length > 0) {
      const fileCount = selectedRows.length;
      setDeleteButtonText(
        `Delete Selected ${fileCount === 1 ? "File" : "Files"}`
      );
      setDeleteConfirmationText(
        `Are you sure you want to delete the selected ${
          fileCount === 1 ? "file" : "files"
        }?`
      );
    } else {
      setDeleteButtonText("Delete Selected Files");
      setDeleteConfirmationText("");
    }
  }, [selectedRows]);

  const handleDeleteSelectedRows = async () => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/delete-entries`, {
        data: { ids: selectedRows },
      });

      if (response.status === 200) {
        console.log(
          `Successfully deleted ${selectedRows.length} ${
            selectedRows.length === 1 ? "file" : "files"
          }`
        );
        setDeletedFileCount(selectedRows.length);
        setSuccessSnackbarOpen(true);
        setOpenDeleteDialog(false);
        onRefetch();
      }
    } catch (error) {
      console.error("Error deleting rows:", error);
    }
  };

  const handleCloseSuccessSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessSnackbarOpen(false);
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const successMessage =
    deletedFileCount === 1
      ? "File Deleted Successfully!"
      : "Files Deleted Successfully!";

  return {
    isVisible,
    deleteButtonText,
    deleteConfirmationText,
    successSnackbarOpen,
    openDeleteDialog,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDeleteSelectedRows,
    handleCloseSuccessSnackbar,
    successMessage,
  };
}

export default useDeleteEntries;
