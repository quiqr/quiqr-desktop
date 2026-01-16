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

function ToolbarToggleButtonGroup({
  title,
  optionItems,
  activeOption,
  handleChange,
}: ToolbarToggleButtonGroupProps) {
  return (
    <Box display="flex" justifyContent="center" flexDirection="column" border={0} m={0.6} px={1}>
      <ToggleButtonGroup value={activeOption} exclusive size="small">
        {optionItems.map((item, index) => (
          <ToggleButton
            key={'view' + index}
            value={item.value}
            aria-label={item.value}
            onClick={() => handleChange(item.value)}
          >
            {item.icon}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Button size="small" sx={{ m: 0, p: 0 }}>
        {title}
      </Button>
    </Box>
  );
}

export default ToolbarToggleButtonGroup;
