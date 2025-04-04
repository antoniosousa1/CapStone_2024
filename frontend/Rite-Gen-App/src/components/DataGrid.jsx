// components/DataGrid.jsx
import React from 'react';
import { DataGrid as MUIDataGrid } from '@mui/x-data-grid';

const DataGrid = ({ rows, onRowSelectionModelChange, selectionModel }) => {

  // Define columns for the DataGrid.
  const columns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'documentName', headerName: 'Document Name', flex: 2 },
    { field: 'fileType', headerName: 'File Type', flex: 1 },
    { field: 'fileSize', headerName: 'File Size', flex: 1 },
    { field: 'uploadDate', headerName: 'Upload Date', flex: 1.5 },
    { field: 'lastModified', headerName: 'Last Modified', flex: 1.5 },
    { field: 'pageCount', headerName: 'Page Count', flex: 1 },
  ];

  return (
    <MUIDataGrid
      rows={rows}
      columns={columns}
      checkboxSelection
      onRowSelectionModelChange={onRowSelectionModelChange}
      selectionModel={selectionModel}
      autoHeight
      sx={{ flexGrow: 1 }}
    />
  );
};

export default DataGrid;