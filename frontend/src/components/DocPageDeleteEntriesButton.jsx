import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function DeleteEntriesButton({ onRefetch, selectedRows }) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleDeleteSelectedRows = async () => {
    try {
      // Send the delete request to your API
      const response = await axios.delete(`${BACKEND_URL}/delete-entries`, {
        data: { ids: selectedRows }, // Send selected row ids to the backend
      });

      if (response.status === 200) {
        console.log(`Successfully deleted ${selectedRows.length} row(s)`);
        setOpenDeleteDialog(false);
        onRefetch();
      }
    } catch (error) {
      console.error("Error deleting rows:", error);

      // Optionally, show an error message (use your Snackbar or Alert here)
    }
  };

  const handleButtonPress = () => {
    setOpenDeleteDialog(true); // Open the dialog on button press
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "right", marginTop: 2 }}>
      <Button
        variant="contained"
        onClick={handleButtonPress} // Directly call the function
        startIcon={<DeleteIcon />}
        sx={{
          backgroundColor: "red",
          "&:hover": { backgroundColor: "darkred" },
          padding: "5px 10px",
          fontSize: "16px",
        }}
      >
        Delete Selected
      </Button>

      {/* Dialog to confirm deletion */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the selected
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteSelectedRows} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DeleteEntriesButton;
