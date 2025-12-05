import { useMemo, useState } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import Collapse from '@mui/material/Collapse';
import { useField, useRenderFields } from '../useField';
import type { NestField as NestFieldConfig, Field } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * NestField - nested field container with expand/collapse.
 * Click the header to toggle visibility of child fields.
 */
function NestField({ compositeKey }: Props) {
  const { field } = useField(compositeKey);
  const renderFields = useRenderFields();
  const config = field as NestFieldConfig;

  const [expanded, setExpanded] = useState(false);

  // Build summary of child field labels
  const childLabels = useMemo(() => {
    const labels = config.fields.map((f: Field) => f.title || f.key).join(', ');
    return `(${labels})`;
  }, [config.fields]);

  // Determine the path for child fields based on groupdata setting
  const childPath = compositeKey.replace(/^root\./, '');
  const groupdata = config.groupdata !== false; // Default to true
  const parentPath = groupdata ? childPath : childPath.split('.').slice(0, -1).join('.') || '';

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <List style={{ marginBottom: expanded ? 0 : 16, padding: 0 }}>
        <ListItemButton
          onClick={handleToggle}
          style={{
            padding: '20px 16px',
            border: 'solid 1px #d8d8d8',
            borderRadius: expanded ? '7px 7px 0 0' : '7px',
          }}
        >
          <ListItemIcon>
            {expanded ? <FolderOpenIcon /> : <FolderIcon />}
          </ListItemIcon>
          <ListItemText
            primary={config.title ?? config.key}
            secondary={expanded ? undefined : childLabels}
          />
          {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
        </ListItemButton>
      </List>

      <Collapse in={expanded}>
        <div
          style={{
            padding: '16px 0px 0px 16px',
            marginBottom: '16px',
            borderLeft: 'solid 10px #eee',
          }}
        >
          {renderFields(parentPath, config.fields as Field[])}
        </div>
      </Collapse>
    </>
  );
}

export default NestField;
