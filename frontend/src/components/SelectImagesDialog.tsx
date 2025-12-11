import { useState, useEffect } from 'react';
import IconBroken from '@mui/icons-material/BrokenImage';
import FolderOpen from '@mui/icons-material/FolderOpen';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Spinner from './Spinner';
import service from '../services/service';

const extensions = ['gif', 'png', 'svg', 'jpg', 'jpeg'];

type ImageThumbProps = {
  getBundleThumbnailSrc: (imagePath: string) => Promise<string>;
  imagePath: string;
  onClick?: () => void;
};

function ImageThumb({ getBundleThumbnailSrc, imagePath }: ImageThumbProps) {
  const [src, setSrc] = useState<string | null | 'NOT_FOUND' | undefined>(null);

  useEffect(() => {
    getBundleThumbnailSrc(imagePath).then((result) => {
      setSrc(result);
    });
  }, [getBundleThumbnailSrc, imagePath]);

  return (
    <div
      className="checkered"
      style={{ maxWidth: '200px', height: 'auto', marginBottom: '0px', overflow: 'hidden', backgroundColor: '#ccc' }}
    >
      {src === undefined ? (
        <Spinner size={32} margin={'16px'} color={'RGBA(255,255,255,.3)'} />
      ) : src === 'NOT_FOUND' ? (
        <IconBroken className="fadeIn animated" style={{ width: 32, height: 32, margin: 16, color: '#e84b92' }} />
      ) : (
        <img src={src} alt="" className="fadeIn animated" style={{ cursor: 'pointer', width: '100%', marginBottom: '-7px' }} />
      )}
    </div>
  );
}

interface DialogConf {
  visible: boolean;
  title: string;
}

interface FormProps {
  siteKey: string;
  workspaceKey: string;
  collectionKey?: string;
  collectionItemKey?: string;
}

interface ImageItem {
  filename: string;
  src: string;
}

type SelectImagesDialogProps = {
  conf: DialogConf;
  formProps: FormProps;
  uploadPath: string;
  reload: () => void;
  style?: React.CSSProperties;
  imageItems: ImageItem[];
  getBundleThumbnailSrc: (imagePath: string) => Promise<string>;
  handleSelect: (filename: string) => void;
  handleClose: () => void;
};

function getExt(file: string) {
  return file.split('.').pop()?.toLowerCase() || '';
}

function isImage(file: string) {
  if (file) {
    if (extensions.includes(getExt(file))) {
      return true;
    }
  }
  return false;
}

function SelectImagesDialog({
  conf,
  formProps,
  uploadPath,
  reload,
  style,
  imageItems,
  getBundleThumbnailSrc,
  handleSelect,
  handleClose,
}: SelectImagesDialogProps) {
  const handleAddFile = () => {
    service.api
      .openFileDialogForSingleAndCollectionItem(
        formProps.siteKey,
        formProps.workspaceKey,
        formProps.collectionKey,
        formProps.collectionItemKey,
        uploadPath,
        { title: 'Select File to add', extensions: extensions }
      )
      .then(() => {
        reload();
      });
  };

  return (
    <Dialog
      open={conf.visible}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth="lg"
    >
      <DialogTitle id="alert-dialog-title">{conf.title}</DialogTitle>
      <DialogContent>
        <Button startIcon={<FolderOpen />} variant="contained" onClick={handleAddFile}>
          Add File
        </Button>

        <Grid container spacing={2} className="BundleManager" style={style}>
          {imageItems.map((item, index) => {
            let filename = item.filename;
            const fExtention = filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
            const fBase = filename.slice(0, filename.lastIndexOf('.'));

            if (fBase.length > 15) {
              filename = fBase.substring(0, 7) + '...' + fBase.substring(fBase.length - 5) + '.' + fExtention;
            }

            if (isImage(item.filename)) {
              return (
                <Grid size={{ xl: 2, lg: 4, xs: 6 }} className="BundleManager-item" key={'imageitem-' + index}>
                  <Button title={fBase} onClick={() => handleSelect(item.filename)} color="primary">
                    {filename}
                  </Button>
                  <Button onClick={() => handleSelect(item.filename)}>
                    <ImageThumb getBundleThumbnailSrc={getBundleThumbnailSrc} imagePath={item.src} />
                  </Button>
                </Grid>
              );
            } else {
              return null;
            }
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SelectImagesDialog;
