// src/hooks/useDocumentUpload.js
import { useState } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function useFileUpload({
  onRefetch,
  onUploadStart,
  onUploadEnd,
  cancelToken,
  setUploadResult,
}) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    const files = e.target.files;

    if (files) {
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
    }

    try {
      onUploadStart?.();

      const response = await axios.post(`${BACKEND_URL}/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        cancelToken,
      });

      const { uploaded = [], skipped = {} } = response.data;
      const skippedEntries = Object.entries(skipped);

      if (uploaded.length && skippedEntries.length) {
        const message = [
          `✅ Uploaded: ${uploaded.join(", ")}`,
          `⚠️ Skipped duplicates:\n${skippedEntries
            .map(
              ([newFile, originalFile]) =>
                `• ${newFile} (duplicate of ${originalFile})`
            )
            .join("\n")}`,
        ].join("\n\n");
        setUploadResult?.({ severity: "warning", message });
      } else if (uploaded.length) {
        setUploadResult?.({
          severity: "success",
          message: `✅ Uploaded: ${uploaded.join(", ")}`,
        });
      } else if (skippedEntries.length) {
        const plural = skippedEntries.length > 1 ? "files were" : "file was";
        const message = [
          `❌ ${skippedEntries.length} ${plural} not uploaded (duplicates):`,
          skippedEntries
            .map(
              ([newFile, originalFile]) =>
                `• ${newFile} (matches ${originalFile})`
            )
            .join("\n"),
        ].join("\n\n");
        setUploadResult?.({ severity: "error", message });
      }

      onRefetch();
    } catch (error) {
      console.error("Upload failed:", error.message);
      setUploadResult?.({
        severity: "error",
        message: "❌ Upload failed. Please try again.",
      });
    } finally {
      setLoading(false);
      onUploadEnd?.();
    }

    e.target.value = null;
  };

  return { loading, handleFileUpload };
}

export default useFileUpload;
