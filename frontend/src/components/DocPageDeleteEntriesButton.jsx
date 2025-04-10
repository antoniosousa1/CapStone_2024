import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function DeleteEntriesButton({ onRefetch, selectedRows }) {
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

  const handleButtonPress = () => {
    setOpenDeleteDialog(true);
  };

  const successMessage =
    deletedFileCount === 1
      ? "File Deleted Successfully!"
      : "Files Deleted Successfully!";

  return (
    <Box sx={{ display: "flex", justifyContent: "right", marginTop: 2 }}>
      {isVisible && (
        <Button
          variant="contained"
          onClick={handleButtonPress}
          startIcon={<DeleteIcon />}
          sx={{
            backgroundColor: "darkred",
            "&:hover": { backgroundColor: "red" },
            padding: "5px 10px",
            fontSize: "16px",
          }}
        >
          {deleteButtonText}
        </Button>
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>{deleteConfirmationText}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteSelectedRows} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSuccessSnackbar}
          severity="success"
          sx={{
            width: "100%",
            backgroundColor: (theme) => theme.palette.success.dark,
            color: (theme) => theme.palette.success.contrastText,
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DeleteEntriesButton;
