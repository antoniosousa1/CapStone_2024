import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, AlertTitle, Snackbar, useTheme } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { PDFDocument } from 'pdf-lib';

const columns = [
  { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'documentName', headerName: 'Document Name', flex: 2 },
  { field: 'fileType', headerName: 'File Type', flex: 1 },
  { field: 'uploadDate', headerName: 'Upload Date', type: 'date', flex: 1.5 },
  { field: 'lastModified', headerName: 'Last Modified', type: 'date', flex: 1.5 },
  { field: 'pageCount', headerName: 'Page Count', flex: 1 },
];

const DocumentsPage = () => {
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteButtonVisible, setIsDeleteButtonVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: '', message: '', severity: 'success' });
  const [deleteButtonText, setDeleteButtonText] = useState('Delete Selected Files');
  const theme = useTheme();
  const [dataGridKey, setDataGridKey] = useState(0);

  const getFileType = (fileType) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word')) return 'DOCX';
    if (fileType.includes('msword')) return 'DOC';
    if (fileType.includes('presentation')) return 'PPTX';
    if (fileType.includes('plain')) return 'TXT';
    return 'Unknown';
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    console.log('Uploaded files:', files);

    const newRows = await Promise.all(
      Array.from(files).map(async (file, i) => {
        const fileType = getFileType(file.type);
        const newDocument = {
          id: rows.length + i + 1,
          documentName: file.name,
          fileType,
          uploadDate: new Date(),
          lastModified: new Date(file.lastModified),
          pageCount: 0,
        };

        if (fileType === 'PDF') {
          const reader = new FileReader();
          reader.readAsArrayBuffer(file);
          await new Promise((resolve) => {
            reader.onload = async (e) => {
              const pdfDoc = await PDFDocument.load(e.target.result);
              newDocument.pageCount = pdfDoc.getPages().length;
              resolve();
            };
          });
        } else if (fileType === 'TXT') {
          const reader = new FileReader();
          reader.readAsText(file);
          await new Promise((resolve) => {
            reader.onload = (e) => {
              newDocument.pageCount = e.target.result.split('\n').length;
              resolve();
            };
          });
        }

        return newDocument;
      })
    );

    console.log('New Rows:', newRows);

    setRows((prevRows) => [...prevRows, ...newRows]);
    setDataGridKey((prevKey) => prevKey + 1); // Force re-render
    setAlertInfo({ title: 'Success', message: `Files uploaded successfully!`, severity: 'success' });
    setOpen(true);
  };

  useEffect(() => {
    setDataGridKey((prevKey) => prevKey + 1); // Force re-render on row change.
  }, [rows]);

  const handleDeleteRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    setDataGridKey((prevKey) => prevKey + 1);
    setAlertInfo({ title: 'Success', message: 'File deleted successfully', severity: 'success' });
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason !== 'clickaway') setOpen(false);
  };

  const handleDeleteSelectedRows = () => {
    if (selectedRows.length === 0) return;
    setRows((prevRows) => prevRows.filter((row) => !selectedRows.includes(row.id)));
    setDataGridKey((prevKey) => prevKey + 1);
    setSelectedRows([]);
    setIsDeleteButtonVisible(false);
    const message = selectedRows.length === 1 ? 'File deleted successfully' : 'Files deleted successfully';
    setAlertInfo({ title: 'Success', message, severity: 'success' });
    setOpen(true);
  };

  const handleRowSelectionModelChange = (newSelectedRows) => {
    setSelectedRows(newSelectedRows);
    setIsDeleteButtonVisible(newSelectedRows.length > 0);
    setDeleteButtonText(newSelectedRows.length === 1 ? 'Delete Selected File' : 'Delete Selected Files');
  };

  const handleProcessDocuments = () => {
    console.log('Process Documents button clicked');
  };

  const handlePurgeDatabase = () => {
    console.log('Purge Database button clicked');
  };

  const hasDocuments = rows.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: '99%' }}>
      <Box sx={{ marginBottom: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
        <Button variant="contained" component="label" startIcon={<FileUploadIcon />} sx={{ backgroundColor: '#1976d2', color: '#fff', '&:hover': { backgroundColor: '#1565c0' } }}>
          Upload Document
          <input type="file" hidden multiple onChange={handleFileUpload} />
        </Button>
        <Button variant="contained" onClick={handleProcessDocuments} startIcon={<DirectionsRunIcon />} disabled={!hasDocuments} sx={{ backgroundColor: hasDocuments ? '#1976d2' : 'grey', color: '#fff', '&:hover': { backgroundColor: hasDocuments ? '#1565c0' : 'grey' } }}>
          Process Documents
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" onClick={handlePurgeDatabase} startIcon={<DeleteIcon />} disabled={!hasDocuments} sx={{ backgroundColor: hasDocuments ? '#d32f2f' : 'grey', color: '#fff', '&:hover': { backgroundColor: hasDocuments ? '#b22a2a' : 'grey' } }}>
          Purge Database
        </Button>
      </Box>

      <DataGrid
        key={dataGridKey} // Force re-render
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        checkboxSelection
        onRowSelectionModelChange={handleRowSelectionModelChange}
        rowSelectionModel={selectedRows}
        disableRowSelectionOnClick
        autoHeight
        sx={{ flexGrow: 1 }}
      />

      {isDeleteButtonVisible && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Button variant="contained" onClick={handleDeleteSelectedRows} startIcon={<DeleteIcon />} sx={{ backgroundColor: '#d32f2f', color: '#fff', '&:hover': { backgroundColor: '#b22a2a' } }}>
            {deleteButtonText}
          </Button>
        </Box>
      )}

      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={alertInfo.severity} sx={{ width: '100%', backgroundColor: theme.palette.success.main, color: theme.palette.success.contrastText }}>
          <AlertTitle>{alertInfo.title}</AlertTitle>
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsPage;