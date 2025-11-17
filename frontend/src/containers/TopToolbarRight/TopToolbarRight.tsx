import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

interface TopToolbarRightProps {
  itemsLeft: React.ReactElement[];
  itemsCenter: React.ReactElement[];
  itemsRight: React.ReactElement[];
}

class TopToolbarRight extends React.Component<TopToolbarRightProps> {
  render() {
    return (
      <Grid container spacing={3}>
        <Grid item xs>
          <Box display="flex" flexDirection="row" border={0} alignItems="center">
            {this.props.itemsLeft.map((item, index) => {
              return item;
            })}
          </Box>
        </Grid>
        <Grid item xs>
          <Box display="flex" justifyContent="center" flexDirection="row" border={0} alignItems="center">
            {this.props.itemsCenter.map((item, index) => {
              return item;
            })}
          </Box>
        </Grid>
        <Grid item xs>
          <Box display="flex" justifyContent="flex-end" flexDirection="row" width={1} border={0} alignItems="center">
            {this.props.itemsRight.map((item, index) => {
              return item;
            })}
          </Box>
        </Grid>
      </Grid>
    );
  }
}

export default TopToolbarRight;
