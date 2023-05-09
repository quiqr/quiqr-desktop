import React from 'react';
import InfoIcon   from '@material-ui/icons/Info';
import IconButton from '@material-ui/core/IconButton';
import Tooltip    from '@material-ui/core/Tooltip';

class Tip extends React.Component {
  render(){
    return (
      <span style={{display:'inline-block', position:'relative', cursor: 'default'}}>
        <Tooltip title={this.props.markdown}>
          <span>
            <IconButton aria-label="info" disabled={true}>
              <InfoIcon />
            </IconButton>
          </span>
        </Tooltip>
      </span>
    );
  }
}

export default Tip;
