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
import { Snackbar, Alert, AlertTitle } from "@mui/material";

const LoadingSnackbar = ({ open, message = "Please wait..." }) => {
  return (
    <Snackbar open={open} autoHideDuration={null}>
      <Alert severity="info">
        <AlertTitle>Dropping, Please Wait!</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default LoadingSnackbar;
