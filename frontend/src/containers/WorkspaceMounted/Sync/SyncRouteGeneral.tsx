import React from "react";
import { Route } from "react-router-dom";
import service from "./../../../services/service";
import Box from "@mui/material/Box";
import SyncConfigDialog from "./components/SyncConfigDialog";
import SyncBusyDialog from "./components/SyncBusyDialog";
import Button from "@mui/material/Button";
//targets
import { Dashboard as GitHubDashboard } from "./syncTypes/github";
import { Dashboard as SysGitDashboard } from "./syncTypes/sysgit";
import { Dashboard as FolderDashboard } from "./syncTypes/folder";

interface PublishConfig {
  key: string;
  config: {
    type: string;
    publishScope?: string;
    pullOnly?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface SiteWithPublish {
  key: string;
  publish: PublishConfig[];
  [key: string]: unknown;
}

interface ServerDialog {
  open?: boolean;
  modAction?: string;
  serverTitle?: string;
  closeText?: string;
  publishConf?: PublishConfig;
}

interface ServerBusyDialog {
  open?: boolean;
  serverTitle?: string;
  icon?: React.ReactNode;
}

interface SyncRouteGeneralProps {
  siteKey: string;
  workspaceKey: string;
  site: SiteWithPublish;
  syncConfKey?: string;
  addRefresh?: unknown;
}

interface SyncRouteGeneralState {
  site: SiteWithPublish;
  serverDialog: ServerDialog;
  serverBusyDialog: ServerBusyDialog;
  lastOpenedPublishedKey: string | null;
  addRefresh?: unknown;
  menuOpen?: unknown;
}

class SyncRouteGeneral extends React.Component<SyncRouteGeneralProps, SyncRouteGeneralState> {
  history: any;
  basePath: string = '';

  constructor(props: SyncRouteGeneralProps) {
    super(props);
    this.state = {
      site: {
        key: '',
        publish: [],
      },
      serverDialog: {},
      serverBusyDialog: {},
      lastOpenedPublishedKey: null,
    };
  }

  componentDidUpdate(preProps: SyncRouteGeneralProps) {
    if (this.state.addRefresh !== this.props.addRefresh) {
      this.openAddServerDialog();
    }

    if (preProps.site !== this.props.site) {
      this.initState();
      this.checkLastOpenedPublishConf();
    }
  }

  componentDidMount() {
    this.initState();
    this.checkLastOpenedPublishConf();
    this.basePath = `/sites/${this.props.siteKey}/workspaces/${this.props.workspaceKey}/sync`;
  }

  checkLastOpenedPublishConf() {
    service.api.readConfKey("lastOpenedPublishTargetForSite").then((value) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const targets = value as Record<string, string>;
        if (this.props.siteKey in targets) {
          this.setState({ lastOpenedPublishedKey: targets[this.props.siteKey] });
        }
      }
    });
  }

  openAddServerDialog() {
    this.setState({
      addRefresh: this.props.addRefresh,
      serverDialog: {
        open: true,
        modAction: "Add",
        serverTitle: "Sync Target",
        closeText: "Cancel",
      },
    });
  }

  onConfigure(publishConf: PublishConfig) {
    this.setState({
      menuOpen: null,
      serverDialog: {
        open: true,
        modAction: "Edit",
        closeText: "Cancel",
        publishConf: publishConf,
      },
    });
  }

  initState() {
    if (this.props.site) {
      this.setState({
        site: this.props.site,
      });
    }
  }

  syncDialogControl(open: boolean, title: string = "", icon: React.ReactNode = null) {
    this.setState({
      serverBusyDialog: {
        open: open,
        serverTitle: title,
        icon: icon,
      },
    });
  }

  savePublishData(inkey: string, data: { type: string; [key: string]: unknown }) {
    let site = this.state.site;

    if (!inkey) {
      inkey = `publ-${Math.random()}`;
    }

    const publConfIndex = site.publish.findIndex(({ key }) => key === inkey);
    if (publConfIndex !== -1) {
      site.publish[publConfIndex] = { key: inkey, config: data };
    } else {
      site.publish.push({ key: inkey, config: data });
    }

    service.api.saveSiteConf(this.state.site.key, this.state.site).then(() => {
      this.history.push(`${this.basePath}/list/${inkey}`);
    });
  }

