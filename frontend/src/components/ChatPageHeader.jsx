import React from "react";
import { Box, Typography, IconButton, Divider, useTheme } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

const ChatHeader = ({ onClearChat }) => {
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
            color: primaryColor, // Header text is primary color
          }}
        >
          RiteGen
        </Typography>
        <IconButton
          onClick={onClearChat}
          aria-label="clear chat"
          color="primary" // Set IconButton color to primary
        >
          <ClearIcon />
        </IconButton>
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
