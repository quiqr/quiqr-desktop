import * as React                    from 'react';
import { useNavigate }               from 'react-router';
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
import { api }                       from './../../../services/api-service'

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
  const [state, setState] = React.useState({
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
  filteredItems: any[];
  onItemClick: (item: any) => void;
  onRenameItemClick: (item: any) => void;
  onCopyItemClick: (item: any) => void;
  onCopyToLangClick: (item: any) => void;
  onDeleteItemClick: (item: any) => void;
  onMakePageBundleItemClick: (item: any) => void;
  sortDescending?: boolean;
  showSortValue?: boolean;
  languages: any[];
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
  const [currentItem, setCurrentItem] = React.useState<any>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>, item: any) => {
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

interface CollectionState {
  selectedWorkspaceDetails: any;
  items: any[] | null;
  languages: any[];
  filter: string;
  filteredItems: any[];
  view: any;
  trunked: boolean;
  modalBusy: boolean;
  dirs: string[];
  showSpinner?: boolean;
  sortDescending?: boolean;
  showSortValue?: boolean;
}

const Collection = ({ siteKey, workspaceKey, collectionKey }: CollectionProps) => {
  const filterDebounce = React.useRef(createDebounce(200));
  const navigate = useNavigate();
  const { addSnackMessage } = useSnackbar();
  
  const [state, setState] = React.useState<CollectionState>({
    selectedWorkspaceDetails: null,
    items: null,
    languages: [],
    filter: '',
    filteredItems: [],
    view: null,
    trunked: false,
    modalBusy: false,
    dirs: []
  });

  const setCreateItemView = () => {
    setState(prev => ({ ...prev, view: { key: 'createItem', item: null }, modalBusy: false }));
  };

  const setRenameItemView = (item: any) => {
    setState(prev => ({ ...prev, view: { key: 'renameItem', item }, modalBusy: false }));
  };

  const setCopyToLangView = (item: any) => {
    setState(prev => ({ ...prev, view: { key: 'copyToLang', item }, modalBusy: false }));
  };

  const setCopyItemView = (item: any) => {
    setState(prev => ({ ...prev, view: { key: 'copyItem', item }, modalBusy: false }));
  };

  const setMakePageBundleItemView = (item: any) => {
    setState(prev => ({ ...prev, view: { key: 'makePageBundleItem', item }, modalBusy: false }));
  };

  const setDeleteItemView = (item: any) => {
    setState(prev => ({ ...prev, view: { key: 'deleteItem', item }, modalBusy: false }));
  };

  const setRootView = () => {
    setState(prev => ({ ...prev, view: undefined, modalBusy: false }));
  };

  React.useEffect(() => {
    api.getLanguages(siteKey, workspaceKey).then((langs) => {
      setState(prev => ({ ...prev, languages: langs }));
    });

    refreshItems();

    return () => {
      filterDebounce.current.cancel();
    };
  }, [siteKey, workspaceKey, collectionKey]);

  const refreshItems = React.useCallback(() => {
    if (siteKey && workspaceKey && collectionKey) {
      Promise.all([
        api.listCollectionItems(siteKey, workspaceKey, collectionKey).then((items) => {
          const filteredData = resolveFilteredItems(items, state.filter);
          setState(prev => ({ 
            ...prev, 
            items, 
            ...filteredData 
          }));
        }),
        api.getWorkspaceDetails(siteKey, workspaceKey).then((workspaceDetails) => {
          setState(prev => ({ 
            ...prev, 
            selectedWorkspaceDetails: workspaceDetails 
          }));
        })
      ]).catch((e) => {
        // Handle error if needed
      });
    }
  }, [siteKey, workspaceKey, collectionKey, state.filter]);

  // componentWillUnmount is handled in useEffect cleanup

  const makePageBundleCollectionItem = () => {
    const view = state.view;
    if (view == null) return;
    api.makePageBundleCollectionItem(siteKey, workspaceKey, collectionKey, view.item.key)
      .then(() => {
        setState(prev => {
          const itemsCopy = (prev.items || []).slice(0);
          const itemIndex = itemsCopy.findIndex(x => x.key === view.item.key);
          itemsCopy.splice(itemIndex, 1);
          const filteredData = resolveFilteredItems(itemsCopy, prev.filter);
          return {
            ...prev,
            items: itemsCopy,
            modalBusy: false,
            view: undefined,
            ...filteredData
          };
        });
      }, () => {
        setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
      });
  };

  const deleteCollectionItem = () => {
    const view = state.view;
    if (view == null) return;

    api.deleteCollectionItem(siteKey, workspaceKey, collectionKey, view.item.key)
      .then(() => {
        setState(prev => {
          const itemsCopy = (prev.items || []).slice(0);
          const itemIndex = itemsCopy.findIndex(x => x.key === view.item.key);
          itemsCopy.splice(itemIndex, 1);
          const filteredData = resolveFilteredItems(itemsCopy, prev.filter);
          return {
            ...prev,
            items: itemsCopy,
            modalBusy: false,
            view: undefined,
            ...filteredData
          };
        });
      }, () => {
        setState(prev => ({ ...prev, modalBusy: false, view: undefined }));
      });
  };

  const renameCollectionItem = (itemKey: string, itemOldKey: string) => {
    if (state.view == null) return;
    api.renameCollectionItem(siteKey, workspaceKey, collectionKey, itemOldKey, itemKey)
      .then((result) => {
        if (result.renamed) {
          setState(prev => {
            const itemsCopy = (prev.items || []).slice(0);
            const itemIndex = itemsCopy.findIndex(x => x.label === itemOldKey);
            itemsCopy[itemIndex] = result.item;
            const filteredData = resolveFilteredItems(itemsCopy, prev.filter);
            return {
              ...prev,
              items: itemsCopy,
              modalBusy: false,
              view: undefined,
              ...filteredData
            };
          });
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

    api.copyCollectionItem(siteKey, workspaceKey, collectionKey, itemOldKey, itemKey)
      .then((result) => {
        if (result.copied) {
          setState(prev => {
            const itemsCopy = (prev.items || []).slice(0);
            itemsCopy.push(result.item);
            const filteredData = resolveFilteredItems(itemsCopy, prev.filter);
            return {
              ...prev,
              items: itemsCopy,
              modalBusy: false,
              view: undefined,
              ...filteredData
            };
          });
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
      .then(({ unavailableReason, key }) => {
        if (unavailableReason) {
          setState(prev => ({ ...prev, modalBusy: false }));
        } else {
          refreshItems();
        }
      }, (e) => {
        setState(prev => ({ ...prev, modalBusy: false }));
      }).then(() => {
        const path = `/sites/${encodeURIComponent(siteKey)}/workspaces/${encodeURIComponent(workspaceKey)}/collections/${encodeURIComponent(collectionKey)}/${encodeURIComponent(itemKey)}%2Findex.md`;
        navigate(path);
      });
  };

  const resolveFilteredItems = React.useCallback((items: any[], filter: string) => {
    let trunked = false;
    const dirs: Record<string, boolean> = { '': true };
    let filteredItems: any[] = (items || []).filter((item) => {
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
      const filteredData = resolveFilteredItems(state.items || [], newFilter);
      setState(prev => ({ ...prev, ...filteredData }));
    });
  };

  const handleItemClick = (item: any) => {
    const path = `/sites/${encodeURIComponent(siteKey)}/workspaces/${encodeURIComponent(workspaceKey)}/collections/${encodeURIComponent(collectionKey)}/${encodeURIComponent(item.key)}`;
    navigate(path);
  };

  const handleDeleteItemClick = (item: any) => {
    setDeleteItemView(item);
  };

  const handleRenameItemClick = (item: any) => {
    setRenameItemView(item);
  };
  
  const handleCopyToLangClick = (item: any) => {
    setCopyToLangView(item);
  };
  
  const handleCopyItemClick = (item: any) => {
    setCopyItemView(item);
  };
  
  const handleMakePageBundleItemClick = (item: any) => {
    setMakePageBundleItemView(item);
  };

  const handleDirClick = (e: React.MouseEvent<HTMLElement>) => {
    const newFilter = (e.currentTarget as HTMLElement).dataset.dir || '';
    setState(prev => ({ ...prev, filter: newFilter }));
    filterDebounce.current.debounce(() => {
      const filteredData = resolveFilteredItems(state.items || [], newFilter);
      setState(prev => ({ ...prev, ...filteredData }));
    });
  };

  const generatePageUrl = (collection) => {

    const CollectionPath = collection.folder.split("/")
    CollectionPath.shift();

    const path = CollectionPath.join("/");
    const url = 'http://localhost:13131/'+path.toLowerCase();

    return url;
  }

  const { filteredItems, trunked } = state;
  let dialog = undefined;

  if (state.showSpinner || state.selectedWorkspaceDetails == null) {
    return (<Spinner />);
  }
  
  const collection = state.selectedWorkspaceDetails.collections.find((x: any) => x.key === collectionKey);
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
                onChange={(e, value) => {
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
                onChange={(e, value) => {
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
            languages={state.languages}
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
