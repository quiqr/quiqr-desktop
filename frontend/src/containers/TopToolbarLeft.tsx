import React from 'react';
import Box from '@mui/material/Box';

interface TopToolbarLeftProps { 
  title: string;
  siteKey?: string;
  workspaceKey?: string;
}

const TopToolbarLeft = ({ title, siteKey, workspaceKey }: TopToolbarLeftProps) => {
  return (
    <Box
      textOverflow="ellipsis"
      overflow="hidden"
      fontWeight="fontWeightMedium"
      border={0}
      component="div"
      fontSize="h6.fontSize"
      m={2}
      whiteSpace="nowrap"
    >
      {title}
    </Box>
  );
};

export default TopToolbarLeft;
