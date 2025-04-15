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
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import FixedLoadingContainer from "./LoadingContainer";

function FileUploadProgress({ onCancel, loading }) {
  return (
    loading && (
      <FixedLoadingContainer
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
          <CircularProgress size={40} />
          <Typography sx={{ ml: 1 }}>
            Uploading Documents...{" "}
          </Typography>
        </Box>
      </FixedLoadingContainer>
    )
  );
}

export default FileUploadProgress;