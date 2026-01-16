import { useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import DefaultWrapper from '../components/shared/DefaultWrapper';
import { useField, useRenderFields } from '../useField';
import type { LeafArrayField as LeafArrayFieldConfig, Field } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * LeafArrayField - array of simple values (strings, numbers, etc.).
 * Each item is rendered using the field type specified in config.field.
 *
 * This supports any field type for array items, not just string/number.
 * The item field definition comes from config.field (e.g., { type: 'string' }, { type: 'select', options: [...] })
 */
function LeafArrayField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<unknown[]>(compositeKey);
  const renderFields = useRenderFields();
  const config = field as LeafArrayFieldConfig;

  // Ensure value is an array
  const items = Array.isArray(value) ? value : config.default ?? [];

  // Get the item field definition
  const itemField = config.field as Field | undefined;
  const itemFieldType = itemField?.type ?? 'string';

  // Get the value path (remove 'root.' prefix)
  const valuePath = compositeKey.replace(/^root\./, '');

  // Get default value based on field type
  const getDefaultValue = useCallback((): unknown => {
    if (!itemField) return '';

    // Check if field has a default
    if ('default' in itemField && itemField.default !== undefined) {
      return itemField.default;
    }

    // Otherwise use type-based defaults
    switch (itemFieldType) {
      case 'number':
      case 'slider':
        return 0;
      case 'boolean':
        return false;
      case 'chips':
      case 'leaf-array':
        return [];
      case 'accordion':
      case 'nest':
      case 'section':
        return {};
      default:
        return '';
    }
  }, [itemField, itemFieldType]);

  const handleAdd = useCallback(() => {
    const newValue = getDefaultValue();
    setValue([...items, newValue]);
  }, [items, setValue, getDefaultValue]);

  const handleDelete = useCallback((index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setValue(newItems);
  }, [items, setValue]);

  // If no item field definition, we can't render properly
  if (!itemField) {
    return (
      <DefaultWrapper>
        <label
          style={{
            display: 'block',
            lineHeight: '22px',
            fontSize: 12,
            pointerEvents: 'none',
            userSelect: 'none',
            marginBottom: '8px',
          }}
        >
          {config.title ?? config.key}
        </label>
        <Box sx={{ color: 'error.main', fontSize: 12 }}>
          Error: No field definition provided for leaf-array items
        </Box>
      </DefaultWrapper>
    );
  }

  return (
    <DefaultWrapper>
      <label
        style={{
          display: 'block',
          lineHeight: '22px',
          fontSize: 12,
          pointerEvents: 'none',
          userSelect: 'none',
          marginBottom: '8px',
        }}
      >
        {config.title ?? config.key}
      </label>

      {items.map((_, index) => {
        // Create a field config for this item with the index as key
        const itemFieldConfig: Field = {
          ...itemField,
          key: String(index),
          // Don't show title for individual items - the array has the title
          title: undefined,
        };

        return (
          <Box
            key={`${config.key}-item-${index}`}
            sx={{ display: 'flex', width: '100%', mb: 1, alignItems: 'flex-start' }}
          >
            <Box sx={{ flex: 1 }}>
              {renderFields(valuePath, [itemFieldConfig])}
            </Box>
            <IconButton
              aria-label="remove"
              onClick={() => handleDelete(index)}
              size="small"
              sx={{ ml: 1, mt: '4px' }}
            >
              <RemoveIcon />
            </IconButton>
          </Box>
        );
      })}

      <Button
        style={{ marginTop: 10 }}
        endIcon={<AddIcon />}
        variant="contained"
        size="small"
        onClick={handleAdd}
      >
        Add
      </Button>
    </DefaultWrapper>
  );
}

export default LeafArrayField;
