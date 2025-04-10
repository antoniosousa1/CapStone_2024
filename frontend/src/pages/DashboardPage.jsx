// src/pages/DashboardPage.jsx
import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Box, Toolbar, Typography, AppBar } from "@mui/material";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";
import { createTheme } from "@mui/material/styles";
import FolderIcon from "@mui/icons-material/Folder";
import ChatIcon from "@mui/icons-material/Chat";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChatBox from "./ChatPage";
import DocumentsPage from "./DocumentsPage";
import TooltipBox from "./ToolTipsPage";
import FileUploadProgress from "../components/DocPageFileUploadProgress";
import axios from "axios"; // ✅ Needed for CancelToken

const NAVIGATION = [
  { kind: "header", title: "Main Menu" },
  { segment: "chat", title: "Chat", icon: <ChatIcon /> },
  { segment: "documents", title: "Documents", icon: <FolderIcon /> },
  { kind: "divider" },
  { kind: "header", title: "Support" },
  { segment: "tooltips", title: "Tooltips", icon: <HelpOutlineIcon /> },
];

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "data-toolpad-color-scheme" },
  colorSchemes: { light: true, dark: true },
  breakpoints: { values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 } },
});

const DashboardLayoutBasic = ({ window }) => {
  const router = useDemoRouter("/dashboard/chat");
  const segment = router.pathname.split("/").pop() || "chat";
  const [uploading, setUploading] = useState(false);
  const cancelUploadSource = useRef(null);

  const handleFileUploadStart = () => {
    setUploading(true);
    cancelUploadSource.current = axios.CancelToken.source();
  };

  const handleFileUploadEnd = () => {
    setUploading(false);
    cancelUploadSource.current = null;
  };

  const handleCancelUpload = () => {
    if (cancelUploadSource.current) {
      cancelUploadSource.current.cancel("Upload cancelled by user.");
      setUploading(false);
      cancelUploadSource.current = null;
    }
  };

  return (
    <AppProvider
      navigation={NAVIGATION}
      branding={{
        logo: (
          <img
            src="https://rite-solutions.com/wp-content/uploads/2024/06/RiteSolutions_Logo-op.png"
            alt="MUI logo"
            style={{ maxHeight: "45px", color: "red" }}
          />
        ),
        title: "",
        homeUrl: "chat",
      }}
      router={router}
      theme={theme}
      window={window?.()}
    >
      <DashboardLayout
        header={
          <AppBar position="static" color="primary">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {NAVIGATION.find((item) => item.segment === segment)?.title ||
                  "Dashboard"}
              </Typography>
            </Toolbar>
          </AppBar>
        }
      >
        <Box
          sx={{
            py: 4,
            display: "flex",
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              width: "100%",
              display: segment === "chat" ? "flex" : "none",
            }}
          >
            <ChatBox />
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              width: "100%",
              display:
                segment === "documents" || segment === "tooltips"
                  ? "flex"
                  : "none",
            }}
          >
            {segment === "documents" && (
              <DocumentsPage
                onUploadStart={handleFileUploadStart}
                onUploadEnd={handleFileUploadEnd}
                cancelToken={cancelUploadSource.current?.token}
              />
            )}
            {segment === "tooltips" && <TooltipBox />}
          </Box>

          {/* ✅ Spinner-based upload indicator (global) */}
          {uploading && <FileUploadProgress onCancel={handleCancelUpload} />}
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
};

DashboardLayoutBasic.propTypes = { window: PropTypes.func };

export default DashboardLayoutBasic;
