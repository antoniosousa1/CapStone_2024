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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';

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
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: "", message: "", severity: "success" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); 

  // Load documents metadata from localStorage on component mount
  useEffect(() => {
    const savedFiles = JSON.parse(localStorage.getItem('documentFiles') || '[]');
    setRows(savedFiles);
  }, []);

  // Generate a new unique ID based on the rows length or reset if there are no files
  const generateFileId = () => {
    return rows.length === 0 ? 1 : Math.max(...rows.map(file => file.id)) + 1;
  };

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

    const newFileId = generateFileId(); // Ensure unique ID, or reset to 1 if no files

    const newDocument = {
      id: newFileId,
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
        setRows((prevRows) => {
          const updatedRows = [...prevRows, newDocument];
          localStorage.setItem('documentFiles', JSON.stringify(updatedRows)); // Save to localStorage
          return updatedRows;
        });
      };
      reader.readAsArrayBuffer(file);
    } 
    // Process TXT
    else if (fileType === "TXT") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        newDocument.pageCount = Math.ceil(text.length / 2000) || 1;
        setRows((prevRows) => {
          const updatedRows = [...prevRows, newDocument];
          localStorage.setItem('documentFiles', JSON.stringify(updatedRows)); // Save to localStorage
          return updatedRows;
        });
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
        setRows((prevRows) => {
          const updatedRows = [...prevRows, newDocument];
          localStorage.setItem('documentFiles', JSON.stringify(updatedRows)); // Save to localStorage
          return updatedRows;
        });
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
        setRows((prevRows) => {
          const updatedRows = [...prevRows, newDocument];
          localStorage.setItem('documentFiles', JSON.stringify(updatedRows)); // Save to localStorage
          return updatedRows;
        });
      };
      reader.readAsArrayBuffer(file);
    }

    setAlertInfo({ title: "Success", message: `File "${file.name}" uploaded successfully!`, severity: "success" });
    setOpen(true);
  };

  // Handle delete action
  const handleDeleteSelectedRows = () => {
    if (selectedRows.length > 0) {
      const newRows = rows.filter(row => !selectedRows.includes(row.id));
      setRows(newRows);

      // If all files are deleted, reset ID to 1
      if (newRows.length === 0) {
        localStorage.setItem('documentFiles', JSON.stringify([])); // Clear localStorage
      } else {
        localStorage.setItem('documentFiles', JSON.stringify(newRows)); // Save updated list to localStorage
      }

      setSelectedRows([]);
      setIsDeleteButtonVisible(false);
      setAlertInfo({ title: "Success", message: "Files deleted successfully", severity: "success" });
      setOpen(true);
      setOpenDeleteDialog(false); // Close dialog after deletion
    }
  };

  // Open the delete confirmation dialog
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
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

      {/* DataGrid displaying the uploaded documents */}
      <DataGrid rows={rows} columns={columns} checkboxSelection onRowSelectionModelChange={handleRowSelectionModelChange}
        rowSelectionModel={selectedRows} disableRowSelectionOnClick autoHeight sx={{ flexGrow: 1 }} />

      {/* Delete button for selected rows */}
      {isDeleteButtonVisible && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button variant="contained" onClick={handleDeleteClick} startIcon={<DeleteIcon />}>
            Delete Selected Files
          </Button>
        </Box>
      )}

      {/* Snackbar for alerts */}
      <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity={alertInfo.severity}>
          <AlertTitle>{alertInfo.title}</AlertTitle>
          {alertInfo.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the selected file(s)?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSelectedRows} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
