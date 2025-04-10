// UploadDocsButton.jsx
import React, { useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import FileUploadButton from "./DocPageFileUploadButton";
import FileUploadProgress from "./DocPageFileUploadProgress"; // Import FileUploadProgress

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function UploadDocsContainer({ onRefetch }) {
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState({
    severity: "success",
    message: "",
  });

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnackbarOpen(false);

    const formData = new FormData();
    const files = e.target.files;

    if (files) {
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { uploaded = [], skipped = {} } = response.data[0];
      const skippedEntries = Object.entries(skipped); // [ [uploadedFile, matchedFile], ...]
      if (uploaded.length && skippedEntries.length) {
        const message = [
          `✅ Uploaded: ${uploaded.join(", ")}`,
          `⚠️ Skipped duplicates:\n${skippedEntries.map(([newFile, originalFile]) => `• ${newFile} (duplicate of ${originalFile})`).join("\n")}`,
        ].join("\n\n");

        setSnackbarContent({ severity: "warning", message });
      } else if (uploaded.length) {
        setSnackbarContent({
          severity: "success",
          message: `✅ Uploaded: ${uploaded.join(", ")}`,
        });
      } else if (skippedEntries.length) {
        const plural = skippedEntries.length > 1 ? "files were" : "file was";
        const message = [
          `❌ ${skippedEntries.length} ${plural} not uploaded (duplicates):`,
          skippedEntries
            .map(
              ([newFile, originalFile]) =>
                `• ${newFile} (matches ${originalFile})`
            )
            .join("\n"),
        ].join("\n\n");

        setSnackbarContent({ severity: "error", message });
      }

      setSnackbarOpen(true);
      onRefetch();
    } catch (error) {
      console.error(`Upload failed: ${error.message}`);
      setSnackbarContent({
        severity: "error",
        message: "Upload failed. Please try again.",
      });
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }

    // Reset the input to allow re-uploading the same file
    e.target.value = null;
  };

  return (
    <Box>
      <FileUploadButton loading={loading} onFileUpload={handleFileUpload} />

      {loading && (
        <FileUploadProgress
          loading={loading}
          onCancel={() => {
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
