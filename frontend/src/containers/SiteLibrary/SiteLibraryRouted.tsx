import React from 'react';
import Typography from '@mui/material/Typography';
import { Switch, Route } from 'react-router-dom'
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NewSlashImportSiteDialog from './dialogs/NewSlashImportSiteDialog';
import EditSiteTagsDialogs from './dialogs/EditSiteTagsDialogs';
import RenameSiteDialog from './dialogs/RenameSiteDialog';
import CopySiteDialog from './dialogs/CopySiteDialog';
import DeleteSiteDialog from './dialogs/DeleteSiteDialog';
import SiteListItem from './components/SiteListItem';
import CardItem from './components/CardItem';
import BlockDialog from './../../components/BlockDialog';
import Spinner from './../../components/Spinner';
import service from './../../services/service';
import { History } from 'history';
import { SiteConfig } from "./../../../types";
import { useSiteLibraryData } from "./hooks/useSiteLibraryData";
import { useSiteDialogs } from "./hooks/useSiteDialogs";
import { useSiteOperations } from "./hooks/useSiteOperations";

interface SiteLibraryRoutedProps {
  newSite?: boolean;
  importSite?: boolean;
  importSiteURL?: string;
  activeLibraryView?: string;
  handleLibraryDialogCloseClick: () => void;
}

