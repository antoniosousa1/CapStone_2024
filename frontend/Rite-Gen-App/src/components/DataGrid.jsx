// components/DataGrid.jsx
import React, { useEffect, useState } from 'react';
import { DataGrid as MUIDataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const DataGrid = ({ onRowSelectionModelChange, selectionModel }) => {
  const [rows, setRows] = useState([]);

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
        const res = await axios.get("http://127.0.0.1:5005/list-files");  // your backend API route
        updateRows(res.data.files); // assuming res.data = list of docs
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };

    fetchData();
  }, []);
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
      onRowSelectionModelChange={onRowSelectionModelChange}
      selectionModel={selectionModel}
      sx={{ flexGrow: 1 }}
    />
  );
};

export default DataGrid;