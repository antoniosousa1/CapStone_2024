import React from "react";
import { Box, styled } from "@mui/material";
import MessageDisplay from "./ChatPageMessageDisplay";
import { CircularProgress } from "@mui/material"; 

const MessagesArea = styled(Box)({
  flexGrow: 1,
  overflowY: "auto",
  marginBottom: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
});

const MessageList = ({ messages, messagesEndRef, isLoading }) => {
  return (
    <MessagesArea>
      <MessageDisplay messages={messages} />
      <div ref={messagesEndRef} />
      {isLoading && (
        <Box sx={{ alignSelf: "center", mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </MessagesArea>
  );
};

export default MessageList;
