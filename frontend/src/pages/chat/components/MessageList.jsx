{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import React from "react";
import { Box, styled, LinearProgress } from "@mui/material";
import MessageDisplay from "./MessageDisplay";

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
