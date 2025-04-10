import React from "react";
import {
  Box,
  Typography,
  Divider,
  useTheme,
} from "@mui/material";

const ChatHeader = ({}) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 1,
          marginTop: 0,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            flexGrow: 1,
            fontWeight: "bold",
            color: primaryColor,
          }}
        >
          RiteGen
        </Typography>
      </Box>
      <Divider
        sx={{
          marginBottom: 2,
          borderColor: primaryColor,
          borderWidth: "2.5px",
          borderRadius: "15px",
        }}
      />
    </Box>
  );
};

export default ChatHeader;
