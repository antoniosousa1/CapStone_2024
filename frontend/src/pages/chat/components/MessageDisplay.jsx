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
  height: "auto"
}));

const MessageDisplay = ({ messages }) => {
  const theme = useTheme();

  return (
    <>
      {messages.map((msg, index) => (
        <Box key={index} sx={{ marginBottom: 2 }}>
          {" "}
          <MessageContainer sender={msg.sender}>
            <Typography variant="body1" sx={{}}>
              {msg.text}
            </Typography>
          </MessageContainer>
        </Box>
      ))}
    </>
  );
};

export default MessageDisplay;
