import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@mui/material/Button';
import IconBroken from '@mui/icons-material/BrokenImage';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Spinner from '../../Spinner';
import Tip from '../../Tip';
import SelectImagesDialog from '../../SelectImagesDialog';
import { useField, useFormState } from '../useField';
import service from '../../../services/service';
import type { ImageSelectField as ImageSelectFieldConfig } from '@quiqr/types';

// Browser-compatible path join utility
const pathJoin = (...parts: string[]): string => {
  return parts.join('/').replace(/\/+/g, '/').replace(/\/$/, '') || '/';
};

interface ImageItem {
  src: string;
  filename: string;
}

interface Props {
  compositeKey: string;
}

// File type detection
const getExt = (file: string): string => {
  if (typeof file === 'string') {
    return file.split('.').pop()?.toLowerCase() || '';
  }
  return '';
};

const isImage = (file: string): boolean => {
  if (file) {
    const extname = getExt(file);
    return ['gif', 'png', 'svg', 'jpg', 'jpeg', 'webp'].includes(extname);
  }
  return false;
};

/**
 * ImageSelectField - Grid of selectable images from a configured path.
 * Opens a dialog to browse and select images, shows thumbnail preview.
 */
function ImageSelectField({ compositeKey }: Props) {
  const { field, value, setValue, meta } = useField<string>(compositeKey);
  const { saveForm } = useFormState();
  const config = field as ImageSelectFieldConfig;

  const [absFiles, setAbsFiles] = useState<ImageItem[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [srcFile, setSrcFile] = useState<string | undefined>(undefined);

  // Ensure currentValue is always a string
  const rawDefault = config.default;
  const defaultValue = typeof rawDefault === 'string' ? rawDefault : '';
  const currentValue = typeof value === 'string' ? value : defaultValue;

  // Load files from path
  const loadFiles = useCallback(async (reload = false) => {
    let fieldPath = config.path;

    if (config.path.charAt(0) === '/' || config.path.charAt(0) === '\\') {
      // Absolute path
      if (typeof config.real_fs_path === 'string') {
        fieldPath = config.real_fs_path;
      }

      try {
        const files = await service.api.getFilesFromAbsolutePath(fieldPath);
        if (absFiles.length === 0 || reload) {
          const mappedFiles = files.map((item: { src: string }) => ({
            filename: item.src,
            src: pathJoin(fieldPath, item.src),
          }));
          setAbsFiles(mappedFiles);
        }
      } catch (error) {
        console.error('Error loading files from absolute path:', error);
      }
    } else {
      // Relative path - use bundle context
      try {
        const files = await service.api.getFilesInBundle(
          meta.siteKey,
          meta.workspaceKey,
          meta.collectionKey,
          meta.collectionItemKey,
          config.path,
          config.extensions || [],
          config.forceFileName || ''
        );
        if (absFiles.length === 0 || reload) {
          const mappedFiles = files.map((item: { src: string }) => ({
            filename: item.src,
            src: pathJoin(item.src),
          }));
          setAbsFiles(mappedFiles);
        }
      } catch (error) {
        console.error('Error loading files from bundle:', error);
      }
    }
  }, [config.path, config.real_fs_path, config.extensions, config.forceFileName, meta.siteKey, meta.workspaceKey, meta.collectionKey, meta.collectionItemKey, absFiles.length]);

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Load thumbnail when value changes or refresh is triggered
  useEffect(() => {
    // Skip if no value or not an image
    if (!currentValue || !isImage(currentValue)) {
      setSrc(undefined);
      setSrcFile(undefined);
      return;
    }

    // Skip if we already loaded this exact file
    if (currentValue === srcFile) {
      return;
    }

    setSrcFile(currentValue);
    setSrc(undefined); // Show spinner while loading

    let thumbPath = currentValue;
    let fieldPath = config.path;

    if (typeof config.real_fs_path === 'string') {
      fieldPath = config.real_fs_path;
      const imgBaseName = currentValue.split('/').reverse()[0];
      thumbPath = pathJoin(fieldPath, imgBaseName);
    } else if (config.path && (config.path.charAt(0) === '/' || config.path.charAt(0) === '\\')) {
      thumbPath = pathJoin(fieldPath, currentValue);
    }

    service.api
      .getThumbnailForCollectionOrSingleItemImage(
        meta.siteKey,
        meta.workspaceKey,
        meta.collectionKey,
        meta.collectionItemKey,
        thumbPath
      )
      .then((thumbnail: string) => {
        setSrc(thumbnail || 'NOT_FOUND');
      })
      .catch((err) => {
        console.error('Failed to load thumbnail:', err);
        setSrc('NOT_FOUND');
      });
  }, [currentValue, srcFile, config.path, config.real_fs_path, meta.siteKey, meta.workspaceKey, meta.collectionKey, meta.collectionItemKey]);

  // Handle dialog close
  const handleCloseDialog = useCallback(() => {
    setDialogVisible(false);
  }, []);

  // Handle reload
  const handleReload = useCallback(() => {
    setAbsFiles([]);
    loadFiles(true);
  }, [loadFiles]);

  // Convert to publish path for saving
  const convertToPublishPath = useCallback((imageName: string): string => {
    if (typeof config.real_fs_path === 'string') {
      const imgBaseName = imageName.split('/').reverse()[0];
      return config.path + '/' + imgBaseName;
    }
    return imageName;
  }, [config.path, config.real_fs_path]);

  // Track pending autosave
  const pendingAutoSaveRef = useRef(false);

  // Handle image selection
  const handleSelect = useCallback((selected: string) => {
    const newValue = convertToPublishPath(selected);
    console.log('[ImageSelectField] handleSelect:', { selected, newValue, compositeKey, autoSave: config.autoSave });
    setValue(newValue);
    // Force thumbnail refresh by clearing srcFile
    setSrcFile(undefined);
    handleCloseDialog();
    // Mark that we need to autosave after state update
    if (config.autoSave === true) {
      pendingAutoSaveRef.current = true;
    }
  }, [setValue, convertToPublishPath, handleCloseDialog, config.autoSave, compositeKey]);

  // Effect to handle autosave after value changes
  useEffect(() => {
    if (pendingAutoSaveRef.current && currentValue) {
      console.log('[ImageSelectField] Triggering autosave for:', currentValue);
      pendingAutoSaveRef.current = false;
      // Small delay to ensure document state is fully updated
      const timeoutId = setTimeout(() => {
        saveForm();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [currentValue, saveForm]);

  // Get bundle thumbnail source
  const getBundleThumbnailSrc = useCallback((targetPath: string): Promise<string> => {
    return service.api.getThumbnailForCollectionOrSingleItemImage(
      meta.siteKey,
      meta.workspaceKey,
      meta.collectionKey,
      meta.collectionItemKey,
      targetPath
    );
  }, [meta.siteKey, meta.workspaceKey, meta.collectionKey, meta.collectionItemKey]);

  const buttonTitle = config.buttonTitle || 'Select Image';

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  // Render image preview
  const renderImage = () => {
    if (isImage(currentValue)) {
      return (
        <div
          className="checkered"
          style={{
            maxWidth: '200px',
            height: '100%',
            marginBottom: '0px',
            overflow: 'hidden',
            backgroundColor: '#ccc',
          }}
        >
          {src === undefined ? (
            <Spinner size={32} margin="16px" color="RGBA(255,255,255,.3)" />
          ) : src === 'NOT_FOUND' ? (
            <IconBroken
              className="fadeIn animated"
              style={{ width: 32, height: 32, margin: 16, color: '#e84b92' }}
            />
          ) : (
            <img
              src={src}
              alt=""
              className="fadeIn animated"
              style={{ width: '100%', marginBottom: '-4px' }}
            />
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <SelectImagesDialog
        conf={{ visible: dialogVisible, title: config.title || 'Select Image' }}
        imageItems={absFiles}
        uploadPath={config.path}
        reload={handleReload}
        formProps={{
          siteKey: meta.siteKey,
          workspaceKey: meta.workspaceKey,
          collectionKey: meta.collectionKey,
          collectionItemKey: meta.collectionItemKey,
        }}
        getBundleThumbnailSrc={getBundleThumbnailSrc}
        handleSelect={handleSelect}
        handleClose={handleCloseDialog}
      />

      <FormItemWrapper
        control={
          <label
            style={{
              alignSelf: 'stretch',
              display: 'block',
              lineHeight: '22px',
              fontSize: 12,
              pointerEvents: 'none',
              userSelect: 'none',
              color: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            {config.title}
          </label>
        }
        iconButtons={iconButtons}
      />

      <div style={{ paddingBottom: '10px' }}>
        {renderImage()}

        <Button
          style={{ marginTop: '5px' }}
          variant="contained"
          color="primary"
          onClick={() => setDialogVisible(true)}
        >
          {buttonTitle}
        </Button>
      </div>
    </div>
  );
}

export default ImageSelectField;
