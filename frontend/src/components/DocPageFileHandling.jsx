import JSZip from "jszip";

export const allowedFileTypes = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PPTX",
  "text/plain": "TXT",
  "text/csv": "CSV",
};

export const formatFileSize = (sizeInBytes) => {
  return sizeInBytes < 1024 * 1024
    ? `${(sizeInBytes / 1024).toFixed(2)} KB`
    : `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const getPptxSlideCount = async (file) => {
  const zip = new JSZip();
  const content = await zip.loadAsync(file);
  return Object.keys(content.files).filter(
    (name) => name.startsWith("ppt/slides/") && name.endsWith(".xml")
  ).length;
};
