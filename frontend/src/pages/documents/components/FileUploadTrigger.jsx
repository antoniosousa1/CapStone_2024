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
import FileUploadButton from "./FileUploadButton";

function FileUploadTrigger({ loading, onFileUpload }) {
  return <FileUploadButton loading={loading} onFileUpload={onFileUpload} />;
}

export default FileUploadTrigger;
