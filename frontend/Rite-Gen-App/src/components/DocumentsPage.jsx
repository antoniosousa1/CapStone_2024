import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, AlertTitle } from '@mui/material';
import { Snackbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';

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
  const [rows, setRows] = useState([
    { id: 1, documentName: 'Document 1', fileType: 'PDF', fileSize: 2048, uploadDate: new Date('2024-03-01'), lastModified: new Date('2024-03-02'), pageCount: 10 },
    { id: 2, documentName: 'Document 2', fileType: 'DOCX', fileSize: 1536, uploadDate: new Date('2024-03-05'), lastModified: new Date('2024-03-06'), pageCount: 5 },
    { id: 3, documentName: 'Document 3', fileType: 'TXT', fileSize: 1024, uploadDate: new Date('2024-03-10'), lastModified: new Date('2024-03-11'), pageCount: 1 },
    { id: 4, documentName: 'Document 4', fileType: 'PDF', fileSize: 3072, uploadDate: new Date('2024-03-15'), lastModified: new Date('2024-03-16'), pageCount: 15 },
    { id: 5, documentName: 'Document 5', fileType: 'CSV', fileSize: 512, uploadDate: new Date('2024-03-20'), lastModified: new Date('2024-03-21'), pageCount: 2 },
    { id: 6, documentName: 'Document 1', fileType: 'PDF', fileSize: 2048, uploadDate: new Date('2024-03-01'), lastModified: new Date('2024-03-02'), pageCount: 10 },
    { id: 7, documentName: 'Document 2', fileType: 'DOCX', fileSize: 1536, uploadDate: new Date('2024-03-05'), lastModified: new Date('2024-03-06'), pageCount: 5 },
    { id: 8, documentName: 'Document 3', fileType: 'TXT', fileSize: 1024, uploadDate: new Date('2024-03-10'), lastModified: new Date('2024-03-11'), pageCount: 1 },
    { id: 9, documentName: 'Document 4', fileType: 'PDF', fileSize: 3072, uploadDate: new Date('2024-03-15'), lastModified: new Date('2024-03-16'), pageCount: 15 },
    { id: 10, documentName: 'Document 5', fileType: 'CSV', fileSize: 512, uploadDate: new Date('2024-03-20'), lastModified: new Date('2024-03-21'), pageCount: 2 },
    { id: 11, documentName: 'Document 1', fileType: 'PDF', fileSize: 2048, uploadDate: new Date('2024-03-01'), lastModified: new Date('2024-03-02'), pageCount: 10 },
    { id: 12, documentName: 'Document 2', fileType: 'DOCX', fileSize: 1536, uploadDate: new Date('2024-03-05'), lastModified: new Date('2024-03-06'), pageCount: 5 },
    { id: 13, documentName: 'Document 3', fileType: 'TXT', fileSize: 1024, uploadDate: new Date('2024-03-10'), lastModified: new Date('2024-03-11'), pageCount: 1 },
    { id: 14, documentName: 'Document 4', fileType: 'PDF', fileSize: 3072, uploadDate: new Date('2024-03-15'), lastModified: new Date('2024-03-16'), pageCount: 15 },
    { id: 15, documentName: 'Document 5', fileType: 'CSV', fileSize: 512, uploadDate: new Date('2024-03-20'), lastModified: new Date('2024-03-21'), pageCount: 2 },
    { id: 16, documentName: 'Document 1', fileType: 'PDF', fileSize: 2048, uploadDate: new Date('2024-03-01'), lastModified: new Date('2024-03-02'), pageCount: 10 },
    { id: 17, documentName: 'Document 2', fileType: 'DOCX', fileSize: 1536, uploadDate: new Date('2024-03-05'), lastModified: new Date('2024-03-06'), pageCount: 5 },
    { id: 18, documentName: 'Document 3', fileType: 'TXT', fileSize: 1024, uploadDate: new Date('2024-03-10'), lastModified: new Date('2024-03-11'), pageCount: 1 },
    { id: 19, documentName: 'Document 4', fileType: 'PDF', fileSize: 3072, uploadDate: new Date('2024-03-15'), lastModified: new Date('2024-03-16'), pageCount: 15 },
    { id: 20, documentName: 'Document 5', fileType: 'CSV', fileSize: 512, uploadDate: new Date('2024-03-20'), lastModified: new Date('2024-03-21'), pageCount: 2 },
    { id: 21, documentName: 'Document 1', fileType: 'PDF', fileSize: 2048, uploadDate: new Date('2024-03-01'), lastModified: new Date('2024-03-02'), pageCount: 10 },
    { id: 22, documentName: 'Document 2', fileType: 'DOCX', fileSize: 1536, uploadDate: new Date('2024-03-05'), lastModified: new Date('2024-03-06'), pageCount: 5 },
    { id: 23, documentName: 'Document 3', fileType: 'TXT', fileSize: 1024, uploadDate: new Date('2024-03-10'), lastModified: new Date('2024-03-11'), pageCount: 1 },
    { id: 24, documentName: 'Document 4', fileType: 'PDF', fileSize: 3072, uploadDate: new Date('2024-03-15'), lastModified: new Date('2024-03-16'), pageCount: 15 },
    { id: 25, documentName: 'Document 5', fileType: 'CSV', fileSize: 512, uploadDate: new Date('2024-03-20'), lastModified: new Date('2024-03-21'), pageCount: 2 },

  ]);

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
