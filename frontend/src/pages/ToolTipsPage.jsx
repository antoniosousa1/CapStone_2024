import React from "react";
import { Box, Stack, Typography, Button, Tooltip } from "@mui/material";
import PropTypes from "prop-types";

const helpItems = [
  { title: "Chat with the LLM to generate content.", label: "Chat Assistance" },
  {
    title: "Upload, edit, or delete documents from the 'Documents' tab.",
    label: "Managing Documents",
  },
  {
    title:
      "Evaluate responses based on precision, faithfulness, and relevancy.",
    label: "Evaluating AI Performance",
  },
  { title: "More details coming soon!", label: "More Help" },
];

const TooltipBox = ({ placement }) => {
  return (
    <Box sx={{ p: 4, textAlign: "center", maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Need Assistance?
      </Typography>
      <Typography variant="body1" paragraph>
        Get guidance on using RiteGen for documentation, content creation, and
        performance evaluation.
      </Typography>

      <Stack spacing={2} alignItems="center">
        {helpItems.map((item, index) => (
          <Tooltip key={index} title={item.title} placement={placement} arrow>
            <Button variant="outlined">{item.label}</Button>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
};

TooltipBox.propTypes = {
  placement: PropTypes.oneOf(["top", "bottom", "left", "right"]),
};

TooltipBox.defaultProps = {
  placement: "top",
};

export default TooltipBox;
