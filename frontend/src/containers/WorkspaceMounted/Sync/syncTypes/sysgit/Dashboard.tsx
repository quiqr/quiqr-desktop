import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import GitHubIcon from '@mui/icons-material/GitHub';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import BlockIcon from '@mui/icons-material/Block';
import Link from '@mui/material/Link';
import SettingsIcon from '@mui/icons-material/Settings';
import Meta from './Meta';
import { snackMessageService } from '../../../../../services/ui-service';
import service from '../../../../../services/service';
import { useSyncProgress, SyncProgress } from '../../../../../hooks/useSyncProgress';
import { SysgitPublishConf } from '../../../../../../types';
import { openExternal } from '../../../../../utils/platform';

interface HistoryItem {
  message: string;
  author: string;
  date: string;
  ref: string;
  local?: boolean;
}

interface SourceInfo {
  path: string;
  type: string;
}

interface DashboardProps {
  siteKey: string;
  workspaceKey: string;
  enableSyncFrom: boolean;
  enableSyncTo: boolean;
  publishConf: SysgitPublishConf;
  onSyncDialogControl: (open: boolean, text: string, icon: React.ReactNode) => void;
  onSyncProgress: (progress: SyncProgress | null) => void;
  onConfigure: () => void;
}

const MORE_AMOUNT = 4;

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
  const [source, setSource] = useState<SourceInfo | null>(null);
  const [historyArr, setHistoryArr] = useState<HistoryItem[]>([]);
  const [lastRefresh, setLastRefresh] = useState('');
  const [resultsShowing, setResultsShowing] = useState(0);

  const { progress, dispatchAction } = useSyncProgress();

  // Update parent with progress changes
  useEffect(() => {
    onSyncProgress(progress);
  }, [progress, onSyncProgress]);

  // Load site data on mount
  useEffect(() => {
    service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle) => {
      if (bundle.site.source) {
        setSource(bundle.site.source);
      }
    });
  }, [siteKey, workspaceKey]);

  // Load cached history on mount
  useEffect(() => {
    softRefreshRemoteStatus();
  }, []);

  const softRefreshRemoteStatus = useCallback(async () => {
    onSyncDialogControl(true, 'Read cached commit history', Meta.icon());

    try {
      const results = await dispatchAction(siteKey, publishConf, 'readRemote', {});
      const typedResults = results as { commitList: HistoryItem[]; lastRefresh: string };
      setHistoryArr(typedResults.commitList);
      setLastRefresh(typedResults.lastRefresh.toString());
      setResultsShowing(MORE_AMOUNT);
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
    } catch {
      snackMessageService.addSnackMessage('Sync: read cached remote status failed.', { severity: 'warning' });
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
    }
  }, [siteKey, publishConf, dispatchAction, onSyncDialogControl]);

  const refreshRemoteStatus = useCallback(async (showSnack: boolean) => {
    onSyncDialogControl(true, 'Refreshing commit history', Meta.icon());

    try {
      const results = await dispatchAction(siteKey, publishConf, 'refreshRemote', {});
      const typedResults = results as { commitList: HistoryItem[]; lastRefresh: string };
      setHistoryArr(typedResults.commitList);
      setLastRefresh(typedResults.lastRefresh.toString());
      setResultsShowing(MORE_AMOUNT);
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());

      if (showSnack) {
        snackMessageService.addSnackMessage('Sync: Refreshing remote status finished.', { severity: 'success' });
      }
    } catch {
      snackMessageService.addSnackMessage('Sync: Refreshing remote status failed.', { severity: 'warning' });
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
    }
  }, [siteKey, publishConf, dispatchAction, onSyncDialogControl]);

  const checkoutRef = useCallback(async (refHash: string) => {
    onSyncDialogControl(true, 'Checking out commit', Meta.icon());

    try {
      await dispatchAction(siteKey, publishConf, 'checkoutRef', { ref: refHash });
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
      refreshRemoteStatus(false);
      snackMessageService.addSnackMessage(`Sync: commit with ref ${refHash} has been checked out successfully.`, { severity: 'success' });
    } catch {
      snackMessageService.addSnackMessage(`Sync: Failed checking out ref: ${refHash}.`, { severity: 'warning' });
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
    }
  }, [siteKey, publishConf, dispatchAction, onSyncDialogControl, refreshRemoteStatus]);

  const pullFromRemote = useCallback(async (mode: string = 'pull') => {
    const dispatchCommand = mode === 'pull' ? 'pullFromRemote' : 'checkoutLatest';

    onSyncDialogControl(true, Meta.syncingText, Meta.icon());

    try {
      await dispatchAction(siteKey, publishConf, dispatchCommand, {});
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
      refreshRemoteStatus(false);
      snackMessageService.addSnackMessage(`Sync: ${mode} from remote finished.`, { severity: 'success' });
    } catch {
      snackMessageService.addSnackMessage(`Sync: ${mode} from remote failed.`, { severity: 'warning' });
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
    }
  }, [siteKey, publishConf, dispatchAction, onSyncDialogControl, refreshRemoteStatus]);

  const pushToRemote = useCallback(async (mode: string = 'soft') => {
    const dispatchCommand = mode === 'soft' ? 'pullFromRemote' : 'hardPush';

    onSyncDialogControl(true, Meta.syncingText, Meta.icon());

    try {
      // Build first
      await service.api.buildWorkspace(siteKey, workspaceKey, null, publishConf);

      // Then push
      await dispatchAction(siteKey, publishConf, dispatchCommand, {});
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
      snackMessageService.addSnackMessage('Sync: Push to remote finished.', { severity: 'success' });
    } catch {
      onSyncDialogControl(false, Meta.syncingText, Meta.icon());
      snackMessageService.addSnackMessage('Sync: Push to remote failed.', { severity: 'warning' });
    }
  }, [siteKey, workspaceKey, publishConf, dispatchAction, onSyncDialogControl]);

  const showMore = () => {
    setResultsShowing((prev) => prev + MORE_AMOUNT);
  };

  const unpushedChanges = false;
  const remoteDiffers = true;

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
        <Box component="span">
          <GitHubIcon fontSize="large" style={{ margin: '6px' }} />
        </Box>

        <Box component="span" style={{ flexGrow: 1 }}>
          <Typography>{Meta.sidebarLabel(publishConf)}</Typography>

          <Link
            component="button"
            variant="body2"
            onClick={async () => {
              await openExternal(Meta.repoAdminUrl(publishConf));
            }}
          >
            {Meta.repoAdminUrl(publishConf)}
          </Link>
        </Box>

        <Box component="span">
          <Button
            onClick={onConfigure}
            style={{ marginRight: '5px' }}
            size="small"
            variant="contained"
            startIcon={<SettingsIcon />}
          >
            Configure
          </Button>
          <Button
            onClick={() => {
              const filename = source?.path + '/quiqr/sync_ignore.txt';
              service.api.openFileInEditor(filename, true);
            }}
            size="small"
            variant="contained"
            startIcon={<BlockIcon />}
          >
            Edit ignore list
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
          <>
            <Tooltip title="overwrites remote version">
              <Button
                onClick={() => pushToRemote('hard')}
                style={{ marginRight: '5px' }}
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<ArrowUpwardIcon />}
              >
                Push
              </Button>
            </Tooltip>
          </>
        ) : null}

        {enableSyncFrom ? (
          <>
            <Tooltip title="overwrites local version">
              <Button
                style={{ marginRight: '5px' }}
                onClick={() => pullFromRemote('checkoutLatest')}
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<ArrowDownwardIcon />}
              >
                Checkout latest
              </Button>
            </Tooltip>
          </>
        ) : null}
      </Box>

      <Divider />

      <Box
        component="div"
        m={1}
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Box component="div" p={1}>
          <Typography variant="body2" color="textSecondary">
            Last history refresh: {lastRefresh}
          </Typography>
        </Box>

        <Button
          onClick={() => refreshRemoteStatus(true)}
          size="small"
          variant="contained"
          startIcon={<RefreshIcon />}
        >
          Refresh History
        </Button>
      </Box>

      <Timeline position="alternate">
        {unpushedChanges ? (
          <TimelineItem>
            <TimelineOppositeContent>
              <Paper elevation={3}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="h6" component="h1">
                    There are unpublished local changes.
                  </Typography>

                  {enableSyncTo ? (
                    <Box py={1}>
                      <Button
                        onClick={() => {}}
                        style={{ marginRight: '5px' }}
                        size="small"
                        variant="contained"
                        color={remoteDiffers ? 'secondary' : 'primary'}
                        startIcon={<ArrowUpwardIcon />}
                      >
                        Push to Remote
                      </Button>

                      <Button
                        onClick={() => {}}
                        style={{ marginRight: '5px' }}
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<SaveAltIcon />}
                      >
                        Local Commit
                      </Button>
                    </Box>
                  ) : null}
                </Box>
              </Paper>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color="secondary">
                <NewReleasesIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent></TimelineContent>
          </TimelineItem>
        ) : null}

        {historyArr.slice(0, resultsShowing).map((item, index) => {
          const content = (
            <Paper elevation={3} key={'commit-' + index}>
              <Box p={2}>
                <Typography variant="h6" component="h1">
                  {item.message.split('+')[0]}
                </Typography>
                <Typography>Author: {item.author}</Typography>
                <Typography>Date: {item.date}</Typography>
                <Typography>Ref: {item.ref.substring(0, 7)}</Typography>
                <Box py={1}>
                  <Button
                    onClick={() => checkoutRef(item.ref)}
                    style={{ marginRight: '5px' }}
                    size="small"
                    variant="contained"
                    color="secondary"
                    startIcon={<ArrowDownwardIcon />}
                  >
                    Checkout this Version
                  </Button>
                </Box>
              </Box>
            </Paper>
          );

          return (
            <TimelineItem key={'timeline' + index}>
              <TimelineOppositeContent>{item.local ? content : null}</TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={item.local ? 'primary' : 'secondary'}>
                  <CloudUploadIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>{item.local ? null : content}</TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>

      {historyArr.length > resultsShowing ? (
        <Box
          py={1}
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button
            onClick={showMore}
            style={{ marginRight: '5px' }}
            size="small"
            variant="contained"
            startIcon={<RefreshIcon />}
          >
            Load More
          </Button>
        </Box>
      ) : null}
    </>
  );
}

export default Dashboard;
