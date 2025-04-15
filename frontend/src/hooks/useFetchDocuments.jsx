{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
console.log("Backend URL in useFetchDocuments:", BACKEND_URL); 

const useFetchDocuments = (refetchSignal) => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching data from:", `${BACKEND_URL}/list-files`); 
        const res = await axios.get(`${BACKEND_URL}/list-files`);
        console.log("Data fetched successfully:", res.data); 
        setRows(res.data.files);
        setFilteredRows(res.data.files);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refetchSignal]);

  return { rows, filteredRows, loading, error, setRows };
};

export default useFetchDocuments;
