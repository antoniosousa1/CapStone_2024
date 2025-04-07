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

function UploadDocsContainer() {
  const [loading, setLoading] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [uploadedFileCount, setUploadedFileCount] = useState(0);

  const handleCloseSuccessSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessSnackbarOpen(false);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessSnackbarOpen(false);
    setUploadedFileCount(0); // Reset count for new upload

    const formData = new FormData();
    const files = e.target.files;
    const fileCount = files ? files.length : 0;

    if (files) {
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
    }
    for (let [key, file] of formData.entries()) {
      console.log(`Field: ${key}, Filename: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(`Upload successful: ${response.data}`);
      setUploadedFileCount(fileCount); // Set the count based on the number of files selected
      setSuccessSnackbarOpen(true);
    } catch (error) {
      console.error(`Error during upload: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const successMessage = uploadedFileCount === 1
    ? 'File Uploaded Successfully!'
    : 'Files Uploaded Successfully!';

  return (
    <Box>
      <FileUploadButton loading={loading} onFileUpload={handleFileUpload} />
      {loading && (
        <FixedLoadingContainer>
          <CircularProgress size={40} />
          <Typography sx={{ ml: 1 }}>Currently Uploading Documents... </Typography>
        </FixedLoadingContainer>
      )}

      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSuccessSnackbar}
          severity="success"
          sx={{
            width: '100%',
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

export default UploadDocsContainer;