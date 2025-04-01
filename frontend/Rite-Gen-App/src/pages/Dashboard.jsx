import React from 'react';
import PropTypes from 'prop-types';
import { Box, Tooltip, Typography, Button, Stack } from "@mui/material";

import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import { createTheme } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import BarChartIcon from '@mui/icons-material/BarChart';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import ChatIcon from '@mui/icons-material/Chat';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ChatBox from '../components/ChatBox';
import DocumentsPage from '../components/DocumentsPage';
import TooltipBox from '../components/ToolTipBox';

const NAVIGATION = [
  { kind: 'header', title: 'Main Menu' },
  { segment: 'chat', title: 'Chat', icon: <ChatIcon /> },
  { segment: 'documents', title: 'Documents', icon: <FolderIcon /> },
  { kind: 'divider' },
  { kind: 'header', title: 'Database Management' },
  { segment: 'ProcessDocuments', title: 'Process Documents', icon: <DirectionsRunIcon /> },
  { segment: 'purgedatabase', title: 'Purge Database', icon: <DeleteIcon /> },
  { kind: 'divider' },
  { kind: 'header', title: 'Statistics' },
  {
    segment: 'llmevaluations',
    title: 'LLM Evaluations',
    icon: <BarChartIcon />,
    children: [
      { segment: 'contextprecision', title: 'Context Precision', icon: <SearchIcon /> },
      { segment: 'faithfulness', title: 'Faithfulness', icon: <VerifiedIcon /> },
      { segment: 'responserelevancy', title: 'Response Relevancy', icon: <QuestionAnswerIcon /> },
    ],
    
  },
  { kind: 'divider' },
  { kind: 'header', title: 'Support' },
  { segment: 'tooltips', title: 'Tooltips', icon: <HelpOutlineIcon /> },
];

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: { light: true, dark: true },
  breakpoints: { values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 } },
});

const HelpPage = () => (
  <Box sx={{ p: 4, textAlign: "center", maxWidth: 600, mx: "auto" }}>
    <Typography variant="h4" gutterBottom>
      Need Assistance?
    </Typography>
    <Typography variant="body1" paragraph>
      Get guidance on using RiteGen for documentation, content creation, and performance evaluation.
    </Typography>

    <Stack spacing={2} alignItems="center">
      <Tooltip title="Chat with the LLM to generate content." placement="top">
        <Button variant="outlined">Chat Assistance</Button>
      </Tooltip>

      <Tooltip title="Upload, edit, or delete documents from the sidebar." placement="top">
        <Button variant="outlined">Managing Documents</Button>
      </Tooltip>

      <Tooltip title="Evaluate responses based on precision, faithfulness, and relevancy." placement="top">
        <Button variant="outlined">Evaluating AI Performance</Button>
      </Tooltip>

      <Tooltip title="More details coming soon!" placement="top">
        <Button variant="text">More Help</Button>
      </Tooltip>
    </Stack>
  </Box>
);

const DemoPageContent = ({ selectedSegment }) => {
  return (
    <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      {selectedSegment === 'chat' && <ChatBox />}
      {selectedSegment === 'documents' && <DocumentsPage />}
      {selectedSegment === 'tooltips' && <HelpPage />}
    </Box>
  );
};


DemoPageContent.propTypes = { selectedSegment: PropTypes.string.isRequired };

const DashboardLayoutBasic = ({ window }) => {
  const router = useDemoRouter('/dashboard');

  // Log router.pathname to debug the extracted segment
  console.log('Current Path:', router.pathname);

  // Ensure correct segment extraction from pathname
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