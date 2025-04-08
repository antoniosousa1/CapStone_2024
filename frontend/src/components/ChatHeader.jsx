// ChatHeader.jsx
import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

const ChatHeader = ({ onClearChat }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Typography variant="h4" sx={{ textAlign: 'center', flexGrow: 1, fontWeight: 'bold' }}>
                RiteGen
            </Typography>
            <IconButton onClick={onClearChat} aria-label="clear chat">
                <ClearIcon />
            </IconButton>
        </Box>
    );
};

export default ChatHeader;