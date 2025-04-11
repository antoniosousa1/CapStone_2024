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
import ChatHeader from "./components/Header";
import ChatInput from "./components/Input";
import MessageList from "./components/MessageList";
import QueryTime from "./components/ResponseTime";
import useChatLogic from "../../hooks/useChatLogic";
import { ChatPageContainer, MessageListContainer } from "./components/Styles";

const ChatPage = () => {
  const {
    messages,
    newMessage,
    isLoading,
    responseTime,
    messagesEndRef,
    setNewMessage,
    handleSendMessage,
    handleClearChat,
    handleNewMessageChange,
  } = useChatLogic();

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
        onClearChat={handleClearChat}
        disabled={isLoading}
      />
    </ChatPageContainer>
  );
};

export default ChatPage;
