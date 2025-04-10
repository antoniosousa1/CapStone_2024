import React from "react";
import { Box, Typography, Paper, styled, useTheme } from "@mui/material";

const MessageContainer = styled(Paper)(({ theme, sender }) => ({
  backgroundColor:
    sender === "user"
      ? theme.palette.background.paper
      : theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[200],
  borderRadius: 8,
  padding: theme.spacing(2),
  width: "100%",
  textAlign: "left",
  wordWrap: "break-word",
}));

const MessageDisplay = ({ messages }) => {
  const theme = useTheme();

  return (
    <>
      {messages.map((msg, index) => (
        <Box key={index} sx={{ marginBottom: 2 }}>
          {" "}
          <MessageContainer sender={msg.sender}>
            <Typography
              variant="body1"
              sx={{
              }}
            >
              {msg.text}
            </Typography>
          </MessageContainer>
        </Box>
      ))}
    </>
  );
};

export default MessageDisplay;
