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
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";
import ChatBox from "../chat/Chat";
import DocumentsPage from "../documents/Documents";
import TooltipBox from "../tooltips/ToolTips";
import NAVIGATION from "../../config/Navigation";
import theme from "../../config/Theme";
import DashboardBranding from "./components/Branding";
import DashboardHeader from "./components/Header";

const DashboardLayoutBasic = ({ window }) => {
  const router = useDemoRouter("/dashboard/chat");
  const segment = router.pathname.split("/").pop() || "chat";
  const brandingConfig = DashboardBranding();

  return (
    <AppProvider
      navigation={NAVIGATION}
      branding={brandingConfig}
      router={router}
      theme={theme}
      window={window?.()}
    >
      <DashboardLayout header={<DashboardHeader />}>
        <Box
          sx={{
            py: 2,
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
              opacity: segment === "chat" ? 1 : 0,
              pointerEvents: segment === "chat" ? "auto" : "none",
              position: "absolute",
            }}
          >
            <ChatBox />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              width: "100%",
              opacity: segment === "documents" ? 1 : 0,
              pointerEvents: segment === "documents" ? "auto" : "none",
              position: "flex", 
            }}
          >
            <DocumentsPage />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              width: "100%",
              opacity: segment === "tooltips" ? 1 : 0,
              pointerEvents: segment === "tooltips" ? "auto" : "none",
              position: "absolute",
            }}
          >
            <TooltipBox />
          </Box>
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
};

DashboardLayoutBasic.propTypes = { window: PropTypes.func };

export default DashboardLayoutBasic;
