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
        const uploadedList = uploaded.map((name) => `• ${name}`);
        const skippedList = skippedEntries.map(
          ([newFile, originalFile]) =>
            `• ${newFile} (${originalFile})`
        );
        setUploadResult?.({
          severity: "warning",
          message: [
            `✅ Uploaded:`,
            ...uploadedList,
            `⚠️ Skipped duplicates:`,
            ...skippedList,
          ],
        });
      } else if (uploaded.length) {
        const uploadedList = uploaded.map((name) => `• ${name}`);
        setUploadResult?.({
          severity: "success",
          message: [`✅ Uploaded:`, ...uploadedList],
        });
      } else if (skippedEntries.length) {
        const plural = skippedEntries.length > 1 ? "files were" : "file was";
        const skippedList = skippedEntries.map(
          ([newFile, originalFile]) => `• ${newFile} (matches ${originalFile})`
        );
        setUploadResult?.({
          severity: "error",
          message: [
            `❌ ${skippedEntries.length} ${plural} not uploaded (duplicates):`,
            ...skippedList,
          ],
        });
      } else {
        setUploadResult?.({
          severity: "success",
          message: "No files uploaded.",
        });
      }

      onRefetch();
    } catch (error) {
      console.error("Upload failed:", error.message);
      setUploadResult?.({
        severity: "error",
        message: ["❌ Upload failed. Please try again."], // Message as an array
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
