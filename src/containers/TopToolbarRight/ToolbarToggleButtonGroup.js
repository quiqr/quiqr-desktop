import React from 'react';

import Box               from '@material-ui/core/Box';
import Button            from '@material-ui/core/Button';
import ToggleButton      from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { withStyles }    from '@material-ui/core/styles';


const useStyles = theme => ({
  iconButton: {
    margin: theme.spacing(0),
    padding: theme.spacing(0),
  },
});

class ToolbarToggleButtonGroup extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      view: "list"
    }
  }

  render(){
    const { classes, title, optionItems, activeOption } = this.props;
    return (
      <Box display="flex" justifyContent="center" flexDirection="column" border={0} m={0.6} px={1}>
        <ToggleButtonGroup value={activeOption} exclusive size="small">
          {optionItems.map((item, index)=>{
            return (<ToggleButton key={"view"+index} value={item.value} aria-label={item.value}
            onClick={()=>this.props.handleChange(item.value)} >
            {item.icon}
          </ToggleButton>)
          })}
        </ToggleButtonGroup>
        <Button size="small" className={classes.iconButton}>{title}</Button>
      </Box>
    )
  }
}

export default withStyles(useStyles)(ToolbarToggleButtonGroup);

