// components/DataGrid.jsx
import React, { useEffect, useState } from 'react';
import { DataGrid as MUIDataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const DataGrid = ({refetchSignal}) => {

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const updateRows = (data) => {
    const rowsWithId = data.map(({ doc_id, filename, filetype, upload_time }) => ({
      id: doc_id,
      filename,
      filetype,
      upload_time,
    }));
    setRows(rowsWithId);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/list-files`);  // your backend API route
        updateRows(res.data.files); // assuming res.data = list of docs
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, [refetchSignal]);
  // Define columns for the DataGrid.
  const columns = [
    { field: 'id', headerName: 'Doc ID', flex: 1 },
    { field: 'filename', headerName: 'Document Name', flex: 2 },
    { field: 'filetype', headerName: 'File Type', flex: 1 },
    { field: 'upload_time', headerName: 'Upload Time', flex: 1.5 },
  ];

  return (
    <MUIDataGrid
      rows={rows}
      columns={columns}
      checkboxSelection
      onRowSelectionModelChange={(selection) => setSelectedRows(selection)}
      selectionModel={selectedRows}
      sx={{ flexGrow: 1 }}
    />
  );
};

export default DataGrid;