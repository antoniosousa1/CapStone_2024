{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import { useState, useRef } from "react";
import axios from "axios";

const useFileUploadProgress = () => {
  const [uploading, setUploading] = useState(false);
  const cancelUploadSource = useRef(null);

  const handleFileUploadStart = () => {
    setUploading(true);
    cancelUploadSource.current = axios.CancelToken.source();
  };

  const handleFileUploadEnd = () => {
    setUploading(false);
    cancelUploadSource.current = null;
  };

  const handleCancelUpload = () => {
    if (cancelUploadSource.current) {
      cancelUploadSource.current.cancel("Upload cancelled by user.");
      setUploading(false);
      cancelUploadSource.current = null;
    }
  };

  return {
    uploading,
    cancelUploadSource,
    handleFileUploadStart,
    handleFileUploadEnd,
    handleCancelUpload,
  };
};

export default useFileUploadProgress;
