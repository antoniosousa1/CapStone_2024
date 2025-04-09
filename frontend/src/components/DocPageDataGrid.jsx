import { DataGrid as MUIDataGrid } from "@mui/x-data-grid";

const DataGrid = ({ handleRowSelection, rows, selectedRows }) => {
  // Define columns for the DataGrid.
  const columns = [
    { field: "doc_id", headerName: "Doc ID", flex: 1 },
    { field: "filename", headerName: "Document Name", flex: 2 },
    { field: "filetype", headerName: "File Type", flex: 1 },
    { field: "upload_time", headerName: "Upload Time", flex: 1.5 },
  ];

  return (
    <MUIDataGrid
      rows={rows}
      columns={columns}
      checkboxSelection
      onRowSelectionModelChange={handleRowSelection} // Update selected rows
      selectionModel={selectedRows}
      sx={{ flexGrow: 1 }}
      getRowId={(row) => row.doc_id} // Use doc_id as the row ID
    />
  );
};

export default DataGrid;
