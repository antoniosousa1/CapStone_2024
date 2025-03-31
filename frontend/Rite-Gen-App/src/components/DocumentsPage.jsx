import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, AlertTitle } from '@mui/material';
import { Snackbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { PDFDocument } from 'pdf-lib'; // To extract page count from PDFs

// Define the columns for the documents table
const columns = [
  { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'documentName', headerName: 'Document Name', flex: 2, editable: false },
  { field: 'fileType', headerName: 'File Type', flex: 1, editable: false },
  { field: 'fileSize', headerName: 'File Size', flex: 1, editable: false, valueFormatter: (params) => `${(params.value / 1024).toFixed(2)} KB` },
  { field: 'uploadDate', headerName: 'Upload Date', type: 'date', flex: 1.5, editable: false },
  { field: 'lastModified', headerName: 'Last Modified', type: 'date', flex: 1.5, editable: false },
  { field: 'pageCount', headerName: 'Page Count', flex: 1, editable: false },
];

const DocumentsPage = () => {
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [alertInfo, setAlertInfo] = useState({
    title: "",
    message: "",
    severity: "success",
  });
  const [deleteButtonText, setDeleteButtonText] = useState("Delete Selected Files");
  const theme = useTheme();

  // Helper function to get file type display
  const getFileType = (fileType) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word')) return 'DOCX';
    if (fileType.includes('msword')) return 'DOC';
    if (fileType.includes('presentation')) return 'PPTX';
    if (fileType.includes('plain')) return 'TXT';
    return 'Unknown';
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = getFileType(file.type);
      const newDocument = {
        id: rows.length + 1, // Assign an ID based on current number of rows
        documentName: file.name,
        fileType: fileType,
        fileSize: file.size,
        uploadDate: new Date(),
        lastModified: new Date(),
        pageCount: 0, // Set pageCount to 0 initially
      };

      // Read PDF files for page count
      if (fileType === 'PDF') {
        const reader = new FileReader();
        reader.onload = async function (e) {
          const arrayBuffer = e.target.result;
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pageCount = pdfDoc.getPages().length; // Accurate page count from the PDF
          newDocument.pageCount = pageCount;
          setRows((prevRows) => [...prevRows, newDocument]);
        };
        reader.readAsArrayBuffer(file);
      } 
      // Handle other file types like TXT, DOCX, and PPTX
      else if (fileType === 'TXT') {
        // Read TXT files
        const reader = new FileReader();
        reader.onload = function (e) {
          const text = e.target.result;
          const pageCount = text.split("\n").length; // Simple page count logic for TXT files (lines as pages)
          newDocument.pageCount = pageCount;
          setRows((prevRows) => [...prevRows, newDocument]);
        };
        reader.readAsText(file);
      } 
      else {
        // For DOCX, DOC, and PPTX, we can assume 1 page for simplicity (or improve with parsing libraries)
        newDocument.pageCount = 1; // You could add libraries to count pages for DOCX/PPTX here if needed
        setRows((prevRows) => [...prevRows, newDocument]);
      }

      setAlertInfo({
        title: "Success",
        message: `File "${file.name}" uploaded successfully!`,
        severity: "success",
      });
      setOpen(true);
    }
  };

  const handleDeleteRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    setAlertInfo({
      title: "Success",
      message: "File deleted successfully",
      severity: "success",
    });
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleDeleteSelectedRows = () => {
    if (selectedRows.length > 0) {
      const numSelected = selectedRows.length;
      setRows(prevRows => prevRows.filter(row => !selectedRows.includes(row.id)));
      setSelectedRows([]);
      setIsDeleteButtonVisible(false);
      const message = numSelected === 1 ? "File deleted successfully" : "Files deleted successfully";
      setAlertInfo({
        title: "Success",
        message: message,
        severity: "success",
      });
      setOpen(true);
    }
  };

  const handleRowSelectionModelChange = (newSelectedRows) => {
    setSelectedRows(newSelectedRows);
    setIsDeleteButtonVisible(newSelectedRows.length > 0);
    setDeleteButtonText(
      newSelectedRows.length === 1 ? "Delete Selected File" : "Delete Selected Files"
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '99%' }}>
      <Box sx={{ marginBottom: '16px' }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<FileUploadIcon />}
          sx={{ backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#1565c0' } }}
        >
          Upload Document
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        checkboxSelection
        onRowSelectionModelChange={handleRowSelectionModelChange}
        rowSelectionModel={selectedRows}
        disableRowSelectionOnClick
        autoHeight
        sx={{ flexGrow: 1 }}
      />
      
      {isDeleteButtonVisible && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button
            variant="contained"
            onClick={handleDeleteSelectedRows}
            startIcon={<DeleteIcon />}
            sx={{ backgroundColor: '#d32f2f', color: '#fff', '&:hover': { backgroundColor: '#b22a2a' } }}
          >
            {deleteButtonText}
          </Button>
        </Box>
      )}

      <Snackbar
        open={open}
        autoHideDuration={5000} // Set the duration to 5 seconds (5000ms)
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={alertInfo.severity}
          sx={{
            width: '100%',
            backgroundColor: theme.palette.success.main,
            color: theme.palette.success.contrastText,
            '& .MuiAlert-icon': {
              color: theme.palette.success.contrastText,
            },
          }}
        >
          <AlertTitle>{alertInfo.title}</AlertTitle>
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsPage;
