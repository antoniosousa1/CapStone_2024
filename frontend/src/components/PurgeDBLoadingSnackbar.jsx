import React from "react";
import { Snackbar, Alert, AlertTitle } from "@mui/material";

const LoadingSnackbar = ({ open, message = "Please wait..." }) => {
  return (
    <Snackbar open={open} autoHideDuration={null}>
      <Alert severity="info">
        <AlertTitle>Dropping, Please Wait!</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default LoadingSnackbar;
