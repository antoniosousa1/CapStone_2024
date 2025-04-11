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

const useSnackbar = () => {
  const [open, setOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    title: "",
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setOpen(false);
  };

  const showSnackbar = (newAlertInfo) => {
    setAlertInfo(newAlertInfo);
    setOpen(true);
  };

  return { open, alertInfo, handleCloseSnackbar, showSnackbar };
};

export default useSnackbar;
