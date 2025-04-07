import React, { useState, useRef, useEffect } from 'react';
import { Box, styled } from '@mui/material';
import ChatHeader from '../components/ChatHeader';
import ChatInput from '../components/ChatInput';
import MessageList from '../components/MessageList';
import axios from 'axios'; // Import axios

const ChatPageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
}));

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { text: message, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/query`, { query: message }); // Changed key to "query"
      const aiMessage = {
        text: response.data.llm_response, // Backend now returns "llm_response"
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally display an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    // Optionally call a backend API to clear chat history on the server
    // axios.post(`${BACKEND_URL}/clear_chat`); // Adjust endpoint if needed
  };

  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  return (
    <ChatPageContainer>
      <ChatHeader onClearChat={handleClearChat} />
      <MessageList
        messages={messages}
        messagesEndRef={messagesEndRef}
        isLoading={isLoading}
      />
      <ChatInput
        newMessage={newMessage}
        onNewMessageChange={handleNewMessageChange}
        onSendMessage={handleSendMessage}
      />
    </ChatPageContainer>
  );
};

export default ChatPage;