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
import { Box, Toolbar, Typography, AppBar } from "@mui/material";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";
import ChatBox from "../chat/Chat";
import DocumentsPage from "../documents/Documents";
import TooltipBox from "../tooltips/ToolTips";
import NAVIGATION from "../../config/Navigation";
import theme from "../../config/Theme";

const DashboardLayoutBasic = ({ window }) => {
  const router = useDemoRouter("/dashboard/chat");
  const segment = router.pathname.split("/").pop() || "chat";

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
            {segment === "documents" && <DocumentsPage />}
            {segment === "tooltips" && <TooltipBox />}
          </Box>
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
};

DashboardLayoutBasic.propTypes = { window: PropTypes.func };

export default DashboardLayoutBasic;
