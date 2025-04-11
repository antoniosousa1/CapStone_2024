// UploadDocsContainer.jsx
import React from "react";
import Box from "@mui/material/Box";
import FileUploadButton from "./FileUploadButton";
import useFileUpload from "../../../hooks/useFileUpload";

function UploadDocsContainer({
  onRefetch,
  onUploadStart,
  onUploadEnd,
  cancelToken,
  setUploadResult,
}) {
  const { loading, handleFileUpload } = useFileUpload({
    onRefetch,
    onUploadStart,
    onUploadEnd,
    cancelToken,
    setUploadResult,
  });

  return (
    <Box>
      <FileUploadButton loading={loading} onFileUpload={handleFileUpload} />
    </Box>
  );
}

export default UploadDocsContainer;
