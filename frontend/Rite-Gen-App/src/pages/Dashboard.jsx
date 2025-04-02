import React from 'react';
import PropTypes from 'prop-types';
import { Box } from "@mui/material";
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import { createTheme } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import ChatIcon from '@mui/icons-material/Chat';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ChatBox from '../components/ChatBoxPage';
import DocumentsPage from '../components/DocumentsPage';
import TooltipBox from '../components/ToolTipsPage';

const NAVIGATION = [
  { kind: 'header', title: 'Main Menu' },
  { segment: 'chat', title: 'Chat', icon: <ChatIcon /> },
  { segment: 'documents', title: 'Documents', icon: <FolderIcon /> },
  { kind: 'divider' },
  { kind: 'header', title: 'Support' },
  { segment: 'tooltips', title: 'Tooltips', icon: <HelpOutlineIcon /> },
];

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: { light: true, dark: true },
  breakpoints: { values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 } },
});

const DemoPageContent = ({ selectedSegment }) => {
  return (
    <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      {selectedSegment === 'chat' && <ChatBox />}
      {selectedSegment === 'documents' && <DocumentsPage />}
      {selectedSegment === 'tooltips' && <TooltipBox />}
    </Box>
  );
};

DemoPageContent.propTypes = { selectedSegment: PropTypes.string.isRequired };

const DashboardLayoutBasic = ({ window }) => {
  const router = useDemoRouter('/dashboard/chat');
  const segment = router.pathname.split('/').pop() || 'chat'; // Default to 'chat' if empty

  return (
    <AppProvider
      navigation={NAVIGATION}
      branding={{
        logo: <img src="https://rite-solutions.com/wp-content/uploads/2024/06/RiteSolutions_Logo-op.png" alt="MUI logo" />,
        title: '',
        homeUrl: 'chat',
      }}
      router={router}
      theme={theme}
      window={window?.()}
    >
      <DashboardLayout>
        <DemoPageContent selectedSegment={segment} />
      </DashboardLayout>
    </AppProvider>
  );
};

DashboardLayoutBasic.propTypes = { window: PropTypes.func };

export default DashboardLayoutBasic;
