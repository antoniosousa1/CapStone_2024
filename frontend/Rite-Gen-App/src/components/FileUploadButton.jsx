// components/FileUploadButton.jsx
import React from 'react';
import Button from '@mui/material/Button';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { allowedFileTypes } from './FileHandling';

const FileUploadButton = ({ loading, handleFileUpload }) => {
  return (
    <Button
      variant="contained"
      component="label"
      startIcon={<FileUploadIcon />}
      disabled={loading}
      sx={{ backgroundColor: loading ? 'gray' : undefined }}
    >
      Upload & Process Documents
      <input type="file" hidden accept={Object.keys(allowedFileTypes).join(',')} onChange={handleFileUpload} multiple />
    </Button>
  );
};

export default FileUploadButton;