import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import FixedLoadingContainer from "./DocPageFixedLoadingContainer";

function FileUploadProgress({ loading }) {
  return (
    loading && (
      <FixedLoadingContainer>
        <CircularProgress size={40} />
        <Typography sx={{ ml: 1 }}>
          Currently Uploading Documents...{" "}
        </Typography>
      </FixedLoadingContainer>
    )
  );
}

export default FileUploadProgress;
