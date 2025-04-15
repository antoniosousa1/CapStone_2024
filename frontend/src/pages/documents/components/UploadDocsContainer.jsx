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
