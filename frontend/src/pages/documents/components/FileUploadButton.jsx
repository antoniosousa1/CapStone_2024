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
import Button from "@mui/material/Button";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)(({ loading }) => ({
  backgroundColor: loading ? "grey" : undefined,
}));

function FileUploadButton({ loading, onFileUpload }) {
  return (
    <StyledButton
      variant="contained"
      component="label"
      startIcon={<FileUploadIcon />}
      disabled={loading}
      sx={{ marginLeft: 1 }}
    >
      Upload & Process Documents
      <input
        type="file"
        hidden
        accept=".pdf,.doc,.docx,.pptx,.ppt,.csv"
        onChange={onFileUpload}
        multiple
      />
    </StyledButton>
  );
}

export default FileUploadButton;
