import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface OptionItem {
  icon: React.ReactElement;
  value: string;
}

interface ToolbarToggleButtonGroupProps {
  title?: string;
  optionItems: OptionItem[];
  activeOption: string;
  handleChange: (value: string) => void;
}

interface ToolbarToggleButtonGroupState {
  view: string;
}

class ToolbarToggleButtonGroup extends React.Component<
  ToolbarToggleButtonGroupProps,
  ToolbarToggleButtonGroupState
> {
  constructor(props: ToolbarToggleButtonGroupProps) {
    super(props);

    this.state = {
      view: 'list',
    };
  }

  render() {
    const { title, optionItems, activeOption } = this.props;
    return (
      <Box display="flex" justifyContent="center" flexDirection="column" border={0} m={0.6} px={1}>
        <ToggleButtonGroup value={activeOption} exclusive size="small">
          {optionItems.map((item, index) => {
            return (
              <ToggleButton
                key={'view' + index}
                value={item.value}
                aria-label={item.value}
                onClick={() => this.props.handleChange(item.value)}
              >
                {item.icon}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
        <Button size="small" sx={{ m: 0, p: 0 }}>
          {title}
        </Button>
      </Box>
    );
  }
}

export default ToolbarToggleButtonGroup;
