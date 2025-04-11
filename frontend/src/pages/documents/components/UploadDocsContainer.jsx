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
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import FileUploadButton from "./FileUploadButton";
import FileUploadProgress from "./FileUploadProgress";
import useFileUpload from "../../../hooks/useFileUpload"; // Import the hook

function UploadDocsContainer({ onRefetch }) {
  const {
    loading,
    snackbarOpen,
    snackbarContent,
    handleCloseSnackbar,
    handleFileUpload,
  } = useFileUpload({ onRefetch });

  return (
    <Box>
      <FileUploadButton loading={loading} onFileUpload={handleFileUpload} />

      {loading && (
        <FileUploadProgress
          loading={loading}
          onCancel={() => {
            // You might want to implement a cancel upload functionality in the hook
          }}
        />
      )}

      <Snackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarContent.severity}
          sx={{
            width: "100%",
            whiteSpace: "pre-line",
            backgroundColor: (theme) =>
              snackbarContent.severity === "success"
                ? theme.palette.success.dark
                : snackbarContent.severity === "warning"
                  ? theme.palette.warning.dark
                  : theme.palette.error.dark,
            color: (theme) => theme.palette.common.white,
          }}
        >
          {snackbarContent.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UploadDocsContainer;
