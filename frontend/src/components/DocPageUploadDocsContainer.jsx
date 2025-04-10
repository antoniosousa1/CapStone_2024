import React, { useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import FileUploadTrigger from "./DocPageFileUploadTrigger";
import FileUploadProgress from "./DocPageFileUploadProgress";
import FileUploadSuccessSnackbar from "./DocPageFileUploadSuccessSnackbar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function UploadDocsContainer({ onRefetch }) {
  const [loading, setLoading] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [uploadedFileCount, setUploadedFileCount] = useState(0);

  const handleCloseSuccessSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessSnackbarOpen(false);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessSnackbarOpen(false);
    setUploadedFileCount(0);

    const formData = new FormData();
    const files = e.target.files;
    const fileCount = files ? files.length : 0;

    if (files) {
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(`Upload successful: ${response.data}`);
      setUploadedFileCount(fileCount);
      setSuccessSnackbarOpen(true);
      onRefetch();
    } catch (error) {
      console.error(`Error during upload: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <FileUploadTrigger loading={loading} onFileUpload={handleFileUpload} />
      <FileUploadProgress loading={loading} />
      <FileUploadSuccessSnackbar
        open={successSnackbarOpen}
        onClose={handleCloseSuccessSnackbar}
        uploadedFileCount={uploadedFileCount}
      />
    </Box>
  );
}

export default UploadDocsContainer;
