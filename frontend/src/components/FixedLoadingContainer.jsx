import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

const FixedLoadingContainer = styled(Box)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: theme.zIndex.snackbar + 1,
    display: 'flex',
    alignItems: 'center',
}));

export default FixedLoadingContainer;