  renderMainCard(publishConf: PublishConfig) {
    let enableSyncFrom = false;
    let enableSyncTo = true;

    let dashboard;

    if (publishConf.config.publishScope === "source" || publishConf.config.publishScope === "build_and_source") {
      enableSyncFrom = true;
    }
    if (publishConf.config.pullOnly === true) {
      enableSyncTo = false;
    }

    if (publishConf.config.type === "github") {
      dashboard = (
        <GitHubDashboard
          siteKey={this.props.siteKey}
          workspaceKey={this.props.workspaceKey}
          enableSyncFrom={enableSyncFrom}
          enableSyncTo={enableSyncTo}
          publishConf={publishConf.config}
          onSyncDialogControl={(open, text, icon) => {
            this.syncDialogControl(open, text, icon);
          }}
          onConfigure={() => {
            this.onConfigure(publishConf);
          }}
        />
      );
    } else if (publishConf.config.type === "sysgit") {
      dashboard = (
        <SysGitDashboard
          siteKey={this.props.siteKey}
          workspaceKey={this.props.workspaceKey}
          enableSyncFrom={enableSyncFrom}
          enableSyncTo={enableSyncTo}
          publishConf={publishConf.config}
          onSyncDialogControl={(open, text, icon) => {
            this.syncDialogControl(open, text, icon);
          }}
          onConfigure={() => {
            this.onConfigure(publishConf);
          }}
        />
      );
    } else if (publishConf.config.type === "folder") {
      dashboard = (
        <FolderDashboard
          siteKey={this.props.siteKey}
          workspaceKey={this.props.workspaceKey}
          enableSyncFrom={enableSyncFrom}
          enableSyncTo={enableSyncTo}
          publishConf={publishConf.config}
          onSyncDialogControl={(open, text, icon) => {
            this.syncDialogControl(open, text, icon);
          }}
          onConfigure={() => {
            this.onConfigure(publishConf);
          }}
        />
      );
    }

    return dashboard;
  }

  render() {
    const { site, serverDialog } = this.state;
    let content = null;

    if (site.publish.length < 1) {
      content = (
        <Box>
          <p>No sync server is configured. Add one first.</p>
          <Button
            onClick={() => {
              this.history.push(`${this.basePath}/add/x${Math.random()}`);
            }}
            color='primary'
            variant='contained'>
            add sync server
          </Button>
        </Box>
      );
    } else if (site.publish.length === 1) {
      content = this.renderMainCard(site.publish[0]);
    } else if (this.props.syncConfKey) {
      const publConf = site.publish.find(({ key }) => key === this.props.syncConfKey);
      if (publConf) {
        content = this.renderMainCard(publConf);
      }
    } else if (this.state.lastOpenedPublishedKey) {
      const publConf = site.publish.find(({ key }) => key === this.state.lastOpenedPublishedKey);
      if (publConf) {
        content = this.renderMainCard(publConf);
      }
    }

    if (!content) {
      content = this.renderMainCard(site.publish[0]);
    }

    return (
      <Route
        render={({ history }) => {
          this.history = history;
          return (
            <React.Fragment>
              <Box sx={{ height: '100%' }}>{content}</Box>

              <SyncBusyDialog
                {...this.state.serverBusyDialog}
                onClose={() => {
                  this.setState({
                    serverBusyDialog: {
                      open: false,
                    },
                  });
                }}
              />

              <SyncConfigDialog
                {...serverDialog}
                site={this.state.site}
                onSave={(publishKey) => {
                  this.history.push(`${this.basePath}/list/${publishKey}`);

                  this.setState({
                    serverDialog: {
                      open: false,
                    },
                  });
                }}
                onClose={() => {
                  this.setState({
                    serverDialog: {
                      open: false,
                    },
                  });
                }}
              />
            </React.Fragment>
          );
        }}
      />
    );
  }
}

export default SyncRouteGeneral;
