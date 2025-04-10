import React from "react";
import { Box, styled, LinearProgress } from "@mui/material";
import MessageDisplay from "./ChatPageMessageDisplay";

const MessagesArea = styled(Box)({
  flexGrow: 1,
  overflowY: "auto",
  marginBottom: 11,
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
        <Box sx={{ width: "100%", mt: 2 }}>
          <LinearProgress />
        </Box>
      )}
    </MessagesArea>
  );
};

export default MessageList;
