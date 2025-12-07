import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from 'react';
import { useField, useRenderFields } from '../useField';
import { useFormContext, FileReference } from '../FormContext';
import service from '../../../services/service';
import type { BundleManagerField as BundleManagerFieldConfig, Field } from '@quiqr/types';
import { BundleManager, BundleManagerItem } from '../../BundleManager';
import DangerButton from '../../DangerButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FolderOpen from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';

// Browser-compatible path join utility
const pathJoin = (...parts: string[]): string => {
  return parts.join('/').replace(/\/+/g, '/').replace(/\/$/, '') || '/';
};

// Extract file extension
const extractExt = (file: string): string => {
  const match = file.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
};

// Extended type for soft deletion tracking
interface FileReferenceWithDeleted extends FileReference {
  __deleted?: boolean;
  name?: string;
}

interface Props {
  compositeKey: string;
}

function BundleManagerField({ compositeKey }: Props) {
  const { field, meta } = useField<FileReference[]>(compositeKey);
  const { setResources } = useFormContext();
  const renderFields = useRenderFields();
  const config = field as BundleManagerFieldConfig;

  // Local state for file management (with deletion tracking)
  const [absFiles, setAbsFiles] = useState<FileReferenceWithDeleted[]>([]);

  // Get value path from compositeKey
  const valuePath = compositeKey.replace(/^root\./, '');

  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files on mount
  useEffect(() => {
    const loadFiles = async () => {
      const fieldPath = config.path;

      try {
        let mappedFiles: FileReferenceWithDeleted[] = [];

        if (fieldPath.charAt(0) === '/' || fieldPath.charAt(0) === '\\') {
          // Absolute path - load from filesystem
          const files = await service.api.getFilesFromAbsolutePath(fieldPath);
          if (absFiles.length === 0) {
            mappedFiles = files.map((item: { src: string }) => ({
              ...item,
              src: pathJoin(fieldPath, item.src)
            }));
            setAbsFiles(mappedFiles);
          }
        } else {
          // Relative path - load from bundle
          const files = await service.api.getFilesInBundle(
            meta.siteKey,
            meta.workspaceKey,
            meta.collectionKey,
            meta.collectionItemKey,
            fieldPath,
            config.extensions || [],
            config.forceFileName || ''
          );
          if (absFiles.length === 0) {
            mappedFiles = files.map((item: { src: string }) => ({
              ...item,
              src: pathJoin(item.src)
            }));
            setAbsFiles(mappedFiles);
          }
        }

        // Sync resources for nested fields (like BundleImgThumbField)
        // Pass false to avoid marking form dirty on initial load
        if (mappedFiles.length > 0) {
          setResources(compositeKey, mappedFiles, false);
        }
      } catch (error) {
        console.error('Error loading bundle files:', error);
      }
    };

    loadFiles();
  }, [config.path, config.extensions, config.forceFileName, meta.siteKey, meta.workspaceKey, meta.collectionKey, meta.collectionItemKey, compositeKey, setResources]);

  // Trigger native file picker
  const handleAddFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle file selection from native picker
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const currentFiles = [...absFiles];

    for (const file of Array.from(selectedFiles)) {
      // Read file as base64
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g., "data:image/png;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Determine filename
      const filename = config.forceFileName
        ? `${config.forceFileName}.${file.name.split('.').pop()}`
        : file.name;

      try {
        // Upload file to bundle
        const uploadedPath = await service.api.uploadFileToBundlePath(
          meta.siteKey,
          meta.workspaceKey,
          meta.collectionKey,
          meta.collectionItemKey,
          config.path,
          filename,
          base64Content
        );

        // Check if file already exists in list
        const match = currentFiles.find(x => x.src === uploadedPath);
        if (match) {
          if (match.__deleted) delete match.__deleted;
        } else {
          currentFiles.push({ src: uploadedPath });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setAbsFiles(currentFiles);
    setResources(compositeKey, currentFiles.filter(f => !f.__deleted));

    // Clear input for re-selection of same file
    e.target.value = '';
  }, [absFiles, config.path, config.forceFileName, meta, compositeKey, setResources]);

  // Build accept string from extensions
  const acceptExtensions = useMemo(() => {
    if (!config.extensions?.length) return undefined;
    return config.extensions.map(ext => `.${ext}`).join(',');
  }, [config.extensions]);

  // Remove file handler - deletes from disk and updates state
  const handleRemoveFile = useCallback(async (fileToRemove: FileReferenceWithDeleted) => {
    // Extract filename from the src path
    const filename = fileToRemove.src.split('/').pop() || '';

    try {
      // Call API to delete file from disk
      await service.api.deleteFileFromBundle(
        meta.siteKey,
        meta.workspaceKey,
        meta.collectionKey,
        meta.collectionItemKey,
        config.path,
        filename
      );

      // Update local state after successful deletion
      const updatedFiles = absFiles.map(f =>
        f.src === fileToRemove.src ? { ...f, __deleted: true } : f
      );
      setAbsFiles(updatedFiles);
      setResources(compositeKey, updatedFiles.filter(f => !f.__deleted));
    } catch (error) {
      console.error('Error deleting file from bundle:', error);
      // Still update local state to allow user to continue working
      const updatedFiles = absFiles.map(f =>
        f.src === fileToRemove.src ? { ...f, __deleted: true } : f
      );
      setAbsFiles(updatedFiles);
      setResources(compositeKey, updatedFiles.filter(f => !f.__deleted));
    }
  }, [absFiles, compositeKey, setResources, meta, config.path]);

  // Filter visible items (not deleted, matching extensions)
  const visibleItems = useMemo(() => {
    return absFiles.filter(file => {
      if (file.__deleted) return false;
      // Extension filtering if configured
      if (config.extensions?.length) {
        const ext = extractExt(file.src);
        return config.extensions.includes(ext);
      }
      return true;
    });
  }, [absFiles, config.extensions]);

  // Determine if add button should show
  const showAddButton = useMemo(() => {
    const effectiveMaxItems = config.forceFileName ? 1 : config.maxItems;
    if (effectiveMaxItems && typeof effectiveMaxItems === 'number') {
      return visibleItems.length < effectiveMaxItems;
    }
    return true;
  }, [visibleItems.length, config.maxItems, config.forceFileName]);

  // Render nested fields for each file item
  const renderFileItem = useCallback((_file: FileReferenceWithDeleted, index: number) => {
    const itemPath = `${valuePath}[${index}]`;
    const itemFields = (config.fields as Field[]) || [];

    if (itemFields.length === 0) {
      return null;
    }

    return renderFields(itemPath, itemFields);
  }, [valuePath, config.fields, renderFields]);

  return (
    <Fragment>
      {/* Hidden file input for native picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptExtensions}
        multiple={!config.forceFileName && (!config.maxItems || config.maxItems > 1)}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <Box sx={{ padding: '16px 0' }}>
        <Typography component="strong" sx={{ fontWeight: 'bold' }}>
          {config.title || 'Page files'}
        </Typography>
        {config.path.startsWith('/') && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <IconButton
              color="primary"
              onClick={() => service.api.openFileExplorer(config.path, false)}
              size="large"
            >
              <FolderIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {config.path}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Add button (top position) */}
      {showAddButton && config.addButtonLocationTop && (
        <Button
          sx={{ mb: 2, display: 'inline-flex', width: 'fit-content' }}
          startIcon={<FolderOpen />}
          variant="contained"
          onClick={handleAddFile}
        >
          Add File
        </Button>
      )}

      {/* File list */}
      <BundleManager forceActive>
        {visibleItems.map((file, index) => (
          <BundleManagerItem
            key={`${config.key}-resource-${index}`}
            label={file.name || file.src}
            path={file.src}
            forceActive
            body={renderFileItem(file, index)}
            active={false}
            onHeadClick={() => {}}
            headerRightItems={[
              <DangerButton
                key="delete"
                onClick={(e: React.MouseEvent, loaded: boolean) => {
                  e.stopPropagation();
                  if (loaded) handleRemoveFile(file);
                }}
                loadedProps={{}}
                loadedButton={<IconButton size="small" color="secondary"><DeleteIcon /></IconButton>}
                button={<IconButton size="small"><DeleteIcon /></IconButton>}
              />
            ]}
          />
        ))}
      </BundleManager>

      {/* Add button (bottom position) */}
      {showAddButton && !config.addButtonLocationTop && (
        <Button
          sx={{ mb: 2, mt: visibleItems.length ? 0 : undefined, display: 'inline-flex', width: 'fit-content' }}
          startIcon={<FolderOpen />}
          variant="contained"
          onClick={handleAddFile}
        >
          Add File
        </Button>
      )}
    </Fragment>
  );
}

export default BundleManagerField;
