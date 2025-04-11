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
import { AppBar, Toolbar, Typography } from "@mui/material";
import NAVIGATION from "../../config/Navigation";
import { useDemoRouter } from "@toolpad/core/internal";

const DashboardHeader = () => {
  const router = useDemoRouter("/dashboard/chat");
  const segment = router.pathname.split("/").pop() || "chat";

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {NAVIGATION.find((item) => item.segment === segment)?.title ||
            "Dashboard"}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;
