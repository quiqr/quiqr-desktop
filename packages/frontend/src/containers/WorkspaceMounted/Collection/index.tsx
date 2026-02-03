import * as React                    from 'react';
import { useNavigate }               from 'react-router';
import { useQuery } from '@tanstack/react-query';
import DialogTitle                   from '@mui/material/DialogTitle';
import Dialog                        from '@mui/material/Dialog';
import DialogActions                 from '@mui/material/DialogActions';
import DialogContent                 from '@mui/material/DialogContent';
import DialogContentText             from '@mui/material/DialogContentText';
import Switch                        from '@mui/material/Switch';
import FormControlLabel              from '@mui/material/FormControlLabel';
import Divider                       from '@mui/material/Divider';
import List                          from '@mui/material/List';
import ListItem                      from '@mui/material/ListItem';
import ListItemButton                from '@mui/material/ListItemButton';
import ListItemText                  from '@mui/material/ListItemText';
import TextField                     from '@mui/material/TextField';
import Paper                         from '@mui/material/Paper';
import Chip                          from '@mui/material/Chip';
import MenuItem                      from '@mui/material/MenuItem';
import Menu                          from '@mui/material/Menu';
import IconButton                    from '@mui/material/IconButton';
import MoreVertIcon                  from '@mui/icons-material/MoreVert';
import Button                        from '@mui/material/Button';
import Typography                    from '@mui/material/Typography';
import DeleteItemKeyDialog           from './DeleteItemKeyDialog'
import EditItemKeyDialog             from './EditItemKeyDialog'
import CopyItemKeyDialog             from './CopyItemKeyDialog'
import CopyItemToLanguageDialog      from './CopyItemToLanguageDialog'
import Spinner                       from './../../../components/Spinner'
import { createDebounce }            from './../../../utils/debounce';
import { useSnackbar }               from './../../../contexts/SnackbarContext';
import { useCollectionItems, useWorkspaceDetails, useDeleteCollectionItem } from './../../../queries/hooks';
import { siteQueryOptions } from './../../../queries/options';
import { api }                       from './../../../services/api-service'
import type { CollectionItem, CollectionConfig } from '@quiqr/types'

const Fragment = React.Fragment;

const MAX_RECORDS = 200;

interface MakePageBundleItemKeyDialogProps {
  busy: boolean;
  itemLabel: string;
  handleClose?: () => void;
  handleConfirm?: (value: string) => void;
}

