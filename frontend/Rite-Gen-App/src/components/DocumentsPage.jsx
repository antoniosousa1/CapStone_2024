import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import { Alert, AlertTitle, Snackbar, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import JSZip from 'jszip';

const allowedFileTypes = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "text/plain": "TXT",
  "text/csv": "CSV"
};

const formatFileSize = (sizeInBytes) => {
  return sizeInBytes < 1024 * 1024
    ? `${(sizeInBytes / 1024).toFixed(2)} KB`
    : `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getPptxSlideCount = async (file) => {
  const zip = new JSZip();
  const content = await zip.loadAsync(file);
  return Object.keys(content.files).filter(name => name.startsWith("ppt/slides/") && name.endsWith(".xml")).length;
};

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
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: "", message: "", severity: "success" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPurgeDialog, setOpenPurgeDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);  // New state to track loading status

  useEffect(() => {
    const savedFiles = JSON.parse(localStorage.getItem('documentFiles') || '[]');
    setRows(savedFiles);
    setFilteredRows(savedFiles);
  }, []);

  useEffect(() => {
    const filtered = rows.filter(row =>
      row.documentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRows(filtered);
  }, [searchQuery, rows]);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setLoading(true);  // Show the loading spinner when file upload starts

    const newDocuments = [];
    for (const file of files) {
      const fileType = allowedFileTypes[file.type];
      if (!fileType) continue;

      const newDocument = {
        id: rows.length + newDocuments.length + 1,
        documentName: file.name,
        fileType,
        fileSize: formatFileSize(file.size),
        uploadDate: new Date().toLocaleDateString(),
        lastModified: new Date().toLocaleDateString(),
        pageCount: 1,
      };

      try {
        if (fileType === "PDF") {
          const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
          newDocument.pageCount = pdfDoc.getPages().length;
        } else if (fileType === "TXT" || fileType === "CSV") {
          newDocument.pageCount = (await file.text()).split('\n').length;
        } else if (fileType === "DOCX" || fileType === "DOC") {
          const extractedText = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
          newDocument.pageCount = Math.ceil(extractedText.value.length / 2000) || 1;
        } else if (fileType === "PPTX") {
          newDocument.pageCount = await getPptxSlideCount(await file.arrayBuffer());
        }
      } catch (error) {
        console.error("Error processing file:", file.name, error);
        console.error(error.stack);
      }

      newDocuments.push(newDocument);
    }

    setRows([...rows, ...newDocuments]);
    localStorage.setItem('documentFiles', JSON.stringify([...rows, ...newDocuments]));
    setAlertInfo({ title: "Success", message: "Files uploaded successfully!", severity: "success" });
    setOpen(true);

    setLoading(false);  // Hide the loading spinner after upload is complete
  };

  const handlePurgeDatabase = () => {
    setOpenPurgeDialog(true);
  };

  const confirmPurgeDatabase = () => {
    setRows([]);
    localStorage.setItem('documentFiles', JSON.stringify([]));
    setAlertInfo({ title: "Success", message: "Database Collection Purged Successfully!", severity: "success" });
    setOpen(true);
    setOpenPurgeDialog(false);
  };

  const handleDeleteSelectedRows = () => {
    const newRows = rows.filter(row => !selectedRows.includes(row.id));
    setRows(newRows);
    localStorage.setItem('documentFiles', JSON.stringify(newRows));
    setSelectedRows([]);
    setOpenDeleteDialog(false);
    setAlertInfo({ title: "Success", message: "Files deleted successfully", severity: "success" });
    setOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '99%' }}>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: '10px', marginTop: '0%', justifyContent: 'space-around' }}>
        <Button variant="contained" component="label" startIcon={<FileUploadIcon />}>
          Upload & Process Documents
          <input type="file" hidden accept={Object.keys(allowedFileTypes).join(",")} onChange={handleFileUpload} multiple />
        </Button>
        <TextField
          label="Search Documents"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon />,
          }}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<DeleteForeverIcon />}
          sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
          disabled={!rows.length}
          onClick={handlePurgeDatabase}
        >
          Purge Database Collection
        </Button>
      </Box>

      <DataGrid 
        rows={filteredRows}
        columns={columns} 
        checkboxSelection 
        onRowSelectionModelChange={(selection) => setSelectedRows(selection)}
        autoHeight 
        sx={{ flexGrow: 1 }} 
      />

      {selectedRows.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: 2 }}>
          <Button
            variant="contained"
            onClick={() => setOpenDeleteDialog(true)}
            startIcon={<DeleteIcon />}
            sx={{
              backgroundColor: 'red',
              '&:hover': { backgroundColor: 'darkred' },
              padding: '5px 10px',
              fontSize: '16px',
            }}
          >
            Delete Selected Files
          </Button>
        </Box>
      )}

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete the selected file(s)?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteSelectedRows} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPurgeDialog} onClose={() => setOpenPurgeDialog(false)}>
        <DialogTitle>Confirm Purge Database Collection</DialogTitle>
        <DialogContent>Are you sure you want to purge the entire database collection?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPurgeDialog(false)}>Cancel</Button>
          <Button onClick={confirmPurgeDatabase} color="error">Purge</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
        <Alert severity={alertInfo.severity}>
          <AlertTitle>{alertInfo.title}</AlertTitle>
          {alertInfo.message}
        </Alert>
      </Snackbar>

      {/* Loading Spinner at the bottom left */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress sx={{ marginRight: 2 }} />
          <span>Uploading Files...</span>
        </Box>
      )}
    </Box>
  );
};

export default DocumentsPage;
