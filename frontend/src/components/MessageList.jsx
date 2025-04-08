// MessageList.jsx
import React from 'react';
import { Box, styled } from '@mui/material';
import MessageDisplay from './MessageDisplay';
import LoadingIndicator from './LoadingIndicator';

const MessagesArea = styled(Box)({
    flexGrow: 1,
    overflowY: 'auto',
    marginBottom: 3,
    padding: 2,
    display: 'flex',
    flexDirection: 'column',
});

const MessageList = ({ messages, messagesEndRef, isLoading }) => {
    return (
        <MessagesArea>
            <MessageDisplay messages={messages} />
            <div ref={messagesEndRef} />
            {isLoading && <LoadingIndicator />}
        </MessagesArea>
    );
};

export default MessageList;