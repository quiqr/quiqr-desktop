import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import { useField } from '../useField';
import { buildNestUrl, getBasePath, parseNestPath } from '../../../utils/nestPath';
import type { NestField as NestFieldConfig, Field } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * NestField - nested field container that navigates to a nested view.
 * Click to navigate to a dedicated view showing the nested fields.
 */
function NestField({ compositeKey }: Props) {
  const { field } = useField(compositeKey);
  const navigate = useNavigate();
  const location = useLocation();
  const config = field as NestFieldConfig;

  // Build summary of child field labels
  const childLabels = useMemo(() => {
    const labels = config.fields.map((f: Field) => f.title || f.key).join(', ');
    return `(${labels})`;
  }, [config.fields]);

  const handleClick = () => {
    // Get the base path (without any /nest/* suffix)
    const basePath = getBasePath(location.pathname);
    // Get the current nest path (if already in a nested view)
    const currentNestPath = parseNestPath(location.pathname);
    // Build the URL to navigate to this nested field
    const url = buildNestUrl(basePath, config.key, currentNestPath);
    navigate(url);
  };

  return (
    <List style={{ marginBottom: 16, padding: 0 }}>
      <ListItemButton
        onClick={handleClick}
        style={{
          padding: '20px 16px',
          border: 'solid 1px #d8d8d8',
          borderRadius: '7px',
        }}
      >
        <ListItemIcon>
          <FolderIcon />
        </ListItemIcon>
        <ListItemText
          primary={config.title ?? config.key}
          secondary={childLabels}
        />
        <ChevronRightIcon />
      </ListItemButton>
    </List>
  );
}

export default NestField;
