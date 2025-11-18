import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { SvgIconComponent } from "@mui/icons-material";

interface ToolbarButtonProps {
  title: string;
  action: () => void;
  icon: SvgIconComponent;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ title, action, icon, active }) => {
  const UseIcon = icon;

  return (
    <Box p={0.5}>
      <Button
        onClick={action}
        className='toolbar-button'
        startIcon={<UseIcon style={{ padding: 0 }} />}
        sx={{
          flexDirection: "column",
          textTransform: "none",
          m: 0,
          p: 0,
          ...(active && {
            color: "#757575",
          }),
        }}
      >
        {title}
      </Button>
    </Box>
  );
};

export default ToolbarButton;