const MakePageBundleItemKeyDialog = ({
  busy,
  itemLabel,
  handleClose,
  handleConfirm
}: MakePageBundleItemKeyDialogProps) => {
  const [state, ] = React.useState({
    value: '',
    valid: null
  });

  const handleCloseClick = () => {
    if (handleClose && !busy) {
      handleClose();
    }
  };

  const handleConfirmClick = () => {
    if (handleConfirm) {
      handleConfirm(state.value);
    }
  };

  return (
    <Dialog open={true}>
      <DialogTitle id='simple-dialog-title'>Convert as Page Bundle</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {!state.valid && (
            <div>
              Do you really want to make a page bundle from the item <b>"{itemLabel}"</b>?
            </div>
          )}
          {busy && <Spinner />}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={handleCloseClick} color='primary'>
          Cancel
        </Button>
        <Button disabled={busy} onClick={handleConfirmClick} color='primary'>
          Convert as Page Bundle
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface CollectionListItemsProps {
  collectionExtension: string;
  filteredItems: CollectionItem[];
  onItemClick: (item: CollectionItem) => void;
  onRenameItemClick: (item: CollectionItem) => void;
  onCopyItemClick: (item: CollectionItem) => void;
  onCopyToLangClick: (item: CollectionItem) => void;
  onDeleteItemClick: (item: CollectionItem) => void;
  onMakePageBundleItemClick: (item: CollectionItem) => void;
  sortDescending?: boolean;
  showSortValue?: boolean;
  languages: Language[];
}

const CollectionListItems = React.memo(({
  collectionExtension,
  filteredItems,
  onItemClick,
  onRenameItemClick,
  onCopyItemClick,
  onCopyToLangClick,
  onDeleteItemClick,
  onMakePageBundleItemClick,
  sortDescending,
  showSortValue,
  languages
}: CollectionListItemsProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [currentItem, setCurrentItem] = React.useState<CollectionItem | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>, item: CollectionItem) => {
    setAnchorEl(event.currentTarget);
    setCurrentItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const keyA = a.sortval;
      const keyB = b.sortval;

      if (sortDescending) {
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
      } else {
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
      }
      return 0;
    });
  }, [filteredItems, sortDescending]);

  return (
    <React.Fragment>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => {
          handleClose();
          onRenameItemClick(currentItem);
        }}>Rename</MenuItem>

        {languages.length > 0 && (
          <MenuItem onClick={() => {
            handleClose();
            onCopyToLangClick(currentItem);
          }}>Copy to other language</MenuItem>
        )}

        <MenuItem onClick={() => {
          handleClose();
          onCopyItemClick(currentItem);
        }}>Copy</MenuItem>

        <MenuItem onClick={() => {
          handleClose();
          onDeleteItemClick(currentItem);
        }}>Delete</MenuItem>

        {collectionExtension === 'md' && (
          <MenuItem onClick={() => {
            handleClose();
            onMakePageBundleItemClick(currentItem);
          }}>Make Page Bundle</MenuItem>
        )}
      </Menu>
      
      {sortedItems.map((item, index) => {
        let text = item.label || item.key;
        if (showSortValue) {
          text = text + " (" + item.sortval + ")";
        }

        return (
          <Fragment key={item.key}>
            {index !== 0 && <Divider />}
            <ListItem
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="comments"
                  onClick={(e) => handleClick(e, item)}
                  size="large">
                  <MoreVertIcon />
                </IconButton>
              }>
              <ListItemButton onClick={() => onItemClick(item)}>
                <ListItemText id={text} primary={`${text}`} />
              </ListItemButton>
            </ListItem>
          </Fragment>
        );
      })}
    </React.Fragment>
  );
});

interface CollectionProps {
  siteKey: string;
  workspaceKey: string;
  collectionKey: string;
}

type CollectionView =
  | { key: 'createItem'; item: null }
  | { key: 'renameItem'; item: CollectionItem }
  | { key: 'copyItem'; item: CollectionItem }
  | { key: 'copyToLang'; item: CollectionItem }
  | { key: 'deleteItem'; item: CollectionItem }
  | { key: 'makePageBundleItem'; item: CollectionItem }

interface CollectionLocalState {
  filter: string;
  filteredItems: CollectionItem[];
  view?: CollectionView;
  trunked: boolean;
  modalBusy: boolean;
  dirs: string[];
  sortDescending?: boolean;
  showSortValue?: boolean;
}

