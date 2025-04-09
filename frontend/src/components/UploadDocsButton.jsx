// components/UploadDocsButton.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import FixedLoadingContainer from './FixedLoadingContainer';
import FileUploadButton from './FileUploadButton';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function UploadDocsContainer({ onRefetch }) {
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState({
    severity: 'success',
    message: ''
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
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
        formData.append('files', file);
      });
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { uploaded = [], skipped = [] } = response.data;

      if (uploaded.length && skipped.length) {
        setSnackbarContent({
          severity: 'warning',
          message: `✅ Uploaded: ${uploaded.join(', ')}\n⚠️ Skipped (duplicate): ${skipped.join(', ')}`
        });
      } else if (uploaded.length) {
        setSnackbarContent({
          severity: 'success',
          message: `✅ Uploaded: ${uploaded.join(', ')}`
        });
      } else {
        setSnackbarContent({
          severity: 'info',
          message: `⚠️ Duplicate file not uploaded: ${skipped.join(', ')}`
        });
      }

      setSnackbarOpen(true);
      onRefetch();
    } catch (error) {
      console.error(`Upload failed: ${error.message}`);
      setSnackbarContent({
        severity: 'error',
        message: 'Upload failed. Please try again.'
      });
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <FileUploadButton loading={loading} onFileUpload={handleFileUpload} />

      {loading && (
        <FixedLoadingContainer>
          <CircularProgress size={40} />
          <Typography sx={{ ml: 1 }}>Currently Uploading Documents...</Typography>
        </FixedLoadingContainer>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarContent.severity}
          sx={{
            width: '100%',
            whiteSpace: 'pre-line',
            backgroundColor: (theme) =>
              snackbarContent.severity === 'success'
                ? theme.palette.success.dark
                : snackbarContent.severity === 'warning'
                ? theme.palette.warning.dark
                : snackbarContent.severity === 'info'
                ? theme.palette.info.dark
                : theme.palette.error.dark,
            color: (theme) => theme.palette.common.white
          }}
        >
          {snackbarContent.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UploadDocsContainer;
