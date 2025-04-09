import React from "react";
import { Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const QueryTime = ({ responseTime }) => {
  if (responseTime === null) return null;

  const responseTimeInSeconds = (responseTime / 1000).toFixed(2);

  return (
    <Box
      mt={2}
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="12%"
    >
      <StyledTypography variant="body1" color="textSecondary">
        Response Time: {responseTimeInSeconds} seconds
      </StyledTypography>
    </Box>
  );
};

export default QueryTime;
