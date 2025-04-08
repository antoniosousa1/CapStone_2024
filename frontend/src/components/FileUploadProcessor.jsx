// components/FileUploadProcessor.jsx
import React from 'react';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import { allowedFileTypes, formatFileSize, getPptxSlideCount } from './FileHandling';

const FileUploadProcessor = async (files, rows, setRows, setAlertInfo, setOpen, setLoading) => {
  if (!files.length) return;

  setLoading(true);

  const newDocuments = [];
  for (const file of files) {
    const fileType = allowedFileTypes[file.type];
    if (!fileType) continue;

    const newDocument = {
      id: rows.length + newDocuments.length + 1,
      documentName: file.name,
      fileType,
      fileSize: formatFileSize(file.size),
      uploadDate: new Date().toLocaleDateString(),
      lastModified: new Date(file.lastModified).toLocaleDateString(),
      pageCount: 1,
    };

    try {
      if (fileType === 'PDF') {
        const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
        newDocument.pageCount = pdfDoc.getPages().length;
      } else if (fileType === 'TXT' || fileType === 'CSV') {
        newDocument.pageCount = (await file.text()).split('\n').length;
      } else if (fileType === 'DOCX' || fileType === 'DOC') {
        const extractedText = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        newDocument.pageCount = Math.ceil(extractedText.value.length / 2000) || 1;
      } else if (fileType === 'PPTX') {
        newDocument.pageCount = await getPptxSlideCount(await file.arrayBuffer());
      }
    } catch (error) {
      console.error('Error processing file:', file.name, error);
      console.error(error.stack);
    }

    newDocuments.push(newDocument);
  }

  setRows([...rows, ...newDocuments]);
  localStorage.setItem('documentFiles', JSON.stringify([...rows, ...newDocuments]));
  setAlertInfo({ title: 'Success', message: `${files.length === 1 ? 'File' : 'Files'} uploaded successfully!`, severity: 'success' });
  setOpen(true);

  setLoading(false);
  // API Call needed here to send the new documents to the backend.
};

export default FileUploadProcessor;