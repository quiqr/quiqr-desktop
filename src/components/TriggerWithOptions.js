import * as React from 'react';
import { Popover, Menu, MenuItem } from 'material-ui-02/';

export class TriggerWithOptions extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
      open: false,
    };
  }

  handleTriggerClick = (event) => {
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  handleMenuItemClick = (event, menuItem, index)=>{
    let result = this.props.onOptionClick(index);
    if(result!==false)
      this.setState({open:false});
  }

  render() {
    let {triggerProps, options, menuProps, popoverProps} = this.props;
    let TriggerType = this.props.triggerType;
    return (
      <React.Fragment>
        <TriggerType
          {...triggerProps}
          onClick={this.handleTriggerClick}
        />
        <Popover
          {...popoverProps}
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
        >
          <Menu onItemClick={this.handleMenuItemClick} {...menuProps}>
            { options.map((x,i) =>(<MenuItem key={i} primaryText={x} />)) }
          </Menu>
        </Popover>
      </React.Fragment>
    );
  }
}
