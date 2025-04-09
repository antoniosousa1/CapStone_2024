import React, { useState } from 'react';
import { Box, Stack, Typography, Button, Tooltip, Modal, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';

const helpItems = [
  {
    title: 'Chat with the LLM to generate content.',
    label: 'Chat Assistance',
    pdfUrl: '/pdfs/ChatHelp.pdf',
  },
  {
    title: "Upload, edit, or delete documents from the 'Documents' tab.",
    label: 'Managing Documents',
    pdfUrl: '/pdfs/DocsHelp.pdf',
  },
  {
    title: 'More details coming soon!',
    label: 'More Help',
  },
];

const TooltipBox = ({ placement }) => {
  const [open, setOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const handleOpen = (pdfUrl) => {
    setSelectedPdf(pdfUrl);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPdf(null);
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Need Assistance?
      </Typography>
      <Typography variant="body1" paragraph>
        Get guidance on using RiteGen for documentation, content creation, and performance evaluation.
      </Typography>

      <Stack spacing={2} alignItems="center">
        {helpItems.map((item, index) => (
          <Tooltip key={index} title={item.title} placement={placement} arrow>
            <Button variant="outlined" onClick={() => handleOpen(item.pdfUrl)}>
              {item.label}
            </Button>
          </Tooltip>
        ))}
      </Stack>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            width: '90%',
            maxWidth: 800,
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          {selectedPdf && (
            <iframe
              src={selectedPdf}
              title="PDF Preview"
              width="100%"
              height="600px"
              style={{ border: 'none' }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

TooltipBox.propTypes = {
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
};

TooltipBox.defaultProps = {
  placement: 'top',
};

export default TooltipBox;
