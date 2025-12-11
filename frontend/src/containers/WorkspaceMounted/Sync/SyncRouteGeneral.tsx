import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import service from "./../../../services/service";
import Box from "@mui/material/Box";
import SyncConfigDialog from "./components/SyncConfigDialog";
import SyncBusyDialog from "./components/SyncBusyDialog";
import Button from "@mui/material/Button";
import { SiteConfig } from "../../../../types";
//targets
import { Dashboard as GitHubDashboard } from "./syncTypes/github";
import { Dashboard as SysGitDashboard } from "./syncTypes/sysgit";
import { Dashboard as FolderDashboard } from "./syncTypes/folder";

// Extract the publish config type from SiteConfig
type PublishConfig = NonNullable<SiteConfig['publish']>[number];

interface ServerDialog {
  open?: boolean;
  modAction?: string;
  serverTitle?: string;
  closeText?: string;
  publishConf?: PublishConfig;
}

interface SyncProgress {
  message: string;
  progress: number;
  complete?: boolean;
  error?: string;
}

interface ServerBusyDialog {
  open?: boolean;
  serverTitle?: string;
  icon?: React.ReactNode;
  progress?: SyncProgress | null;
}

interface SyncRouteGeneralProps {
  siteKey: string;
  workspaceKey: string;
  site: SiteConfig | null;
  syncConfKey?: string;
  addRefresh?: unknown;
}

const SyncRouteGeneral = ({
  siteKey,
  workspaceKey,
  site: propsSite,
  syncConfKey,
  addRefresh,
}: SyncRouteGeneralProps) => {
  const navigate = useNavigate();
  const basePath = `/sites/${siteKey}/workspaces/${workspaceKey}/sync`;

  const [site, setSite] = useState<SiteConfig | null>(null);
  const [serverDialog, setServerDialog] = useState<ServerDialog>({});
  const [serverBusyDialog, setServerBusyDialog] = useState<ServerBusyDialog>({});
  const [lastOpenedPublishedKey, setLastOpenedPublishedKey] = useState<string | null>(null);
  const [prevAddRefresh, setPrevAddRefresh] = useState<unknown>(null);

  const openAddServerDialog = useCallback(() => {
    setServerDialog({
      open: true,
      modAction: "Add",
      serverTitle: "Sync Target",
      closeText: "Cancel",
    });
  }, []);

  useEffect(() => {
    if (propsSite) {
      setSite(propsSite);
    }
  }, [propsSite]);

  useEffect(() => {
    service.api.readConfKey("lastOpenedPublishTargetForSite").then((value) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const targets = value as Record<string, string>;
        if (siteKey in targets) {
          setLastOpenedPublishedKey(targets[siteKey]);
        }
      }
    });
  }, [siteKey]);

  useEffect(() => {
    if (addRefresh !== prevAddRefresh && addRefresh !== undefined) {
      openAddServerDialog();
      setPrevAddRefresh(addRefresh);
    }
  }, [addRefresh, prevAddRefresh, openAddServerDialog]);

  const onConfigure = (publishConf: PublishConfig) => {
    setServerDialog({
      open: true,
      modAction: "Edit",
      closeText: "Cancel",
      publishConf: publishConf,
    });
  };

  const syncDialogControl = (
    open: boolean,
    title: string = "",
    icon: React.ReactNode = null,
    progress: SyncProgress | null = null
  ) => {
    setServerBusyDialog({
      open: open,
      serverTitle: title,
      icon: icon,
      progress: progress,
    });
  };

  const updateSyncProgress = useCallback((progress: SyncProgress | null) => {
    setServerBusyDialog((prev) => ({
      ...prev,
      progress: progress,
    }));
  }, []);

  const renderMainCard = (publishConf: PublishConfig) => {
    let enableSyncFrom = false;
    let enableSyncTo = true;

    const config = publishConf.config as {
      type?: string;
      publishScope?: string;
      pullOnly?: boolean;
      [key: string]: unknown;
    };

    if (config.publishScope === "source" || config.publishScope === "build_and_source") {
      enableSyncFrom = true;
    }
    if (config.pullOnly === true) {
      enableSyncTo = false;
    }

    if (config.type === "github") {
      return (
        <GitHubDashboard
          siteKey={siteKey}
          workspaceKey={workspaceKey}
          enableSyncFrom={enableSyncFrom}
          enableSyncTo={enableSyncTo}
          publishConf={config as any}
          onSyncDialogControl={(open, text, icon) => {
            syncDialogControl(open, text, icon);
          }}
          onSyncProgress={updateSyncProgress}
          onConfigure={() => {
            onConfigure(publishConf);
          }}
        />
      );
    } else if (config.type === "sysgit" || config.type === "git") {
      // Use SysGitDashboard for both sysgit and the new universal git type
      return (
        <SysGitDashboard
          siteKey={siteKey}
          workspaceKey={workspaceKey}
          enableSyncFrom={enableSyncFrom}
          enableSyncTo={enableSyncTo}
          publishConf={config as any}
          onSyncDialogControl={(open, text, icon) => {
            syncDialogControl(open, text, icon);
          }}
          onSyncProgress={updateSyncProgress}
          onConfigure={() => {
            onConfigure(publishConf);
          }}
        />
      );
    } else if (config.type === "folder") {
      return (
        <FolderDashboard
          siteKey={siteKey}
          workspaceKey={workspaceKey}
          enableSyncFrom={enableSyncFrom}
          enableSyncTo={enableSyncTo}
          publishConf={config as any}
          onSyncDialogControl={(open, text, icon) => {
            syncDialogControl(open, text, icon);
          }}
          onSyncProgress={updateSyncProgress}
          onConfigure={() => {
            onConfigure(publishConf);
          }}
        />
      );
    }

    return null;
  };

  // If site is not loaded yet, show loading state
  if (!site || !site.key) {
    return <Box sx={{ height: '100%', padding: 2 }}>Loading...</Box>;
  }

  let content = null;

  if (!site.publish || site.publish.length < 1) {
    content = (
      <Box>
        <p>No sync server is configured. Add one first.</p>
        <Button
          onClick={() => {
            navigate(`${basePath}/add/x${Math.random()}`);
          }}
          color='primary'
          variant='contained'>
          add sync server
        </Button>
      </Box>
    );
  } else if (site.publish.length === 1) {
    content = renderMainCard(site.publish[0]);
  } else if (syncConfKey) {
    const publConf = site.publish.find(({ key }) => key === syncConfKey);
    if (publConf) {
      content = renderMainCard(publConf);
    }
  } else if (lastOpenedPublishedKey) {
    const publConf = site.publish.find(({ key }) => key === lastOpenedPublishedKey);
    if (publConf) {
      content = renderMainCard(publConf);
    }
  }

  if (!content && site.publish && site.publish.length > 0) {
    content = renderMainCard(site.publish[0]);
  }

  return (
    <>
      <Box sx={{ height: '100%' }}>{content}</Box>

      <SyncBusyDialog
        open={serverBusyDialog.open}
        serverTitle={serverBusyDialog.serverTitle}
        icon={serverBusyDialog.icon}
        progress={serverBusyDialog.progress}
        onClose={() => {
          setServerBusyDialog({ open: false, progress: null });
        }}
      />

      <SyncConfigDialog
        {...serverDialog}
        site={{
          key: site?.key || '',
          publish: site?.publish || []
        }}
        onSave={(publishKey: string) => {
          navigate(`${basePath}/list/${publishKey}`);
          setServerDialog({ open: false });
        }}
        onClose={() => {
          setServerDialog({ open: false });
        }}
      />
    </>
  );
};

export default SyncRouteGeneral;
