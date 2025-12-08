import { useState, useEffect, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';
import { useField } from '../useField';
import service from '../../../services/service';
import type { SelectFromQueryField as SelectFromQueryFieldConfig } from '@quiqr/types';

type SelectOption = string | { value: string; text: string };

interface Props {
  compositeKey: string;
}

function getOptionValue(option: SelectOption): string {
  if (typeof option === 'string') {
    return option;
  }
  return option.value;
}

function getOptionLabel(option: SelectOption): string {
  if (typeof option === 'string') {
    return option;
  }
  return option.text;
}

/**
 * SelectFromQueryField - dropdown selection field with options populated from file queries.
 * Supports querying file names, parent directories, or file content to build option lists.
 * Can optionally show images for each option.
 */
function SelectFromQueryField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<string | string[]>(compositeKey);
  const config = field as SelectFromQueryFieldConfig;

  const [options, setOptions] = useState<SelectOption[]>([]);
  const [optionImages, setOptionImages] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMultiple = config.multiple === true;
  const currentValue = value ?? (isMultiple ? [] : '');

  const setOptionImagesForOptions = useCallback(async (opts: SelectOption[]) => {
    if (typeof config.option_image_path !== 'string') return;

    const currentSiteKey = await service.api.getCurrentSiteKey();

    for (const option of opts) {
      const optValue = getOptionValue(option);
      const imagePath = `${config.option_image_path}/${optValue}.${config.option_image_extension}`;
      const img = await service.api.getThumbnailForPath(currentSiteKey, 'source', imagePath);
      setOptionImages((prev) => ({ ...prev, [optValue]: img }));
    }
  }, [config.option_image_path, config.option_image_extension]);

  const parseFileMetaDataQuery = useCallback((queryString: string, files: string[]): string[] => {
    const opts: string[] = [];

    for (const filepath of files) {
      const parts = filepath.split('/').reverse();

      if (queryString === '#parent_dir[]') {
        opts.push(parts[1]);
      } else if (queryString === '#file_name[]') {
        opts.push(parts[0]);
      } else if (queryString === '#file_base_name[]') {
        const baseName = parts[0].replace(/\.[^/.]+$/, '');
        opts.push(baseName);
      } else {
        setErrorMsg('File meta data query could not be parsed. Syntax Error?');
        return [];
      }
    }

    return opts;
  }, []);

  const parseFileContentDataQuery = useCallback(async (queryString: string, files: string[]): Promise<SelectOption[]> => {
    console.log('[SelectFromQueryField] parseFileContentDataQuery called with:', { queryString, files });

    if (files.length > 1) {
      setErrorMsg('Object queries are currently only possible in max. 1 file.');
      return [];
    }

    if (files.length === 0) {
      console.log('[SelectFromQueryField] No files to parse');
      return [];
    }

    const dotCount = (queryString.match(/\./g) || []).length;
    console.log('[SelectFromQueryField] Dot count:', dotCount);

    if (dotCount === 1 && queryString.slice(-2) === '[]') {
      const filepath = files[0];
      console.log('[SelectFromQueryField] Parsing file:', filepath);
      const parsedFileObject = await service.api.parseFileToObject(filepath);
      console.log('[SelectFromQueryField] Parsed file object:', parsedFileObject);
      const key = queryString.slice(1, -2);
      console.log('[SelectFromQueryField] Extracting key:', key);
      const result = parsedFileObject[key] || [];
      console.log('[SelectFromQueryField] Extracted result:', result);
      return result;
    } else {
      setErrorMsg("Other queries than '.key[]' are currently not supported.");
      return [];
    }
  }, []);

  const runQuery = useCallback(async () => {
    const currentSiteKey = await service.api.getCurrentSiteKey();

    console.log('[SelectFromQueryField] Running query with config:', {
      query_glob: config.query_glob,
      query_string: config.query_string,
      currentSiteKey,
    });

    try {
      const files = await service.api.globSync(config.query_glob, {});
      console.log('[SelectFromQueryField] Files found (count: ' + files.length + '):', files);

      let opts: SelectOption[] = [];

      if (config.query_string.startsWith('#')) {
        opts = parseFileMetaDataQuery(config.query_string, files);
        console.log('[SelectFromQueryField] Parsed metadata options:', opts);
        setOptions(opts);
        setOptionImagesForOptions(opts);
      } else if (config.query_string.startsWith('.')) {
        opts = await parseFileContentDataQuery(config.query_string, files);
        console.log('[SelectFromQueryField] Parsed content options:', opts);
        setOptions(opts);
        setOptionImagesForOptions(opts);
      } else {
        console.log('[SelectFromQueryField] Invalid query_string - does not start with . or #');
        setErrorMsg("Query did not start with '.' or '#'");
      }
    } catch (err) {
      console.error('[SelectFromQueryField] Query failed:', err);
      setOptions([]);
      setErrorMsg('Query failed while searching for file(s)');
      service.api.logToConsole('Query failed while searching for file(s)');
    }
  }, [config.query_glob, config.query_string, parseFileMetaDataQuery, parseFileContentDataQuery, setOptionImagesForOptions]);

  useEffect(() => {
    runQuery();
  }, [runQuery]);

  const handleChange = (_: unknown, newValue: SelectOption | SelectOption[] | null) => {
    if (isMultiple) {
      const values = (newValue as SelectOption[] || []).map(getOptionValue);
      setValue(values);
    } else {
      setValue(newValue ? getOptionValue(newValue as SelectOption) : '');
    }
  };

  const showImage = typeof config.option_image_path === 'string';
  const optionImageWidth = config.option_image_width ?? 20;

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  if (errorMsg) {
    return <Typography color="error">{errorMsg}</Typography>;
  }

  return (
    <FormItemWrapper
      style={{ paddingTop: '20px' }}
      control={
        <Autocomplete<SelectOption, boolean>
          id={`autocomplete-${compositeKey}`}
          multiple={isMultiple}
          options={options}
          value={currentValue as SelectOption | SelectOption[]}
          onChange={handleChange}
          getOptionLabel={(option) => getOptionLabel(option)}
          isOptionEqualToValue={(option, val) => {
            if (typeof option === 'string' && typeof val === 'string') {
              return option === val;
            }
            return getOptionValue(option) === getOptionValue(val);
          }}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
            const optValue = getOptionValue(option);
            const optLabel = getOptionLabel(option);

            if (showImage) {
              return (
                <Box component="li" key={key} {...otherProps} sx={{ '& > img': { mr: 2, flexShrink: 0 } }}>
                  <img
                    alt=""
                    loading="lazy"
                    width={optionImageWidth}
                    src={optionImages[optValue]}
                  />
                  &nbsp;{optLabel}
                </Box>
              );
            }
            return (
              <Box component="li" key={key} {...otherProps}>
                {optLabel}
              </Box>
            );
          }}
          renderInput={(params) => {
            if (showImage && !isMultiple && currentValue) {
              return (
                <Box component="div" sx={{ '& > img': { pb: 4, flexShrink: 0 } }}>
                  <TextField {...params} label={config.title ?? config.key} variant="outlined" />
                  <div>&nbsp;</div>
                  <img
                    loading="lazy"
                    width={optionImageWidth}
                    src={optionImages[currentValue as string]}
                    alt=""
                  />
                </Box>
              );
            }
            return <TextField {...params} label={config.title ?? config.key} variant="outlined" />;
          }}
        />
      }
      iconButtons={iconButtons}
    />
  );
}

export default SelectFromQueryField;
