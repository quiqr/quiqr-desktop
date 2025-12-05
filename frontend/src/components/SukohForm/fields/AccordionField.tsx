import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import Button from '@mui/material/Button';
import { Accordion, AccordionItem } from '../../Accordion';
import DangerButton from '../../DangerButton';
import { useField, useRenderFields } from '../useField';
import service from '../../../services/service';
import { isValidAppThemeConfiguration } from '../../../utils/type-guards';
import type { AccordionField as AccordionFieldConfig, Field, DynFormFields } from '@quiqr/types';
import Box from '@mui/material/Box';

// Extended field type that adds properties used by dynamic field loading
interface ExtendedField {
  lazy?: boolean;
  lazyTemp?: boolean;
  arrayTitle?: boolean;
  compositeKey?: string;
  key: string;
  type: string;
  fields?: ExtendedField[];
  [key: string]: unknown;
}

interface Props {
  compositeKey: string;
}

/**
 * AccordionField - array of objects with collapsible items.
 * Supports add, delete, reorder operations, dynamic fields, and object-based storage.
 *
 * Full feature parity with legacy AccordionDynamic including:
 * - Drag-and-drop sorting with visual feedback
 * - arrayIndicesAreKeys mode (object-based storage)
 * - Dynamic fields loading via dynFormSearchKey
 * - Accordion state persistence
 * - Disabled items visual indication
 * - Theme-aware header colors
 */
