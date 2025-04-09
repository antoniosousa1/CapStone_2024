// components/LoadingSnackbar.jsx
import React from "react";
import { Snackbar, Alert, AlertTitle } from "@mui/material";

const LoadingSnackbar = ({ open, message = "Please wait..." }) => {
  return (
    <Snackbar open={open} autoHideDuration={null} /* Don't auto-hide loading */>
      <Alert severity="info">
        <AlertTitle>Loading</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default LoadingSnackbar;
