import { useState } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import FileUploadIcon from '@mui/icons-material/FileUpload';


function UploadDocsButton() {
    const [loading, setLoading] = useState(false);
  
    const handleFileUpload = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      const formData = new FormData(); // Form data for sending to backend
  
      // Get selected files
      const files = e.target.files;
      if (files) {
        // Append files to FormData
        Array.from(files).forEach((file) => {
          formData.append('files', file); // 'files' is the field name for the backend
        });
      }
          // Print FormData contents
          for (let [key, file] of formData.entries()) {
            console.log(`Field: ${key}, Filename: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);
          }
  
      try {
        // Send files to backend
        const response = await axios.post("http://127.0.0.1:5005/add", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // If you need to process or show success feedback, you can log it
        console.log(`Upload successful: ${response.data}`);
      } catch (error) {
        console.error(`Error during upload: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

  return (
        <Button
          variant="contained"
          component="label"
          startIcon={<FileUploadIcon />}
          disabled={loading} // Disable the button while loading is true.
          sx={{ backgroundColor: loading ? 'gray' : undefined }} // Set button background to gray while loading.
        >
          Upload & Process Documents
          <input 
          type="file" 
          hidden 
          accept=".pdf,.doc,.docx,.pptx,.ppt,.csv"
          onChange={handleFileUpload} 
          multiple />
        </Button>
  );
}

export default UploadDocsButton;