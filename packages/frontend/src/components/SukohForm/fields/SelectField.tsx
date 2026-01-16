import { useState, useEffect } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';
import { useField, useFormState } from '../useField';
import service from '../../../services/service';
import type { SelectField as SelectFieldConfig } from '@quiqr/types';

type SelectOption = string | number | { value: string | number; text: string };

interface Props {
  compositeKey: string;
}

function getOptionValue(option: SelectOption): string | number {
  if (typeof option === 'string' || typeof option === 'number') {
    return option;
  }
  return option.value;
}

function getOptionLabel(option: SelectOption): string {
  if (typeof option === 'string' || typeof option === 'number') {
    return String(option);
  }
  return option.text;
}

/**
 * SelectField - dropdown selection field.
 * Supports single and multiple selection with optional image previews.
 */
function SelectField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<string | string[]>(compositeKey);
  const { saveForm } = useFormState();
  const config = field as SelectFieldConfig;

  const [optionImages, setOptionImages] = useState<Record<string, string>>({});

  const isMultiple = config.multiple === true;
  const currentValue = value ?? (isMultiple ? [] : '');

  // Load option images if configured
  useEffect(() => {
    if (typeof config.option_image_path === 'string' && config.options) {
      service.api.getCurrentSiteKey().then((currentSiteKey) => {
        config.options.forEach((option) => {
          const optValue = getOptionValue(option);
          const imagePath = `${config.option_image_path}/${optValue}.${config.option_image_extension}`;
          service.api.getThumbnailForPath(currentSiteKey, 'source', imagePath).then((img) => {
            setOptionImages((prev) => ({ ...prev, [String(optValue)]: img }));
          });
        });
      });
    }
  }, [config.option_image_path, config.option_image_extension, config.options]);

  const handleChange = (e: SelectChangeEvent<string | string[]>) => {
    if (e.target.value !== currentValue) {
      setValue(e.target.value as string | string[]);
    }

    if (config.autoSave === true) {
      saveForm();
    }
  };

  const showImage = typeof config.option_image_path === 'string';
  const optionImageWidth = config.option_image_width ?? 20;

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  return (
    <FormItemWrapper
      control={
        <FormControl>
          <InputLabel>{config.title ?? config.key}</InputLabel>
          <Select
            multiple={isMultiple}
            value={currentValue}
            onChange={handleChange}
            label={config.title ?? config.key}
          >
            {config.options.map((option, i) => {
              const optValue = getOptionValue(option);
              const optLabel = getOptionLabel(option);

              return (
                <MenuItem key={i} value={optValue}>
                  {showImage ? (
                    <Box component="div" sx={{ '& > img': { mr: 2, flexShrink: 0 } }}>
                      <img
                        alt=""
                        loading="lazy"
                        width={optionImageWidth}
                        src={optionImages[String(optValue)]}
                      />
                      &nbsp;{optLabel}
                    </Box>
                  ) : (
                    optLabel
                  )}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      }
      iconButtons={iconButtons}
    />
  );
}

export default SelectField;