const SiteLibraryRouted: React.FC<SiteLibraryRoutedProps> = ({ newSite, importSite, importSiteURL, activeLibraryView, handleLibraryDialogCloseClick }) => {
  const historyRef = React.useRef<History | null>(null);

  const { configurations, quiqrCommunityTemplates, localsites, sitesListingView, error: quiqrCommunityTemplatesError, updateLocalSites } = useSiteLibraryData();

  const { dialogState, openDialog, closeDialog } = useSiteDialogs({ newSite, importSite, importSiteURL });

  const { mountSiteByKey, mountSite } = useSiteOperations(historyRef);

  // Local state for menu and blocking operations
  const [blockingOperation] = React.useState<string | null | React.ReactNode>(null);
  const [showSpinner] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = React.useState<number | null>(null);

  const renderItemMenuButton = React.useCallback((index: number, _siteconfig: SiteConfig) => {
    return (
      <IconButton
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
          setMenuOpen(index);
        }}
        aria-label='more'
        aria-controls='long-menu'
        aria-haspopup='true'
        size='large'>
        <MoreVertIcon />
      </IconButton>
    );
  }, []);

  const renderItemMenuItems = React.useCallback(
    (index: number, siteconfig: SiteConfig) => {
      if (siteconfig.template) {
        return (
          <Menu
            anchorEl={anchorEl}
            open={menuOpen === index}
            keepMounted
            onClose={() => {
              setMenuOpen(null);
            }}>
            <MenuItem
              key='import'
              onClick={() => {
                setMenuOpen(null);
                handleSiteClick(siteconfig);
              }}>
              Import
            </MenuItem>

            <MenuItem
              key='visit'
              onClick={() => {
                setMenuOpen(null);
                window.require("electron").shell.openExternal(siteconfig.homepageURL);
              }}>
              Open Homepage
            </MenuItem>
          </Menu>
        );
      } else {
        return (
          <Menu
            anchorEl={anchorEl}
            open={menuOpen === index}
            keepMounted
            onClose={() => {
              setMenuOpen(null);
            }}>
            <MenuItem
              key='rename'
              onClick={() => {
                openDialog("rename", siteconfig);
                setMenuOpen(null);
              }}>
              Rename
            </MenuItem>

            <MenuItem
              key='copy'
              onClick={() => {
                openDialog("copy", siteconfig);
                setMenuOpen(null);
              }}>
              Copy
            </MenuItem>

            <MenuItem
              key='tags'
              onClick={() => {
                openDialog("editTags", siteconfig);
                setMenuOpen(null);
              }}>
              Edit Tags
            </MenuItem>

            <MenuItem
              key='delete'
              onClick={() => {
                openDialog("delete", siteconfig);
                setMenuOpen(null);
              }}>
              Delete
            </MenuItem>
          </Menu>
        );
      }
    },
    [anchorEl, menuOpen, openDialog]
  );

  const handleSiteClick = React.useCallback(
    (site: SiteConfig) => {
      if (site.template) {
        openDialog("newSlashImport", site, site.importSiteURL);
      } else {
        mountSite(site);
      }
    },
    [mountSite, openDialog]
  );

  const renderCards = React.useCallback(
    (sites: SiteConfig[], listTitle: string) => {
      return (
        <Box m={3}>
          <Box my={3}>
            <Typography variant='h6'>{listTitle}</Typography>
          </Box>

          {quiqrCommunityTemplatesError}
          <Grid container spacing={3}>
            {sites.map((site, index) => {
              return (
                <Grid key={"siteCardA" + index} item>
                  <CardItem
                    siteClick={() => {
                      handleSiteClick(site);
                    }}
                    site={site}
                    itemMenuButton={renderItemMenuButton(index, site)}
                    itemMenuItems={renderItemMenuItems(index, site)}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      );
    },
    [quiqrCommunityTemplatesError, handleSiteClick, renderItemMenuButton, renderItemMenuItems]
  );

  const renderList = React.useCallback(
    (sites: SiteConfig[], listTitle: string) => {
      return (
        <List
          style={{ padding: 0 }}
          subheader={
            <ListSubheader component='div' id='nested-list-subheader'>
              {listTitle}
            </ListSubheader>
          }>
          {sites.map((site, index) => {
            return (
              <SiteListItem
                key={"sitelistitem" + index}
                siteClick={() => {
                  handleSiteClick(site);
                }}
                site={site}
                itemMenuButton={renderItemMenuButton(index, site)}
                itemMenuItems={renderItemMenuItems(index, site)}
              />
            );
          })}
        </List>
      );
    },
    [handleSiteClick, renderItemMenuButton, renderItemMenuItems]
  );

  const renderSelectSites = React.useCallback(
    (source: string, sourceArgument: string | null) => {
      if (showSpinner) {
        return <Spinner />;
      }

      let listingSource = "";
      let listTitle = "";
      let sites: SiteConfig[] = [];

      if (source === "last") {
        listingSource = sitesListingView;
        if (listingSource && listingSource.includes("local-tags-")) {
          sourceArgument = listingSource.split("tags-")[1];
          listingSource = "tags";
        }
      } else {
        listingSource = source;
      }

      if (listingSource === "quiqr-community-templates" || (listingSource === "last" && sitesListingView === "templates-quiqr-community")) {
        listTitle = "Quiqr Community Templates";

        sites = [];
        quiqrCommunityTemplates.forEach((template) => {
          let screenshotURL: string | undefined = undefined;
          if (template.ScreenshotImageType) {
            screenshotURL =
              "https://quiqr.github.io/quiqr-community-templates/templates/" + template.NormalizedName + "/screenshot." + template.ScreenshotImageType;
          }

          sites.push({
            key: "template-" + template.QuiqrEtalageName,
            name: template.QuiqrEtalageName,
            screenshotURL: screenshotURL,
            homepageURL: template.QuiqrEtalageHomepage,
            importSiteURL: template.SourceLink.trim(),
            template: true,
          } as SiteConfig);
        });
      } else if (listingSource === "tags") {
        listTitle = "Sites in tag: " + sourceArgument;
        sites = configurations.sites.filter((site) => {
          return site.tags && site.tags.includes(sourceArgument);
        });
      } else {
        listTitle = "All sites on this computer";
        sites = configurations.sites || [];
        if (configurations == null) {
          return <Spinner />;
        }
      }

      sites.sort(function (a, b) {
        const nameA = a.name.toLowerCase(),
          nameB = b.name.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      return activeLibraryView === "cards" ? renderCards(sites, listTitle) : renderList(sites, listTitle);
    },
    [showSpinner, sitesListingView, quiqrCommunityTemplates, configurations, activeLibraryView, renderCards, renderList]
  );

  const renderDialogs = React.useCallback(() => {
    return (
      <div>
        <DeleteSiteDialog
          open={dialogState.activeDialog === "delete"}
          siteconf={dialogState.siteconf}
          onCancelClick={closeDialog}
          onDelete={(siteKey) => {
            service.api.deleteSite(siteKey);
            updateLocalSites();
            closeDialog();
          }}
        />

        <RenameSiteDialog
          open={dialogState.activeDialog === "rename"}
          localsites={localsites}
          siteconf={dialogState.siteconf}
          onCancelClick={closeDialog}
          onSavedClick={() => {
            updateLocalSites();
            closeDialog();
          }}
        />

        <CopySiteDialog
          open={dialogState.activeDialog === "copy"}
          localsites={localsites}
          siteconf={dialogState.siteconf}
          onCancelClick={closeDialog}
          onSavedClick={() => {
            updateLocalSites();
            closeDialog();
          }}
        />

        <EditSiteTagsDialogs
          open={dialogState.activeDialog === "editTags"}
          siteconf={dialogState.siteconf}
          onCancelClick={closeDialog}
          onSavedClick={() => {
            service.api.redirectTo("/sites/last", true);
            closeDialog();
          }}
        />

        <NewSlashImportSiteDialog
          open={dialogState.activeDialog === "newSlashImport"}
          onClose={() => {
            handleLibraryDialogCloseClick();
            updateLocalSites();
            closeDialog();
          }}
          newOrImport={dialogState.newOrImport || "new"}
          importSiteURL={dialogState.importURL}
          mountSite={(siteKey) => {
            mountSiteByKey(siteKey);
          }}
        />

        <BlockDialog open={blockingOperation != null}>{blockingOperation}</BlockDialog>
      </div>
    );
  }, [dialogState, localsites, blockingOperation, handleLibraryDialogCloseClick, updateLocalSites, mountSiteByKey, closeDialog]);

  if (configurations == null) {
    return <Spinner />;
  }

  return (
    <React.Fragment>
      <Switch>
        <Route
          path='/sites/import-site-url/:url'
          exact
          render={({ match, history }) => {
            historyRef.current = history;
            const url = decodeURIComponent(match.params.refresh);
            return renderSelectSites(url, null);
          }}
        />
        <Route
          path='/sites/import-site/:refresh'
          exact
          render={({ match, history }) => {
            historyRef.current = history;
            const refresh = decodeURIComponent(match.params.refresh);
            return renderSelectSites(refresh, null);
          }}
        />
        <Route
          path='/sites/:source'
          exact
          render={({ match, history }) => {
            historyRef.current = history;
            const source = decodeURIComponent(match.params.source);
            return renderSelectSites(source, null);
          }}
        />

        <Route
          path='/sites/:source/:args'
          exact
          render={({ match, history }) => {
            historyRef.current = history;
            const source = decodeURIComponent(match.params.source);
            const sourceArgument = decodeURIComponent(match.params.args);
            return renderSelectSites(source, sourceArgument);
          }}
        />

        <Route
          path='/'
          render={({ history }) => {
            historyRef.current = history;
            return renderSelectSites("last", null);
          }}
        />
        <Route
          path='/sites'
          render={({ history }) => {
            historyRef.current = history;
            return renderSelectSites("last", null);
          }}
        />
      </Switch>

      {renderDialogs()}
    </React.Fragment>
  );
};

export default SiteLibraryRouted;
