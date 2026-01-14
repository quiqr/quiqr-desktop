import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import service from './../../../../services/service';

//GitHub Target
import { FormConfig as GitHubPagesForm } from '../syncTypes/github';
import * as GitHubMeta from '../syncTypes/github/Meta';
import { CardNew as CardNewGitHub } from '../syncTypes/github';

//System Git Target
import { FormConfig as SysGitForm } from '../syncTypes/sysgit';
import { CardNew as CardNewSysGit } from '../syncTypes/sysgit';
import * as SysGitMeta from '../syncTypes/sysgit/Meta';

//Folder Target
import * as FolderMeta from '../syncTypes/folder/Meta';
import { FormConfig as FolderExportForm } from '../syncTypes/folder';
import { CardNew as CardNewFolder } from '../syncTypes/folder';

interface PublishConfBase {
  key: string;
  config: {
    type: string;
    [key: string]: unknown;
  };
}

interface SyncConfigDialogProps {
  open?: boolean;
  site: {
    key: string;
    publish: Array<{
      key: string;
      config: unknown;
    }>;
  };
  publishConf?: PublishConfBase;
  modAction?: string;
  closeText?: string;
  onClose: () => void;
  onSave: (inkey: string) => void;
}

type DialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

function SyncConfigDialog({
  open,
  site,
  publishConf,
  modAction,
  closeText,
  onClose,
  onSave,
}: SyncConfigDialogProps) {
  const [serverType, setServerType] = useState<string | null>(null);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [pubData, setPubData] = useState<unknown>({});
  const [dialogSize, setDialogSize] = useState<DialogSize>('sm');
  const [publishKey, setPublishKey] = useState<string | undefined>();

  useEffect(() => {
    if (publishConf) {
      setServerType(publishConf.config.type);
      setPublishKey(publishConf.key);
      setDialogSize('md');
    }
  }, [publishConf]);

  const savePublishData = async (inkey: string | undefined, data: unknown) => {
    let key = inkey;
    if (!key) {
      key = `publ-${Math.random()}`;
    }

    const publConfIndex = site.publish.findIndex(({ key: k }) => k === key);
    if (publConfIndex !== -1) {
      site.publish[publConfIndex] = { key, config: data };
    } else {
      site.publish.push({ key, config: data });
    }

    await service.api.saveSiteConf(site.key, site);
    onSave(key);
  };

  const selectServerType = (type: string) => {
    setServerType(type);
    setDialogSize('md');
  };

  const renderServerCards = () => {
    const sysGitBinAvailable = true;
    return (
      <Grid container spacing={2}>
        {sysGitBinAvailable && (
          <Grid size={6}>
            <CardNewSysGit handleClick={() => selectServerType('sysgit')} />
          </Grid>
        )}

        <Grid size={6}>
          <CardNewGitHub handleClick={() => selectServerType('github')} />
        </Grid>

        <Grid size={6}>
          <CardNewFolder handleClick={() => selectServerType('folder')} />
        </Grid>
      </Grid>
    );
  };

  let content: React.ReactNode = null;
  let serverFormLogo: React.ReactNode = null;
  let saveButtonHidden = true;
  let configDialogTitle = '';

  if (serverType) {
    if (serverType === 'github') {
      configDialogTitle = GitHubMeta.configDialogTitle;
      serverFormLogo = GitHubMeta.icon();
      content = (
        <GitHubPagesForm
          publishConf={publishConf as Parameters<typeof GitHubPagesForm>[0]['publishConf']}
          setSaveEnabled={setSaveEnabled}
          setData={setPubData}
        />
      );
      saveButtonHidden = false;
    } else if (serverType === 'sysgit' || serverType === 'git') {
      configDialogTitle = SysGitMeta.configDialogTitle;
      serverFormLogo = SysGitMeta.icon();
      content = (
        <SysGitForm
          publishConf={publishConf as Parameters<typeof SysGitForm>[0]['publishConf']}
          setSaveEnabled={setSaveEnabled}
          setData={setPubData}
        />
      );
      saveButtonHidden = false;
    } else if (serverType === 'folder') {
      configDialogTitle = FolderMeta.configDialogTitle;
      serverFormLogo = FolderMeta.icon();
      content = (
        <FolderExportForm
          publishConf={publishConf as Parameters<typeof FolderExportForm>[0]['publishConf']}
          setSaveEnabled={setSaveEnabled}
          setData={setPubData}
        />
      );
      saveButtonHidden = false;
    }
  } else if (modAction === 'Add') {
    content = renderServerCards();
  }

  return (
    <Dialog
      open={open || false}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth={dialogSize}
    >
      <DialogTitle sx={{ margin: 0, p: 2 }} component={'div'}>
        <Box sx={{ position: 'absolute', right: '24px', top: '24px' }}>{serverFormLogo}</Box>
        <Typography variant="h6">{modAction + ' ' + configDialogTitle}</Typography>
      </DialogTitle>

      <DialogContent>
        {content}
        <DialogContentText id="alert-dialog-description"></DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button key="action1" color="primary" onClick={onClose}>
          {closeText}
        </Button>
        {!saveButtonHidden && (
          <Button
            key="action2"
            color="primary"
            disabled={!saveEnabled}
            onClick={() => savePublishData(publishKey, pubData)}
          >
            save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default SyncConfigDialog;
