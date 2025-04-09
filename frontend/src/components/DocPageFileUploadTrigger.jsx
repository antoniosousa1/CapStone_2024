import React from "react";
import FileUploadButton from "./DocPageFileUploadButton";

function FileUploadTrigger({ loading, onFileUpload }) {
  return <FileUploadButton loading={loading} onFileUpload={onFileUpload} />;
}

export default FileUploadTrigger;
