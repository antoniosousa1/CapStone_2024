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

const useDocumentRowSelection = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowSelection = (rows) => {
    setSelectedRows(rows);
  };

  return { selectedRows, handleRowSelection };
};

export default useDocumentRowSelection;
