{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import { useState, useRef, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const LOCAL_STORAGE_KEY = "chatMessages";

const useChatLogic = () => {
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
    console.log("Clear chat function executed"); // For debugging
  };

  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  return {
    messages,
    newMessage,
    isLoading,
    responseTime,
    messagesEndRef,
    setNewMessage,
    handleSendMessage,
    handleClearChat,
    handleNewMessageChange,
  };
};

export default useChatLogic;
