{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import React from "react";
import ConfirmationDialog from "./PurgeDBConfirmationDialog";
import LoadingSnackbar from "./PurgeDBLoadingSnackbar";
import SuccessSnackbar from "./PurgeDBSuccessSnackbar";
import usePurgeDatabase from "../../../hooks/usePurgeDB";

const PurgeDB = ({ onRefetch, open, onClose, setAlertInfo, setRows }) => {
  const {
    loading,
    successSnackbarOpen,
    handleCloseSuccessSnackbar,
    confirmPurgeDatabase,
  } = usePurgeDatabase({ onRefetch, setRows, setAlertInfo, onClose });

  return (
    <>
      <ConfirmationDialog
        open={open}
        onClose={onClose}
        title="Confirm Purge Database Collection"
        content="Are you sure you want to purge your entire database collection?"
        onConfirm={confirmPurgeDatabase}
        confirmText="Purge"
        confirmColor="error"
        loading={loading}
      />

      <LoadingSnackbar
        open={loading}
        message="Purging The Database Collection..."
      />

      <SuccessSnackbar
        open={successSnackbarOpen}
        onClose={handleCloseSuccessSnackbar}
        message="Collection Purged successfully!"
      />
    </>
  );
};

export default PurgeDB;
