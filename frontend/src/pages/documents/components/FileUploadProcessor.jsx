{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import processFile from "./processFile";

const FileUploadProcessor = async (
  files,
  rows,
  setRows,
  setAlertInfo,
  setOpen,
  setLoading
) => {
  if (!files.length) return;

  setLoading(true);
  const newDocuments = [];

  for (const file of files) {
    const processedDocument = await processFile(
      file,
      rows.length + newDocuments.length
    );
    if (processedDocument) {
      newDocuments.push(processedDocument);
    }
  }

  setRows([...rows, ...newDocuments]);
  localStorage.setItem(
    "documentFiles",
    JSON.stringify([...rows, ...newDocuments])
  );
  setAlertInfo({
    title: "Success",
    message: `${files.length === 1 ? "File" : "Files"} uploaded successfully!`,
    severity: "success",
  });
  setOpen(true);
  setLoading(false);
};

export default FileUploadProcessor;
