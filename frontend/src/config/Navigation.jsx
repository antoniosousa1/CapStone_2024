{
  /*

  Authors: Antonio Sousa Jr(Team Lead), Matthew Greeson, Goncalo Felix, Antonio Morais, Dylan Ricci, Ryan Medeiros
  Affiliation: University of Massachusetts Dartmouth
  Course: CIS 498 & 499 (Senior Capstone Project)
  Ownership: Rite-Solutions, Inc.
  Client/Stakeholder: Brandon Carvalho

*/
}

import FolderIcon from "@mui/icons-material/Folder";
import ChatIcon from "@mui/icons-material/Chat";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const NAVIGATION = [
  { kind: "header", title: "Main Menu" },
  { segment: "chat", title: "Chat", icon: <ChatIcon /> },
  { segment: "documents", title: "Documents", icon: <FolderIcon /> },
  { kind: "divider" },
  { kind: "header", title: "Support" },
  { segment: "tooltips", title: "Tooltips", icon: <HelpOutlineIcon /> },
];

export default NAVIGATION;
