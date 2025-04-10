import React from "react";
import { Snackbar, Alert } from "@mui/material";

const SuccessSnackbar = ({
  open,
  onClose,
  message = "Success!",
  autoHideDuration = 3000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessSnackbar;
