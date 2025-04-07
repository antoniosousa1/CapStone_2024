// LoadingIndicator.jsx
import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingIndicator = () => (
    <Box sx={{ alignSelf: 'center', mt: 2 }}>
        <CircularProgress size={24} />
    </Box>
);

export default LoadingIndicator;