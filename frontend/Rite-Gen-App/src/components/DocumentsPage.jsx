import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, AlertTitle } from '@mui/material';
import { Snackbar } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth'; 
import JSZip from 'jszip'; // Import JSZip to process PPTX files

const allowedFileTypes = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "text/plain": "TXT"
};

// Format file size (KB/MB)
const formatFileSize = (sizeInBytes) => {
  if (!sizeInBytes || isNaN(sizeInBytes)) return "Unknown Size";
  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  }
  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Extract slide count for PPTX
const getPptxSlideCount = async (file) => {
  const zip = new JSZip();
  const content = await zip.loadAsync(file);
  const slidesFolder = Object.keys(content.files).filter(name => name.startsWith("ppt/slides/") && name.endsWith(".xml"));
  return slidesFolder.length;
};

// Columns for DataGrid (displaying file info)
const columns = [
  { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'documentName', headerName: 'Document Name', flex: 2 },
  { field: 'fileType', headerName: 'File Type', flex: 1 },
  { field: 'fileSize', headerName: 'File Size', flex: 1 },
  { field: 'uploadDate', headerName: 'Upload Date', flex: 1.5 },
  { field: 'lastModified', headerName: 'Last Modified', flex: 1.5 },
  { field: 'pageCount', headerName: 'Page Count', flex: 1 },
];

const DocumentsPage = () => {
  // State to manage documents
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: "", message: "", severity: "success" });

  // Load documents metadata from localStorage on component mount
  useEffect(() => {
    const savedFiles = JSON.parse(localStorage.getItem('documentFiles') || '[]');
    setRows(savedFiles);
  }, []);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = allowedFileTypes[file.type];
    if (!fileType) {
      setAlertInfo({ title: "Error", message: "Invalid file type!", severity: "error" });
      setOpen(true);
      return;
    }

    // Metadata for the new document
    const newDocument = {
      id: rows.length + 1,
      documentName: file.name,
      fileType,
      fileSize: formatFileSize(file.size),
      uploadDate: new Date().toLocaleDateString(),
      lastModified: new Date().toLocaleDateString(),
      pageCount: 1, // Default to 1, will update based on file type
    };

    // Process PDF
    if (fileType === "PDF") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        newDocument.pageCount = pdfDoc.getPages().length;
        setRows((prevRows) => [...prevRows, newDocument]);
        localStorage.setItem('documentFiles', JSON.stringify([...rows, newDocument])); // Save to localStorage
      };
      reader.readAsArrayBuffer(file);
    } 
    // Process TXT
    else if (fileType === "TXT") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        newDocument.pageCount = Math.ceil(text.length / 2000) || 1;
        setRows((prevRows) => [...prevRows, newDocument]);
        localStorage.setItem('documentFiles', JSON.stringify([...rows, newDocument])); // Save to localStorage
      };
      reader.readAsText(file);
    } 
    // Process DOCX
    else if (fileType === "DOCX") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const extractedText = await mammoth.extractRawText({ arrayBuffer });
        newDocument.pageCount = Math.ceil(extractedText.value.length / 2000) || 1;
        setRows((prevRows) => [...prevRows, newDocument]);
        localStorage.setItem('documentFiles', JSON.stringify([...rows, newDocument])); // Save to localStorage
      };
      reader.readAsArrayBuffer(file);
    } 
    // Process PPTX
    else if (fileType === "PPTX") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const slideCount = await getPptxSlideCount(arrayBuffer);
        newDocument.pageCount = slideCount;
        setRows((prevRows) => [...prevRows, newDocument]);
        localStorage.setItem('documentFiles', JSON.stringify([...rows, newDocument])); // Save to localStorage
      };
      reader.readAsArrayBuffer(file);
    } 
    else {
      setRows((prevRows) => [...prevRows, newDocument]);
      localStorage.setItem('documentFiles', JSON.stringify([...rows, newDocument])); // Save to localStorage
    }

    setAlertInfo({ title: "Success", message: `File "${file.name}" uploaded successfully!`, severity: "success" });
    setOpen(true);
  };

  // Handle delete action
  const handleDeleteSelectedRows = () => {
    if (selectedRows.length > 0) {
      // Filter out the selected rows to delete
      const newRows = rows.filter(row => !selectedRows.includes(row.id));
      
      // Update state and localStorage after deletion
      setRows(newRows);
      localStorage.setItem('documentFiles', JSON.stringify(newRows)); // Save the updated list to localStorage

      setSelectedRows([]);
      setIsDeleteButtonVisible(false);
      setAlertInfo({ title: "Success", message: "Files deleted successfully", severity: "success" });
      setOpen(true);
    }
  };

  // Handle row selection changes
  const handleRowSelectionModelChange = (newSelectedRows) => {
    setSelectedRows(newSelectedRows);
    setIsDeleteButtonVisible(newSelectedRows.length > 0);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '99%' }}>
      {/* File upload button */}
      <Box sx={{ marginBottom: '16px' }}>
        <Button variant="contained" component="label" startIcon={<FileUploadIcon />}
          sx={{ backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#1565c0' } }}>
          Upload Document
          <input type="file" hidden accept={Object.keys(allowedFileTypes).join(",")} onChange={handleFileUpload} />
        </Button>
      </Box>

      {/* DataGrid displaying the documents */}
      <DataGrid rows={rows} columns={columns} checkboxSelection onRowSelectionModelChange={handleRowSelectionModelChange}
        rowSelectionModel={selectedRows} disableRowSelectionOnClick autoHeight sx={{ flexGrow: 1 }} />

      {/* Delete button for selected rows */}
      {isDeleteButtonVisible && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button variant="contained" onClick={handleDeleteSelectedRows} startIcon={<DeleteIcon />}
            sx={{ backgroundColor: '#d32f2f', color: '#fff', '&:hover': { backgroundColor: '#b22a2a' } }}>
            Delete Selected Files
          </Button>
        </Box>
      )}

      {/* Snackbar for showing alerts */}
      <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity={alertInfo.severity} sx={{ width: '100%' }}>
          <AlertTitle>{alertInfo.title}</AlertTitle>{alertInfo.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsPage;
