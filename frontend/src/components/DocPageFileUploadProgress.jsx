import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import FixedLoadingContainer from "./DocPageFixedLoadingContainer";
import Button from "@mui/material/Button";

function FileUploadProgress({ onCancel }) {
  return (
    <FixedLoadingContainer
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography>Uploading documents...</Typography>
    </FixedLoadingContainer>
  );
}

export default FileUploadProgress;
