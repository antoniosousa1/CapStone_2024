// components/HandleDeleteRows.jsx
import React from 'react';

const HandleDeleteRows = ({
  rows,
  setRows,
  selectedRows,
  setSelectedRows,
  setOpenDeleteDialog,
  setAlertInfo,
  setOpen,
}) => {
  const handleDeleteSelectedRows = () => {
    const newRows = rows.filter((row) => !selectedRows.includes(row.id));
    setRows(newRows);
    localStorage.setItem('documentFiles', JSON.stringify(newRows));
    setSelectedRows([]);
    setOpenDeleteDialog(false);
    setAlertInfo({
      title: 'Success',
      message: `${selectedRows.length === 1 ? 'File' : 'Files'} deleted successfully`,
      severity: 'success',
    });
    setOpen(true);
  };

  return handleDeleteSelectedRows;
};

export default HandleDeleteRows;