{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import { useState } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function useFileUpload({ onRefetch }) {
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState({
    severity: "success",
    message: "",
  });

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnackbarOpen(false);

    const formData = new FormData();
    const files = e.target.files;

    if (files) {
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { uploaded = [], skipped = {} } = response.data;
      const skippedEntries = Object.entries(skipped); // [ [uploadedFile, matchedFile], ...]

      if (uploaded.length && skippedEntries.length) {
        const message = [
          `✅ Uploaded: ${uploaded.join(", ")}`,
          `⚠️ Skipped duplicates:\n${skippedEntries.map(([newFile, originalFile]) => `• ${newFile} (duplicate of ${originalFile})`).join("\n")}`,
        ].join("\n\n");

        setSnackbarContent({ severity: "warning", message });
      } else if (uploaded.length) {
        setSnackbarContent({
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

        setSnackbarContent({ severity: "error", message });
      }

      setSnackbarOpen(true);
      onRefetch();
    } catch (error) {
      console.error(`Upload failed: ${error.message}`);
      setSnackbarContent({
        severity: "error",
        message: "Upload failed. Please try again.",
      });
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }

    // Reset the input (optional - can be handled in the component)
    // if (e.target) {
    //   e.target.value = null;
    // }
  };

  return {
    loading,
    snackbarOpen,
    snackbarContent,
    handleCloseSnackbar,
    handleFileUpload,
  };
}

export default useFileUpload;
