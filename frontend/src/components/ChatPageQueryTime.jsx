// components/ChatPageQueryTime.jsx
import React from "react";
import { Typography, Box, useTheme } from "@mui/material";

const QueryTime = ({ responseTime }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  if (responseTime === null) {
    return null; 
  }

  const responseTimeInSeconds = (responseTime / 1000).toFixed(2);

  return (
    <Box
      mt={0}
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="auto" 
      marginBottom={theme.spacing(2)} 
    >
      <Typography
        variant="body1"
        sx={{ color: primaryColor, fontWeight: "bold" }}
      >
        Response Time: {responseTimeInSeconds} seconds
      </Typography>
    </Box>
  );
};

export default QueryTime;
