import { ReactElement } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

interface TopToolbarRightProps {
  itemsLeft: ReactElement[];
  itemsCenter: ReactElement[];
  itemsRight: ReactElement[];
}

const TopToolbarRight = ({ itemsLeft, itemsCenter, itemsRight }: TopToolbarRightProps) => {
  return (
    <Grid container spacing={3}>
      <Grid size="grow">
        <Box display="flex" flexDirection="row" border={0} alignItems="center">
          {itemsLeft}
        </Box>
      </Grid>
      <Grid size="grow">
        <Box display="flex" justifyContent="center" flexDirection="row" border={0} alignItems="center">
          {itemsCenter}
        </Box>
      </Grid>
      <Grid size="grow">
        <Box display="flex" justifyContent="flex-end" flexDirection="row" width={1} border={0} alignItems="center">
          {itemsRight}
        </Box>
      </Grid>
    </Grid>
  );
};

export default TopToolbarRight;
