import { useState, useEffect } from 'react';
import IconBroken from '@mui/icons-material/BrokenImage';
import MovieIcon from '@mui/icons-material/Movie';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useField } from '../useField';
import { useFormContext } from '../FormContext';
import Spinner from '../../Spinner';
import service from '../../../services/service';

// Field config interface
interface BundleImgThumbFieldConfig {
  key: string;
  type: string;
  src?: string; // Key of sibling field containing the source path
}

interface Props {
  compositeKey: string;
}

// File type detection utilities
const getExt = (file: string): string => {
  if (typeof file === 'string') {
    return file.split('.').pop()?.toLowerCase() || '';
  }
  return '';
};

const isImage = (file: string): boolean => {
  if (file) {
    const extname = getExt(file);
    return ['gif', 'png', 'svg', 'jpg', 'jpeg'].includes(extname);
  }
  return false;
};

const isVideo = (file: string): boolean => {
  if (file) {
    const extname = getExt(file);
    return ['mov', 'mpg', 'mpeg', 'mp4'].includes(extname);
  }
  return false;
};

const isPDF = (file: string): boolean => {
  if (file) {
    const extname = getExt(file);
    return extname === 'pdf';
  }
  return false;
};

/**
 * BundleImgThumbField - Read-only thumbnail display for bundle files.
 * Shows image preview, or file-type icons for video/PDF/other files.
 *
 * Reads the source path from the parent bundle manager's resources.
 * compositeKey format: "bundleKey[index].fieldKey" (e.g., "image[0].thumb")
 */
function BundleImgThumbField({ compositeKey }: Props) {
  const { field, meta } = useField<string>(compositeKey);
  const form = useFormContext();
  const config = field as BundleImgThumbFieldConfig;

  const [src, setSrc] = useState<string | undefined>(undefined);
  const [srcFile, setSrcFile] = useState<string | undefined>(undefined);

  // Parse compositeKey to extract bundle manager key and index
  // Format: "bundleKey[index].fieldKey" e.g., "image[0].thumb"
  const valuePath = compositeKey.replace(/^root\./, '');
  const match = valuePath.match(/^(.+?)\[(\d+)\]/);
  const bundleKey = match ? match[1] : '';
  const itemIndex = match ? parseInt(match[2], 10) : -1;

  // Get the source file path from resources
  // Resources are stored under the bundle manager's key (try with and without 'root.' prefix)
  const resources = form.getResources(`root.${bundleKey}`) || form.getResources(bundleKey) || [];
  const fileItem = itemIndex >= 0 && itemIndex < resources.length ? resources[itemIndex] : null;

  // Get src from the file reference, or from a custom field if specified
  const sourceFieldKey = config.src || 'src';
  const sourceFilePath = fileItem ? (fileItem as unknown as Record<string, unknown>)[sourceFieldKey] as string || '' : '';

  // Load thumbnail when source path changes
  useEffect(() => {
    console.log('=== BundleImgThumbField Debug ===')
    console.log('compositeKey', compositeKey)
    console.log('bundleKey', bundleKey)
    console.log('itemIndex', itemIndex)
    console.log('resources', resources)
    console.log('fileItem', fileItem)
    console.log('sourceFieldKey', sourceFieldKey)
    console.log('sourceFilePath', sourceFilePath)
    
    // Skip if no source path or not an image
    if (!sourceFilePath || !isImage(sourceFilePath)) {
      setSrc(undefined);
      setSrcFile(undefined);
      return;
    }

    // Skip if we already loaded this exact file
    if (sourceFilePath === srcFile) {
      return;
    }

    setSrcFile(sourceFilePath);
    setSrc(undefined); // Show spinner while loading

    service.api
      .getThumbnailForCollectionOrSingleItemImage(
        meta.siteKey,
        meta.workspaceKey,
        meta.collectionKey,
        meta.collectionItemKey,
        sourceFilePath
      )
      .then((thumbnail: string) => {
        setSrc(thumbnail || 'NOT_FOUND');
      })
      .catch((err) => {
        console.error('Failed to load thumbnail:', err);
        setSrc('NOT_FOUND');
      });
  }, [sourceFilePath, srcFile, meta.siteKey, meta.workspaceKey, meta.collectionKey, meta.collectionItemKey]);

  // Render based on file type
  if (isImage(sourceFilePath)) {
    return (
      <div
        className="checkered"
        style={{
          width: 'auto',
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

  if (isVideo(sourceFilePath)) {
    return (
      <div style={{ width: 'auto', height: '100%', marginBottom: '0px', overflow: 'hidden' }}>
        <MovieIcon style={{ fontSize: 120 }} color="disabled" />
      </div>
    );
  }

  if (isPDF(sourceFilePath)) {
    return (
      <div style={{ width: 'auto', height: '100%', marginBottom: '0px', overflow: 'hidden' }}>
        <PictureAsPdfIcon style={{ fontSize: 120 }} color="disabled" />
      </div>
    );
  }

  // Default: generic file icon
  return (
    <div style={{ width: 'auto', height: '100%', marginBottom: '0px', overflow: 'hidden' }}>
      <InsertDriveFileIcon style={{ fontSize: 120 }} color="disabled" />
    </div>
  );
}

export default BundleImgThumbField;
