import * as React from "react";
import { NavLink } from "react-router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { SvgIconComponent } from "@mui/icons-material";

interface ToolbarButtonProps {
  title: string;
  action?: () => void;
  to?: string;
  icon: SvgIconComponent;
  active?: boolean;
}

const ToolbarButton = ({ title, action, to, icon, active }: ToolbarButtonProps) => {
  const UseIcon = icon;

  const buttonSx = {
    flexDirection: "column" as const,
    textTransform: "none" as const,
    m: 0,
    p: 0,
    ...(active && {
      color: "#757575",
    }),
  };

  // If `to` is provided, render as NavLink
  if (to) {
    return (
      <Box p={0.5}>
        <Button
          component={NavLink}
          to={to}
          className='toolbar-button'
          startIcon={<UseIcon style={{ padding: 0 }} />}
          sx={buttonSx}
        >
          {title}
        </Button>
      </Box>
    );
  }

  // Otherwise render with onClick action
  return (
    <Box p={0.5}>
      <Button
        onClick={action}
        className='toolbar-button'
        startIcon={<UseIcon style={{ padding: 0 }} />}
        sx={buttonSx}
      >
        {title}
      </Button>
    </Box>
  );
};

export default ToolbarButton;
