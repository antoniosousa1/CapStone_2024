{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import useDeleteEntries from "../../../hooks/useDeleteEntries";

function DeleteEntriesButton({ onRefetch, selectedRows }) {
  const {
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
  } = useDeleteEntries({ onRefetch, selectedRows });

  return (
    <Box sx={{ display: "flex", justifyContent: "right", marginTop: 2 }}>
      {isVisible && (
        <Button
          variant="contained"
          onClick={handleOpenDeleteDialog}
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

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>{deleteConfirmationText}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
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
