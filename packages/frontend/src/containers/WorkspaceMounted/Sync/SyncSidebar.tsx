import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Sidebar from './../../Sidebar';
import service from './../../../services/service';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SyncConfigDialog from './components/SyncConfigDialog';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
//targets
import * as GitHubMeta from './syncTypes/github/Meta';
import * as FolderMeta from './syncTypes/folder/Meta';
import * as SysGitMeta from './syncTypes/sysgit/Meta';
import { SiteConfig } from '@quiqr/types';

// Extract the type of a single publish item from the array
type PublishItem = NonNullable<SiteConfig['publish']>[number];

interface ServerDialogConfig {
  open?: boolean;
  modAction?: string;
  closeText?: string;
  publishConf?: PublishItem;
}

interface SyncSidebarProps {
  siteKey: string;
  workspaceKey: string;
  site: SiteConfig;
  [key: string]: unknown;
}

export const SyncSidebar = ({
  siteKey,
  workspaceKey,
  site: propsSite,
  ...restProps
}: SyncSidebarProps) => {
  const navigate = useNavigate();
  const [site, setSite] = useState<Partial<SiteConfig>>({ key: '', publish: [] });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [serverDialog, setServerDialog] = useState<ServerDialogConfig>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyForDeletion, setKeyForDeletion] = useState<string>('');

  useEffect(() => {
    if (propsSite) {
      setSite(propsSite);
    }
  }, [propsSite]);

  const encodedSiteKey = siteKey;
  const encodedWorkspaceKey = workspaceKey;
  const basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/sync`;

  const deletePublishConfiguration = (inkey: string) => {
    const publConfIndex = propsSite.publish.findIndex(({ key }) => key === inkey);
    if (publConfIndex > -1) {
      propsSite.publish.splice(publConfIndex, 1);

      service.api.saveSiteConf(propsSite.key, propsSite).then(() => {
        navigate(`${basePath}/`);
      });
    }
  };

  const renderButton = (index: number) => {
    return (
      <IconButton
        edge="end"
        aria-label="comments"
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          setMenuOpen(index);
        }}
        size="large"
      >
        <MoreVertIcon />
      </IconButton>
    );
  };

  const renderMenu = (index: number, publ: PublishItem) => {
    return (
      <Menu
        anchorEl={anchorEl}
        open={menuOpen === index}
        keepMounted
        onClose={() => setMenuOpen(null)}
      >
        <MenuItem
          key="configure"
          onClick={() => {
            setMenuOpen(null);
            setServerDialog({
              open: true,
              modAction: 'Edit',
              closeText: 'Cancel',
              publishConf: publ,
            });
          }}
        >
          Configure
        </MenuItem>

        <MenuItem
          key="delete"
          onClick={() => {
            setMenuOpen(null);
            setDeleteDialogOpen(true);
            setKeyForDeletion(publ.key);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    );
  };

  const targets: Array<{
    active: boolean;
    icon: React.ReactNode;
    label: string;
    secondaryMenu: React.ReactNode;
    secondaryButton: React.ReactNode;
    to: string;
  }> = [];

  let index = 0;
  site.publish?.forEach((publ) => {
    let label = '';
    let icon: React.ReactNode = null;

    if (publ.config && publ.config.type === 'github') {
      label = GitHubMeta.sidebarLabel(publ.config);
      icon = GitHubMeta.icon();
    } else if (publ.config && (publ.config.type === 'sysgit' || publ.config.type === 'git')) {
      // Use SysGitMeta for both sysgit and the new universal git type
      label = SysGitMeta.sidebarLabel(publ.config);
      icon = SysGitMeta.icon();
    } else if (publ.config && publ.config.type === 'folder') {
      label = FolderMeta.sidebarLabel(publ.config);
      icon = FolderMeta.icon();
    }

    label = label.length > 17 ? `${label.substring(0, 17)}..` : label;
    if (label) {
      targets.push({
        active: true,
        icon: icon,
        label: label,
        secondaryMenu: renderMenu(index, publ),
        secondaryButton: renderButton(index),
        to: `${basePath}/list/${publ.key}/`,
      });
    }

    index++;
  });

  const menus = [
    {
      title: 'Sync Targets',
      items: targets,
    },
    {
      title: '',
      items: [
        {
          label: '',
          spacer: true,
        },
        {
          icon: <AddIcon />,
          label: 'ADD SYNC TARGET',
          onClick: () => {
            navigate(`${basePath}/add/x${Math.random()}`);
          },
        },
      ],
    },
  ];

  return (
    <>
      <SyncConfigDialog
        {...serverDialog}
        site={propsSite}
        onSave={(publishKey: string) => {
          navigate(`${basePath}/list/${publishKey}`);
          setServerDialog({ open: false });
        }}
        onClose={() => {
          setServerDialog({ open: false });
        }}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Are you sure you want to delete this configuration?'}
        </DialogTitle>
        <DialogContent></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              deletePublishConfiguration(keyForDeletion);
            }}
            color="primary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Sidebar {...restProps} menus={menus} />
    </>
  );
};
