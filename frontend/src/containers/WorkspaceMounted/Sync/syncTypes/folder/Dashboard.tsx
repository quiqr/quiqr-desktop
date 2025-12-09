import { useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Meta from './Meta';
import { snackMessageService } from '../../../../../services/ui-service';
import service from '../../../../../services/service';
import { useSyncProgress, SyncProgress } from '../../../../../hooks/useSyncProgress';
import { FolderPublishConf } from '../../../../../../types';

interface DashboardProps {
  siteKey: string;
  workspaceKey: string;
  enableSyncFrom: boolean;
  enableSyncTo: boolean;
  publishConf: FolderPublishConf;
  onSyncDialogControl: (open: boolean, text: string, icon: React.ReactNode) => void;
  onSyncProgress: (progress: SyncProgress | null) => void;
  onConfigure: () => void;
}

export function Dashboard({
  siteKey,
  workspaceKey,
  enableSyncFrom,
  enableSyncTo,
  publishConf,
  onSyncDialogControl,
  onSyncProgress,
  onConfigure,
}: DashboardProps) {
  const { progress, dispatchAction } = useSyncProgress();

  // Update parent with progress changes
  useEffect(() => {
    onSyncProgress(progress);
  }, [progress, onSyncProgress]);

  const pullFromRemote = useCallback(async () => {
    onSyncDialogControl(true, Meta.syncingText, Meta.icon());

    try {
      await dispatchAction(siteKey, publishConf, 'pullFromRemote', {});
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
      snackMessageService.addSnackMessage('Sync: sync from folder finished.', { severity: 'success' });
    } catch {
      snackMessageService.addSnackMessage('Sync: sync from folder failed.', { severity: 'warning' });
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
    }
  }, [siteKey, publishConf, dispatchAction, onSyncDialogControl]);

  const pushToRemote = useCallback(async () => {
    onSyncDialogControl(true, Meta.syncingText, Meta.icon());

    try {
      // Build first
      await service.api.buildWorkspace(siteKey, workspaceKey, null, publishConf);

      // Then push
      await dispatchAction(siteKey, publishConf, 'pushToRemote', {});
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
      snackMessageService.addSnackMessage('Sync: Sync to folder finished.', { severity: 'success' });
    } catch {
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
      snackMessageService.addSnackMessage('Sync: Sync to folder failed.', { severity: 'warning' });
    }
  }, [siteKey, workspaceKey, publishConf, dispatchAction, onSyncDialogControl]);

  return (
    <>
      <Box
        component="div"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
        }}
        m={2}
      >
        <Box component="span" m={1}>
          <FolderIcon fontSize="large" />
        </Box>

        <Box component="span" style={{ flexGrow: 1 }}>
          <Typography>{Meta.sidebarLabel(publishConf)}</Typography>

          <Link
            component="button"
            variant="body2"
            onClick={() => {
              service.api.openFileInEditor(publishConf.path);
            }}
          >
            Open in File Manager
          </Link>
        </Box>

        <Box component="span">
          <Button
            onClick={onConfigure}
            size="small"
            variant="contained"
            startIcon={<SettingsIcon />}
          >
            Configure
          </Button>
        </Box>
      </Box>

      <Box
        component="div"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
        }}
        m={2}
      >
        {enableSyncTo ? (
          <Button
            onClick={pushToRemote}
            style={{ marginRight: '5px' }}
            size="small"
            variant="contained"
            color="primary"
            startIcon={<ArrowUpwardIcon />}
          >
            Sync to folder
          </Button>
        ) : null}

        {enableSyncFrom ? (
          <Button
            onClick={pullFromRemote}
            size="small"
            variant="contained"
            color="primary"
            startIcon={<ArrowDownwardIcon />}
          >
            Sync from Folder
          </Button>
        ) : null}
      </Box>

      <Divider />
    </>
  );
}

export default Dashboard;
