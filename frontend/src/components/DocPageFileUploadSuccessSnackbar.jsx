// components/FileUploadSuccessSnackbar.jsx
import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

function FileUploadSuccessSnackbar({ open, onClose, uploadedFileCount }) {
  const successMessage =
    uploadedFileCount === 1
      ? "File Uploaded Successfully!"
      : "Files Uploaded Successfully!";

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert
        onClose={onClose}
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
  );
}

export default FileUploadSuccessSnackbar;
