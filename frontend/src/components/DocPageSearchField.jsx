import React from "react";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";

const SearchField = ({ searchQuery, setSearchQuery }) => {
  return (
    <TextField
      label="Search Documents"
      variant="outlined"
      size="small"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      InputProps={{
        endAdornment: <SearchIcon />,
      }}
      sx={{ flexGrow: 1 }}
    />
  );
};

export default SearchField;