function AccordionField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<Record<string, unknown>[] | Record<string, Record<string, unknown>>>(compositeKey);
  const renderFields = useRenderFields();
  const config = field as AccordionFieldConfig;

  // State for accordion expansion
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // State for drag and drop (state for re-rendering, refs for event handlers)
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragToIndex, setDragToIndex] = useState<number | null>(null);
  const dragFromIndexRef = useRef<number | null>(null);
  const dragToIndexRef = useRef<number | null>(null);

  // State for theme-aware header colors
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState('#efefef');

  // State for dynamic fields
  const [dynFields, setDynFields] = useState<Record<string, ExtendedField[]>>({});
  const [dynFieldsEmpty, setDynFieldsEmpty] = useState<ExtendedField[]>([]);
  const [shouldSaveAccordionState, setShouldSaveAccordionState] = useState(false);

  // Determine if we're in arrayIndicesAreKeys mode
  const arrayIndicesAreKeys = config.arrayIndicesAreKeys === true;

  // Normalize value based on mode
  const normalizedValue = useMemo(() => {
    if (arrayIndicesAreKeys) {
      return (value && typeof value === 'object' && !Array.isArray(value))
        ? value as Record<string, Record<string, unknown>>
        : {};
    }
    return Array.isArray(value) ? value : [];
  }, [value, arrayIndicesAreKeys]);

  // Get items as array for rendering
  const items = useMemo(() => {
    if (arrayIndicesAreKeys) {
      return Object.entries(normalizedValue as Record<string, Record<string, unknown>>);
    }
    return (normalizedValue as Record<string, unknown>[]).map((item, index) => [String(index), item] as [string, Record<string, unknown>]);
  }, [normalizedValue, arrayIndicesAreKeys]);

  // Find the field marked as arrayTitle for displaying item labels
  const arrayTitleField = useMemo(() => {
    const fields = config.fields as ExtendedField[] | undefined;
    return fields?.find((f) => f.arrayTitle === true);
  }, [config.fields]);

  // Load theme preferences on mount
  useEffect(() => {
    service.api.readConfKey('prefs').then((prefs) => {
      if (isValidAppThemeConfiguration(prefs)) {
        if (prefs.interfaceStyle === 'quiqr10-dark') {
          setHeaderBackgroundColor('#666');
        } else {
          setHeaderBackgroundColor('#efefef');
        }
      }
    });
  }, []);

  // Process dynamic fields when value changes
  useEffect(() => {
    if (arrayIndicesAreKeys || !config.dynFormSearchKey) {
      return;
    }

    const baseFields = config.fields as ExtendedField[];
    setDynFieldsEmpty(baseFields);

    const processItems = async () => {
      const newDynFields: Record<string, ExtendedField[]> = {};
      const itemsArray = normalizedValue as Record<string, unknown>[];

      for (let childIndex = 0; childIndex < itemsArray.length; childIndex++) {
        const item = itemsArray[childIndex];
        const componentKey = `item-${childIndex}`;
        const searchKey = config.dynFormSearchKey!;
        const searchVal = item[searchKey];
        const dynFormObjectRoot = config.dynFormObjectRoot ?? 'dynamics';

        try {
          const extraFields = await service.api.getDynFormFields(dynFormObjectRoot, { key: searchKey, val: searchVal }) as DynFormFields;

          if (extraFields.fields && extraFields.fields.length > 0) {
            setShouldSaveAccordionState(true);

            // Cast fields to ExtendedField[] for processing
            const rawFields = extraFields.fields as ExtendedField[];

            // Process extra fields and set composite keys
            const processedExtraFields = rawFields.map((extrField) => {
              const processed: ExtendedField = { ...extrField };
              processed.compositeKey = `${compositeKey}.${extrField.key}`;
              processed.lazy = true;

              // Process nested fields
              if ('fields' in processed && Array.isArray(processed.fields)) {
                processed.fields = processed.fields.map((nestedField) => ({
                  ...nestedField,
                  compositeKey: `${processed.compositeKey}.${nestedField.key}`
                }));
              }

              return processed;
            });

            // Merge with base fields, replacing any with matching keys
            const cleanedBaseFields = baseFields.filter((obj) => {
              return !processedExtraFields.find((x) => x.key === obj.key);
            });

            newDynFields[componentKey] = [...cleanedBaseFields, ...processedExtraFields];
          }
        } catch (error) {
          console.error('Error loading dynamic fields:', error);
        }
      }

      setDynFields(newDynFields);
    };

    processItems();
  }, [value, config.dynFormSearchKey, config.dynFormObjectRoot, config.fields, arrayIndicesAreKeys, compositeKey]);

  // Restore last open accordion state
  useEffect(() => {
    if (!shouldSaveAccordionState) return;

    service.api.getCurrentFormAccordionIndex().then((pathPlusIndex) => {
      if (typeof pathPlusIndex === 'string' && pathPlusIndex) {
        const arr = pathPlusIndex.split(' ');
        const index = parseInt(arr[1], 10);

        if (arr.length === 2 && index >= 0 && arr[0] === compositeKey) {
          setExpandedIndex(index);
        }
      }
    });
  }, [compositeKey, shouldSaveAccordionState]);

  // Get item label from arrayTitle field
  const getItemLabel = useCallback((item: Record<string, unknown>, index: number | string): string => {
    if (arrayTitleField && item[arrayTitleField.key]) {
      const label = String(item[arrayTitleField.key]);
      return label.length > 100 ? label.substring(0, 100) + '...' : label;
    }
    return arrayIndicesAreKeys ? String(index) : `Item ${Number(index) + 1}`;
  }, [arrayTitleField, arrayIndicesAreKeys]);

  // Handle adding a new item
  const handleAdd = useCallback(() => {
    const newItem: Record<string, unknown> = {};

    // Initialize with defaults from field definitions
    const fields = config.fields as Field[] | undefined;
    fields?.forEach((f) => {
      if ('default' in f && f.default !== undefined) {
        newItem[f.key] = f.default;
      }
    });

    if (arrayIndicesAreKeys) {
      const objValue = normalizedValue as Record<string, Record<string, unknown>>;
      const newKey = `key-${Math.random().toString(36).substring(2, 11)}`;
      setValue({ ...objValue, [newKey]: newItem });
    } else {
      const arrValue = normalizedValue as Record<string, unknown>[];
      setValue([...arrValue, newItem]);
    }
  }, [config.fields, arrayIndicesAreKeys, normalizedValue, setValue]);

  // Handle deleting an item
  const handleDelete = useCallback((indexOrKey: number | string) => {
    if (arrayIndicesAreKeys) {
      const objValue = { ...(normalizedValue as Record<string, Record<string, unknown>>) };
      delete objValue[String(indexOrKey)];
      setValue(objValue);
    } else {
      const arrValue = [...(normalizedValue as Record<string, unknown>[])];
      arrValue.splice(Number(indexOrKey), 1);
      setValue(arrValue);
    }
  }, [arrayIndicesAreKeys, normalizedValue, setValue]);

  // Handle swapping items (for drag and drop)
  const handleSwap = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || arrayIndicesAreKeys) return;

    const arrValue = [...(normalizedValue as Record<string, unknown>[])];
    const temp = arrValue[fromIndex];
    arrValue[fromIndex] = arrValue[toIndex];
    arrValue[toIndex] = temp;
    setValue(arrValue);
  }, [arrayIndicesAreKeys, normalizedValue, setValue]);

  // Drag and drop handlers
  const handleDragStart = useCallback((index: number) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      // Update both state (for rendering) and refs (for event handler)
      setDragFromIndex(index);
      setDragToIndex(index);
      dragFromIndexRef.current = index;
      dragToIndexRef.current = index;
      setExpandedIndex(null); // Collapse during drag

      // Add document mouseup listener
      const mouseUpHandler = () => {
        const fromIdx = dragFromIndexRef.current;
        const toIdx = dragToIndexRef.current;

        if (fromIdx !== null && toIdx !== null && fromIdx !== toIdx) {
          handleSwap(fromIdx, toIdx);
        }

        // Clear both state and refs
        setDragFromIndex(null);
        setDragToIndex(null);
        dragFromIndexRef.current = null;
        dragToIndexRef.current = null;
        document.removeEventListener('mouseup', mouseUpHandler);
      };

      document.addEventListener('mouseup', mouseUpHandler);
    };
  }, [handleSwap]);

  const handleDragEnter = useCallback((index: number) => {
    return () => {
      if (dragFromIndexRef.current !== null) {
        // Update both state (for rendering) and ref (for event handler)
        setDragToIndex(index);
        dragToIndexRef.current = index;
      }
    };
  }, []);

  // Handle accordion expand/collapse change
  const handleAccordionChange = useCallback((index: number) => {
    const newIndex = expandedIndex === index ? null : index;
    setExpandedIndex(newIndex);

    if (shouldSaveAccordionState && newIndex !== null) {
      service.api.setCurrentFormAccordionIndex(`${compositeKey} ${newIndex}`);
    }
  }, [expandedIndex, shouldSaveAccordionState, compositeKey]);

  // Toggle expanded view
  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setExpandedIndex(null);
    }
  }, [isExpanded]);

  // Get fields for a specific item (with dynamic fields support)
  const getFieldsForItem = useCallback((componentKey: string): Field[] => {
    if (dynFieldsEmpty.length > 0 && componentKey in dynFields) {
      return dynFields[componentKey] as Field[];
    }
    return (dynFieldsEmpty.length > 0 ? dynFieldsEmpty : config.fields) as Field[];
  }, [dynFields, dynFieldsEmpty, config.fields]);

  // Determine item count for display
  const itemCount = items.length;

  // Collapsed view - just show item count
  if (!isExpanded) {
    return (
      <List style={{ marginBottom: 16, padding: 0 }}>
        <ListItem disablePadding>
          <ListItemButton
            style={{
              padding: '20px 16px',
              border: 'solid 1px #d8d8d8',
              borderRadius: '7px',
            }}
            onClick={handleToggleExpand}
          >
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText
              primary={config.title ?? config.key}
              secondary={`${itemCount} items`}
            />
            <ChevronRightIcon />
          </ListItemButton>
        </ListItem>
      </List>
    );
  }

  // Determine the path for child fields
  const childPath = compositeKey.replace(/^root\./, '');

  // Check if sorting is enabled
  const enableSort = !arrayIndicesAreKeys && config.disableSort !== true;

  // Expanded view - show accordion items
  return (
    <>
      <List style={{ marginBottom: 0, padding: 0 }}>
        <ListItem disablePadding>
          <ListItemButton
            style={{
              padding: '20px 16px',
              border: 'solid 1px #d8d8d8',
              borderRadius: '7px 7px 0 0',
            }}
            onClick={handleToggleExpand}
          >
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary={config.title ?? config.key} />
            <ExpandMoreIcon />
          </ListItemButton>
        </ListItem>
      </List>

      <div
        style={{
          border: 'solid 1px #d8d8d8',
          borderTop: 'none',
          borderRadius: '0 0 7px 7px',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <Accordion
          index={expandedIndex}
          onChange={handleAccordionChange}
        >
          {items.map(([keyOrIndex, item], index) => {
            const componentKey = `item-${keyOrIndex}`;
            const itemPath = arrayIndicesAreKeys
              ? `${childPath}.${keyOrIndex}`
              : `${childPath}[${index}]`;
            const itemData = item as Record<string, unknown>;
            const itemDisabled = itemData.disabled === true;

            // Get the fields for this item (may include dynamic fields)
            const itemFields = getFieldsForItem(componentKey);

            // Calculate head style
            let headStyle: React.CSSProperties = {
              backgroundColor: headerBackgroundColor,
            };

            // Style for dragging item
            if (index === dragFromIndex) {
              headStyle = {
                ...headStyle,
                backgroundColor: '#e2e2e2',
                opacity: 0.5,
              };
            }

            // Style for disabled items
            if (itemDisabled) {
              headStyle = {
                ...headStyle,
                color: '#cccccc',
              };
            }

            // Render drag indicator bar
            let beforeItem: React.ReactNode = null;
            let afterItem: React.ReactNode = null;

            if (dragFromIndex !== null && dragToIndex !== null && index === dragToIndex && dragFromIndex !== dragToIndex) {
              const indicator = (
                <div
                  style={{
                    margin: '18px 0',
                    height: '8px',
                    background: '#00bcd4',
                    borderRadius: 3,
                  }}
                />
              );

              if (dragFromIndex < dragToIndex) {
                afterItem = indicator;
              } else {
                beforeItem = indicator;
              }
            }

            const accordionItem = (
              <AccordionItem
                key={componentKey}
                label={getItemLabel(itemData, arrayIndicesAreKeys ? keyOrIndex : index)}
                headStyle={headStyle}
                bodyStyle={{ padding: '16px 16px 0px 16px' }}
                body={renderFields(itemPath, itemFields)}
                active={expandedIndex === index}
                onHeadClick={() => handleAccordionChange(index)}
                wrapperProps={{
                  onMouseEnter: handleDragEnter(index),
                }}
                headerRightItems={[
                  enableSort && (
                    <IconButton
                      key="drag"
                      size="small"
                      style={{ minWidth: 40, cursor: 'move' }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={handleDragStart(index)}
                      aria-label="sort"
                    >
                      <DragHandleIcon />
                    </IconButton>
                  ),
                  config.disableDelete !== true && (
                    <DangerButton
                      key="delete"
                      onClick={(e: React.MouseEvent, loaded: boolean) => {
                        e.stopPropagation();
                        if (loaded) {
                          handleDelete(arrayIndicesAreKeys ? keyOrIndex : index);
                        }
                      }}
                      loadedProps={{}}
                      loadedButton={
                        <IconButton size="small" color="secondary" aria-label="delete">
                          <ClearIcon />
                        </IconButton>
                      }
                      button={
                        <IconButton size="small" aria-label="delete">
                          <ClearIcon />
                        </IconButton>
                      }
                    />
                  ),
                ].filter(Boolean)}
              />
            );

            // If we need to show drag indicators, wrap in Fragment
            if (beforeItem || afterItem) {
              return (
                <Box key={componentKey}>
                  {beforeItem}
                  {accordionItem}
                  {afterItem}
                </Box>
              );
            }

            return accordionItem;
          })}
        </Accordion>

        {config.disableCreate !== true && (
          <Button
            style={{ marginTop: 10 }}
            endIcon={<AddIcon />}
            variant="contained"
            onClick={handleAdd}
          >
            Add
          </Button>
        )}
      </div>
    </>
  );
}

export default AccordionField;
