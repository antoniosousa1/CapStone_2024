import React from "react";
import { Box, TextField, Button, Tooltip, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ClearIcon from "@mui/icons-material/Clear";
import { useTheme } from "@mui/material/styles";

const ChatInput = ({
  newMessage,
  onNewMessageChange,
  onSendMessage,
  onClearChat,
  disabled,
}) => {
  const handleEnterPress = (e) => {
    if (e.key === "Enter" && !disabled) {
      onSendMessage(newMessage);
    }
  };

  const handleSendButtonClick = () => {
    if (!disabled) {
      onSendMessage(newMessage);
    }
  };

  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
      <TextField
        value={newMessage}
        onChange={onNewMessageChange}
        label="Message RiteGen AI"
        variant="outlined"
        fullWidth
        sx={{ marginRight: 2 }}
        onKeyDown={handleEnterPress}
        disabled={disabled} 
      />
      <Tooltip title="Send Message">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendButtonClick}
          sx={{ height: 56, minWidth: 64, marginRight: 1 }}
          disabled={disabled} 
        >
          <SendIcon />
        </Button>
      </Tooltip>
      <Tooltip title="Clear Chat">
        <IconButton
          onClick={onClearChat}
          aria-label="Clear Chat"
          color="primary"
          sx={{ height: 56, width: 56 }}
          disabled={disabled}
        >
          <ClearIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ChatInput;
