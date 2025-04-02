import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  styled,
  useTheme,
  IconButton,
  Button,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SendIcon from '@mui/icons-material/Send';

const MessageContainer = styled(Paper)(({ theme, sender }) => ({
  backgroundColor:
    sender === 'user'
      ? theme.palette.background.paper
      : theme.palette.mode === 'dark'
      ? theme.palette.grey[800]
      : theme.palette.grey[200],
  borderRadius: 8,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = { text: newMessage, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
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
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching LLM response:', error);
      setMessages((prev) => [...prev, { text: 'Sorry, I encountered an error.', sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', flexGrow: 1, fontWeight: 'bold' }}>
          RiteGen
        </Typography>
        <IconButton onClick={() => setMessages([])} aria-label="clear chat">
          <ClearIcon />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', marginBottom: 3, padding: 2, display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg, index) => (
          <Box key={index}>
            <MessageContainer sender={msg.sender}>
              <Typography variant="body1">{msg.text}</Typography>
            </MessageContainer>
            {msg.sender === 'ai' && (
              <Grid container spacing={2} justifyContent="center" sx={{ mt: 1, mb: 1.5 }}>
                {[['Context', msg.context], ['Faithfulness', msg.faithfulness], ['Relevancy', msg.relevancy]].map(
                  ([label, value], i) => (
                    <Grid item xs={12} sm={4} key={i}>
                      <Paper sx={{ padding: 2, textAlign: 'center', backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : 'inherit' }}>
                        <Typography variant="subtitle1">{label}</Typography>
                        <Typography variant="h6">{value}</Typography>
                      </Paper>
                    </Grid>
                  )
                )}
              </Grid>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
        {isLoading && <CircularProgress size={24} sx={{ alignSelf: 'center', mt: 2 }} />}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
        <TextField
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          label="Message RiteGen"
          variant="outlined"
          fullWidth
          sx={{ marginRight: 2 }}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ height: 56, minWidth: 64 }}>
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default ChatBox;