const Collection = ({ siteKey, workspaceKey, collectionKey }: CollectionProps) => {
  const filterDebounce = React.useRef(createDebounce(200));
  const navigate = useNavigate();
  const { addSnackMessage } = useSnackbar();

  // Replace manual data state with TanStack Query
  const { data: items = [], isLoading: itemsLoading } = useCollectionItems(
    siteKey,
    workspaceKey,
    collectionKey
  );

  const { data: selectedWorkspaceDetails, isLoading: workspaceLoading } = useWorkspaceDetails(
    siteKey,
    workspaceKey
  );

  const { data: languages = [] } = useQuery(siteQueryOptions.languages(siteKey, workspaceKey));

  const deleteCollectionItemMutation = useDeleteCollectionItem();

  // Keep UI state local
  const [state, setState] = React.useState<CollectionLocalState>({
    filter: '',
    filteredItems: [],
    view: undefined,
    trunked: false,
    modalBusy: false,
    dirs: []
  });

  const setCreateItemView = () => {
    setState(prev => ({ ...prev, view: { key: 'createItem', item: null }, modalBusy: false }));
  };

  const setRenameItemView = (item: CollectionItem) => {
    setState(prev => ({ ...prev, view: { key: 'renameItem', item }, modalBusy: false }));
  };

  const setCopyToLangView = (item: CollectionItem) => {
    setState(prev => ({ ...prev, view: { key: 'copyToLang', item }, modalBusy: false }));
  };

  const setCopyItemView = (item: CollectionItem) => {
    setState(prev => ({ ...prev, view: { key: 'copyItem', item }, modalBusy: false }));
  };

  const setMakePageBundleItemView = (item: CollectionItem) => {
    setState(prev => ({ ...prev, view: { key: 'makePageBundleItem', item }, modalBusy: false }));
  };

  const setDeleteItemView = (item: CollectionItem) => {
    setState(prev => ({ ...prev, view: { key: 'deleteItem', item }, modalBusy: false }));
  };

  const setRootView = () => {
    setState(prev => ({ ...prev, view: undefined, modalBusy: false }));
  };

  // Update filtered items when items or filter changes
  React.useEffect(() => {
    if (items) {
      const filteredData = resolveFilteredItems(items, state.filter);
      setState(prev => ({ ...prev, ...filteredData }));
    }

    return () => {
      filterDebounce.current.cancel();
    };
  }, [items, state.filter]);

  // componentWillUnmount is handled in useEffect cleanup

  const makePageBundleCollectionItem = () => {
    const view = state.view;
    if (view == null) return;
    setState(prev => ({ ...prev, modalBusy: true }));

    api.makePageBundleCollectionItem(siteKey, workspaceKey, collectionKey, view.item.key)
      .then(() => {
        setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
        // Queries will automatically refetch
      }, () => {
        setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
      });
  };

  const deleteCollectionItem = () => {
    const view = state.view;
    if (view == null) return;

    deleteCollectionItemMutation.mutate(
      { siteKey, workspaceKey, collectionKey, collectionItemKey: view.item.key },
      {
        onSuccess: () => {
          setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
          // TanStack Query automatically invalidates and refetches
        },
        onError: () => {
          setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
        },
      }
    );
  };

  const renameCollectionItem = (itemKey: string, itemOldKey: string) => {
    if (state.view == null) return;
    setState(prev => ({ ...prev, modalBusy: true }));

    api.renameCollectionItem(siteKey, workspaceKey, collectionKey, itemOldKey, itemKey)
      .then((result) => {
        if (result.renamed) {
          setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
          // Queries will automatically refetch
        } else {
          //TODO: warn someone!
          setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
        }
      }, () => {
        //TODO: warn someone!
        setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
      });
  };

  const copyCollectionItem = (itemKey: string, itemOldKey: string) => {
    if (state.view == null) return;
    setState(prev => ({ ...prev, modalBusy: true }));

    api.copyCollectionItem(siteKey, workspaceKey, collectionKey, itemOldKey, itemKey)
      .then((result) => {
        if (result.copied) {
          setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
          // Queries will automatically refetch
        } else {
          setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
        }
      }, () => {
        setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
      });
  };

  const copyCollectionItemToLang = (itemKey: string, itemOldKey: string, destLang: string) => {
    console.log(destLang);
    if (state.view == null) return;

    api.copyCollectionItemToLang(siteKey, workspaceKey, collectionKey, itemOldKey, itemKey, destLang)
      .then((result) => {
        if (result.copied) {
          setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
          //api.logToConsole("copied to "+ destLang);
          addSnackMessage(`Copies ${itemKey} to ${destLang}.`, { severity: "success" });
        } else {
          setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
        }
      }, () => {
        setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
      });
  };

  const createCollectionItemKey = (itemKey: string, itemTitle: string) => {
    setState(prev => ({ ...prev, modalBusy: true }));
    api.createCollectionItemKey(siteKey, workspaceKey, collectionKey, itemKey, itemTitle)
      .then(({ unavailableReason }) => {
        if (unavailableReason) {
          setState(prev => ({ ...prev, modalBusy: false }));
        } else {
          setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
          // Queries will automatically refetch
          const path = `/sites/${encodeURIComponent(siteKey)}/workspaces/${encodeURIComponent(workspaceKey)}/collections/${encodeURIComponent(collectionKey)}/${encodeURIComponent(itemKey)}%2Findex.md`;
          navigate(path);
        }
      }, () => {
        setState(prev => ({ ...prev, modalBusy: false }));
      });
  };

  const resolveFilteredItems = React.useCallback((items: CollectionItem[], filter: string) => {
    let trunked = false;
    const dirs: Record<string, boolean> = { '': true };
    let filteredItems: CollectionItem[] = (items || []).filter((item) => {
      const parts = item.label.split('/');
      let c = '';
      for (let i = 0; i < parts.length - 1; i++) {
        c = c + parts[i] + '/';
        dirs[c] = true;
      }
      return item.key.includes(filter);
    });

    if (filteredItems.length > MAX_RECORDS) {
      filteredItems = filteredItems.slice(0, MAX_RECORDS);
      trunked = true;
    }

    const dirsArr: string[] = Object.keys(dirs);
    return { filteredItems, trunked, dirs: dirsArr };
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value;
    setState(prev => ({ ...prev, filter: newFilter }));

    filterDebounce.current.debounce(() => {
      const filteredData = resolveFilteredItems(items, newFilter);
      setState(prev => ({ ...prev, ...filteredData }));
    });
  };

  const handleItemClick = (item: CollectionItem) => {
    const path = `/sites/${encodeURIComponent(siteKey)}/workspaces/${encodeURIComponent(workspaceKey)}/collections/${encodeURIComponent(collectionKey)}/${encodeURIComponent(item.key)}`;
    navigate(path);
  };

  const handleDeleteItemClick = (item: CollectionItem) => {
    setDeleteItemView(item);
  };

  const handleRenameItemClick = (item: CollectionItem) => {
    setRenameItemView(item);
  };

  const handleCopyToLangClick = (item: CollectionItem) => {
    setCopyToLangView(item);
  };

  const handleCopyItemClick = (item: CollectionItem) => {
    setCopyItemView(item);
  };

  const handleMakePageBundleItemClick = (item: CollectionItem) => {
    setMakePageBundleItemView(item);
  };

  const handleDirClick = (e: React.MouseEvent<HTMLElement>) => {
    const newFilter = (e.currentTarget as HTMLElement).dataset.dir || '';
    setState(prev => ({ ...prev, filter: newFilter }));
    filterDebounce.current.debounce(() => {
      const filteredData = resolveFilteredItems(items, newFilter);
      setState(prev => ({ ...prev, ...filteredData }));
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generatePageUrl = (collection: CollectionConfig) => {

    const CollectionPath = collection.folder.split("/")
    CollectionPath.shift();

    const path = CollectionPath.join("/");
    const url = 'http://localhost:13131/'+path.toLowerCase();

    return url;
  }

  const { filteredItems, trunked } = state;
  let dialog = undefined;

  if (itemsLoading || workspaceLoading || !selectedWorkspaceDetails) {
    return (<Spinner />);
  }

  const collection = selectedWorkspaceDetails.collections.find((x) => x.key === collectionKey);
  if (collection == null)
    return null;

  if (state.view) {
    const view = state.view;
    if (view.key === 'createItem') {
      dialog = (<EditItemKeyDialog
        value=""
        viewKey={view.key}
        title={"New " + collection.itemtitle}
        textfieldlabel="Title"
        busy={state.modalBusy}
        handleClose={setRootView}
        handleConfirm={createCollectionItemKey}
        confirmLabel="Create"
      />);
    }
    else if (view.key === 'renameItem') {
      dialog = (<EditItemKeyDialog
        title="Rename Item key"
        viewKey={view.key}
        textfieldlabel="item key"
        value={state.view.item.label}
        busy={state.modalBusy}
        handleClose={setRootView}
        handleConfirm={renameCollectionItem}
        confirmLabel="Rename"
      />);
    }
    else if (view.key === 'copyItem') {
      dialog = (<CopyItemKeyDialog
        title="Copy Item"
        viewKey={view.key}
        textfieldlabel="item key"
        value={state.view.item.label}
        busy={state.modalBusy}
        handleClose={setRootView}
        handleConfirm={copyCollectionItem}
        confirmLabel="Copy"
      />);
    }
    else if (view.key === 'copyToLang') {
      dialog = (<CopyItemToLanguageDialog
        title="Copy To Language"
        viewKey={view.key}
        textfieldlabel="item key"
        languages={state.languages}
        value={state.view.item.label}
        busy={state.modalBusy}
        handleClose={setRootView}
        handleConfirm={copyCollectionItemToLang}
        confirmLabel="Copy"
      />);
    }
    else if (view.key === "deleteItem") {
      dialog = <DeleteItemKeyDialog
        busy={state.modalBusy}
        handleClose={setRootView}
        handleConfirm={deleteCollectionItem}
        itemLabel={view.item.label}
      />;
    }
    else if (view.key === "makePageBundleItem") {
      dialog = <MakePageBundleItemKeyDialog
        busy={state.modalBusy}
        handleClose={setRootView}
        handleConfirm={makePageBundleCollectionItem}
        itemLabel={view.item.label}
      />;
    }
  }

  return (
    <div style={{padding:'20px'}}>

      <Typography variant="button" display="block" gutterBottom> {collection.title} </Typography>

      <Button variant="contained" onClick={setCreateItemView}>
        {'New '+ collection.itemtitle }
      </Button>

      <TextField
        style={{margin:'10px 0'}}
        label="Filter"
        onChange={handleFilterChange}
        fullWidth={true}
        value={state.filter}
        helperText="Item name" />

      <div style={{display: 'flex', flexWrap: 'wrap', padding: '10px 0'}}>
        { state.dirs.map((dir: string) => {
          return (<Chip key={dir} style={{marginRight:'5px'}} onClick={handleDirClick} data-dir={dir} label={"/"+dir} />);
        }) }
      </div>

      <Paper>
        <div style={{/*backgroundColor: "#eee",*/ display: 'flex',justifyContent: "flex-end", flexWrap: 'nowrap', padding: '10px 10px'}}>


          <FormControlLabel
            label="Sort descending"
            control={

              <Switch
                checked={state.sortDescending}
                onChange={(_e, _value) => {
                  setState(prev => ({
                    ...prev,
                    sortDescending: !prev.sortDescending
                  }));
                }}
                 />
            }
          />

          <FormControlLabel
            label="Show sorting value"
            control={
              <Switch
                checked={state.showSortValue}
                onChange={(_e, _value) => {
                  setState(prev => ({
                    ...prev,
                    showSortValue: !prev.showSortValue
                  }));
                }}
                />
            }/>
        </div>

        <List>
          <CollectionListItems
            languages={languages}
            collectionExtension={collection.extension}
            filteredItems={filteredItems}
            onItemClick={handleItemClick}
            onRenameItemClick={handleRenameItemClick}
            onCopyToLangClick={handleCopyToLangClick}
            onCopyItemClick={handleCopyItemClick}
            onDeleteItemClick={handleDeleteItemClick}
            onMakePageBundleItemClick={handleMakePageBundleItemClick}
            sortDescending={state.sortDescending}
            showSortValue={state.showSortValue}
          />
          { trunked ? (
            <React.Fragment>
              <Divider />
              <ListItem sx={{ opacity: 0.5, color: 'rgba(0,0,0,.3)' }}>
                <ListItemText primary={`Max records limit reached (${MAX_RECORDS})`} />
              </ListItem>
            </React.Fragment>
          ) : (null) }
        </List>
      </Paper>

      { dialog }
    </div>
  );
};

export default Collection;
