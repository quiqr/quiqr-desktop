import { useMemo } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import { useField, useRenderFields } from '../useField';
import type { NestField as NestFieldConfig, Field } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * NestField - nested field container.
 * In the new form system, renders child fields inline (no navigation).
 * TODO: Implement navigation/drill-down behavior if needed.
 */
function NestField({ compositeKey }: Props) {
  const { field } = useField(compositeKey);
  const renderFields = useRenderFields();
  const config = field as NestFieldConfig;

  // Build summary of child field labels
  const childLabels = useMemo(() => {
    const labels = config.fields.map((f: Field) => f.title || f.key).join(', ');
    return `(${labels})`;
  }, [config.fields]);

  // Determine the path for child fields based on groupdata setting
  const childPath = compositeKey.replace(/^root\./, '');
  const groupdata = config.groupdata !== false; // Default to true
  const parentPath = groupdata ? childPath : childPath.split('.').slice(0, -1).join('.') || '';

  // For now, render inline with a visual container
  // TODO: Implement drill-down navigation if needed
  return (
    <>
      <List style={{ marginBottom: 16, padding: 0 }}>
        <ListItemButton
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

      {/* Render child fields inline */}
      <div
        style={{
          padding: '16px 0px 0px 16px',
          marginBottom: '16px',
          borderLeft: 'solid 10px #eee',
        }}
      >
        {renderFields(parentPath, config.fields as Field[])}
      </div>
    </>
  );
}

export default NestField;
