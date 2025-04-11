{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";
import {
  allowedFileTypes,
  formatFileSize,
  getPptxSlideCount,
} from "./DocPageFileHandling";

const processFile = async (file, existingRowCount) => {
  const fileType = allowedFileTypes[file.type];
  if (!fileType) return null;

  const newDocument = {
    id: existingRowCount + 1,
    documentName: file.name,
    fileType,
    fileSize: formatFileSize(file.size),
    uploadDate: new Date().toLocaleDateString(),
    lastModified: new Date(file.lastModified).toLocaleDateString(),
    pageCount: 1, // Default
  };

  try {
    if (fileType === "PDF") {
      const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
      newDocument.pageCount = pdfDoc.getPages().length;
    } else if (fileType === "TXT" || fileType === "CSV") {
      newDocument.pageCount = (await file.text()).split("\n").length;
    } else if (fileType === "DOCX" || fileType === "DOC") {
      const extractedText = await mammoth.extractRawText({
        arrayBuffer: await file.arrayBuffer(),
      });
      newDocument.pageCount = Math.ceil(extractedText.value.length / 2000) || 1;
    } else if (fileType === "PPTX") {
      newDocument.pageCount = await getPptxSlideCount(await file.arrayBuffer());
    }
  } catch (error) {
    console.error("Error processing file:", file.name, error);
    console.error(error.stack);
    return { ...newDocument, error: "Failed to process file" };
  }

  return newDocument;
};

export default processFile;
