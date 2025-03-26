import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Typography, CircularProgress, Paper, Grid, styled, useTheme, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

// Styled Components for Custom Styling
const MessageContainer = styled(Paper)(({ theme, sender }) => ({
  backgroundColor: sender === 'user' ? theme.palette.background.paper : theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  borderRadius: '8px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  width: '100%',
  textAlign: 'left',
  wordWrap: 'break-word',
}));

const ChatBox = ({ onSendMessage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const userMessage = { text: newMessage, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setNewMessage('');
      setIsLoading(true);

      try {
        const aiResponse = await onSendMessage(newMessage);
        const aiMessage = {
          text: aiResponse.response,
          sender: 'ai',
          context: aiResponse.context,
          faithfulness: aiResponse.faithfulness,
          relevancy: aiResponse.relevancy,
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error('Error fetching LLM response:', error);
        const errorMessage = { text: 'Sorry, I encountered an error.', sender: 'ai' };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
        <Typography variant="h4" sx={{ textAlign: 'center', flexGrow: 1, fontWeight: 'bold' }}>
          Rite Solutions Content Creator
        </Typography>
        <IconButton onClick={handleClearChat} aria-label="clear chat">
          <ClearIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          marginBottom: '24px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((message, index) => (
          <Box key={index}>
            <MessageContainer sender={message.sender}>
              <Typography variant="body1">{message.text}</Typography>
            </MessageContainer>
            {message.sender === 'ai' && (
              <Grid container spacing={2} justifyContent="center" sx={{ marginTop: '8px', marginBottom: '12px' }}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ padding: 2, textAlign: 'center', backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : 'inherit' }}>
                    <Typography variant="subtitle1">Context</Typography>
                    <Typography variant="h6">{message.context}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ padding: 2, textAlign: 'center', backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : 'inherit' }}>
                    <Typography variant="subtitle1">Faithfulness</Typography>
                    <Typography variant="h6">{message.faithfulness}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ padding: 2, textAlign: 'center', backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : 'inherit' }}>
                    <Typography variant="subtitle1">Relevancy</Typography>
                    <Typography variant="h6">{message.relevancy}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
        {isLoading && <CircularProgress size={24} sx={{ alignSelf: 'center', mt: 2 }} />}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <TextField
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          label="Message Rite Content Creator"
          variant="outlined"
          fullWidth
          sx={{ marginRight: '16px' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
      </Box>
    </Box>
  );
};

export default ChatBox;