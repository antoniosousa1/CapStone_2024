import React from "react";
import { Box, TextField, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const ChatInput = ({ newMessage, onNewMessageChange, onSendMessage }) => {
  const handleEnterPress = (e) => {
    if (e.key === "Enter") {
      onSendMessage(newMessage); 
    }
  };

  const handleButtonClick = () => {
    onSendMessage(newMessage); 
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
      <TextField
        value={newMessage}
        onChange={onNewMessageChange}
        label="Message RiteGen"
        variant="outlined"
        fullWidth
        sx={{ marginRight: 2 }}
        onKeyDown={handleEnterPress}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleButtonClick}
        sx={{ height: 56, minWidth: 64 }}
      >
        <SendIcon />
      </Button>
    </Box>
  );
};

export default ChatInput;
