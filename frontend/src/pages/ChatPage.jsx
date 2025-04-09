import React, { useState, useRef, useEffect } from "react";
import { Box, styled } from "@mui/material";
import ChatHeader from "../components/ChatPageHeader";
import ChatInput from "../components/ChatPageInput";
import MessageList from "../components/ChatPageMessageList";
import axios from "axios";
import QueryTime from "../components/ChatPageQueryTime";

const ChatPageContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  overflowY: "hidden",
}));

const MessageListContainer = styled(Box)({
  flexGrow: 1,
  overflowY: "auto",
  marginBottom: "8px",
});

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const LOCAL_STORAGE_KEY = "chatMessages";

const ChatPage = () => {
  const [messages, setMessages] = useState(() => {
    const storedMessages = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedMessages ? JSON.parse(storedMessages) : [];
  });
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Save messages to local storage whenever the messages state updates
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { text: message, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      const response = await axios.post(`${BACKEND_URL}/query`, {
        query: message,
      });
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setResponseTime(duration);

      const aiMessage = {
        text: response.data.llm_response,
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setResponseTime(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  return (
    <ChatPageContainer>
      <ChatHeader onClearChat={handleClearChat} />
      <MessageListContainer>
        <MessageList
          messages={messages}
          messagesEndRef={messagesEndRef}
          isLoading={isLoading}
        />
      </MessageListContainer>
      <QueryTime responseTime={responseTime} />
      <ChatInput
        newMessage={newMessage}
        onNewMessageChange={handleNewMessageChange}
        onSendMessage={handleSendMessage}
      />
    </ChatPageContainer>
  );
};

export default ChatPage;
