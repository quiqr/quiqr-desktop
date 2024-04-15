import * as React                   from 'react';
import service                      from './../../../services/service';
import { snackMessageService }      from './../../../services/ui-service';
import SnackbarManager              from './../../../components/SnackbarManager';
import LogosGitServices             from '../../../svg-assets/LogosGitServices';
import IconHugo                     from '../../../svg-assets/IconHugo';
import FormPartialNewFromHugoTheme  from './partials/FormPartialNewFromHugoTheme';
import FormPartialNewFromScratch    from './partials/FormPartialNewFromScratch';
import FormPartialNewFromFolder     from './partials/FormPartialNewFromFolder';
import FormPartialImportFromGit     from './partials/FormPartialImportFromGit';
import { withStyles }               from '@material-ui/core/styles';
import TextField                    from '@material-ui/core/TextField';
import Button                       from '@material-ui/core/Button';
import Typography                   from '@material-ui/core/Typography';
import FolderIcon                   from '@material-ui/icons/Folder';
import BuildIcon                    from '@material-ui/icons/Build';
import Box                          from '@material-ui/core/Box';
import Grid                         from '@material-ui/core/Grid';
import Paper                        from '@material-ui/core/Paper';
import CircularProgress             from '@material-ui/core/CircularProgress';
import Dialog                       from '@material-ui/core/Dialog';
import DialogActions                from '@material-ui/core/DialogActions';
import DialogContent                from '@material-ui/core/DialogContent';
//import DialogContentText            from '@material-ui/core/DialogContentText';
import DialogTitle                  from '@material-ui/core/DialogTitle';
import Select                       from '@material-ui/core/Select';
import Switch                       from '@material-ui/core/Switch';
import FormControlLabel             from '@material-ui/core/FormControlLabel';
import FormControl                  from '@material-ui/core/FormControl';
import MenuItem                     from '@material-ui/core/MenuItem';
import InputLabel                   from '@material-ui/core/InputLabel';

const useStyles = theme => ({

  paper: {
    height: "160px",
    padding:"40px",
    cursor: "pointer",
    /*
    backgroundColor:"#eee",
    */
    '&:hover': {
      backgroundColor:"#eee",
      color:"#222"
    }
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 300,
  },
  keyButton: {
    margin: theme.spacing(1),
    marginTop: theme.spacing(2),
  },

});

class NewSiteDialog extends React.Component{

  constructor(props){
    super(props);

    let title;
    if(this.props.newOrImport === 'import'){
      title = "Import Quiqr Site";
    }
    else{
      title = "New Quiqr Site";
    }

    this.state = {

      title: title,

      filteredHugoVersions: [],

      newType: '',

      newReadyForNew: false,
      newReadyForNaming: false,
      newLastStepBusy: false,

      hugoVersionSelectDisable: false,
      hugoExtended: '',
      hugoVersion: '',

      generateQuiqrModel: false,

      newSiteNameErrorText: '',
      newSiteName: '',
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if(nextProps.importSiteURL && this.props.importSiteURL !== nextProps.importSiteURL){
      this.setState({
        newType: 'git',
      });
    }
  }

  componentDidMount(){
    service.api.getFilteredHugoVersions().then((versions)=>{
      this.setState({filteredHugoVersions: versions});
    });
  }

  checkFreeSiteName(name){
    service.api.checkFreeSiteName(name)
      .then((res)=>{
        if(res.nameFree){
          this.setState({
            newReadyForNew: true,
            newSiteNameErrorText: "",
          })
        }
        else{
          this.setState({
            newReadyForNew: false,
            newSiteNameErrorText: "Site name is already in use. Please choose another name.",
          })
        }
      })
  }

  handleSetVersion(hugover){
    let stateUpdate = {};
    if(hugover){
      stateUpdate = {
        generateQuiqrModel: false,
        hugoExtendedEnabled: false,
        hugoVersionSelectDisable: true,
      }

      if(hugover.startsWith("extended_")){
        stateUpdate.hugoVersion = "v"+hugover.replace("extended_", '');
        stateUpdate.hugoExtended = true;
      }
      else{
        stateUpdate.hugoVersion = "v"+hugover;
        stateUpdate.hugoExtended= false;
      }
    }
    else{
      stateUpdate = {
        generateQuiqrModel: true,
        hugoVersion: null,
        hugoExtended: false,
        hugoExtendedEnabled: true,
        hugoVersionSelectDisable: false,
      }
    }

    this.setState(stateUpdate);
  }

  renderStep1Cards(){
    const {classes} = this.props;

    const sourceDefsNew = [
      {
        type: 'scratch',
        title: 'FROM SCRATCH',
        icon: <BuildIcon fontSize="large" />,
        stateUpdate: {
          newType: 'scratch',
          title: "New Quiqr Site from scratch",
          dialogSize: "md",
          newReadyForNew: true,
          newReadyForNaming: true,
        }
      },
      {
        type: 'hugotheme',
        title: 'FROM A HUGO THEME',
        icon: <IconHugo style={{transform: 'scale(1.0)'}} />,
        stateUpdate: {
          newType: 'hugotheme',
          title: "New Quiqr Site from Hugo Theme",
          dialogSize: "md",
        }
      },
    ];
    const sourceDefsImport = [
      {
        type: 'folder',
        title: 'FROM FOLDER',
        icon: <FolderIcon fontSize="large" />,
        stateUpdate: {
          newType: 'folder',
          title: "Import Site from a folder with a Hugo site",
          dialogSize: "md",
        }
      },
      {
        type: 'git',
        title: 'FROM GIT SERVER URL',
        icon: <LogosGitServices />,
        stateUpdate: {
          newType: 'git',
          title: "Import Quiqr Site from GitHub, GitLab or Generic Git URL",
          dialogSize: "md",
        }
      },
    ]

    const sourceDefs = (
      this.props.newOrImport==='new' ?
      sourceDefsNew :
      sourceDefsImport
    );

    const instructions = (
      this.props.newOrImport==='new' ?
      "How to create a new site..." :
      "Choose the source you want to import from..."
    );

    const sourceCards = sourceDefs.map((source)=>{
      return (
          <Grid item xs={6} key={source.title}>
            <Paper
              onClick={()=>{
                this.setState(source.stateUpdate);
              }}
              className={classes.paper}
              elevation={5}
            >
              <Box display="flex" alignItems="center"  justifyContent="center">
                {source.icon}
              </Box>
              <Box display="flex" alignItems="center"  justifyContent="center" p={1} height={70}>
                <Typography variant="h5">{source.title}</Typography>
              </Box>
            </Paper>
          </Grid>

      )
    })

    return (

      <Box y={2}>
        <p>{instructions}</p>
        <Grid container spacing={2}>
          {sourceCards}
        </Grid>
      </Box>
    )
  }

  renderStep2Form(){

    const {classes} = this.props;

    const filteredVersionItems = this.state.filteredHugoVersions.map((version, index)=>{
      return(
        <MenuItem key={"version-"+version} value={version}>{version}</MenuItem>
      )
    });

    let fromForm;

    const finalButtonText = (
      this.props.newOrImport==='new' ?
      "Create Site" :
      "Import Site"
    );

    if(this.state.newType==="hugotheme"){
      fromForm = (
        <FormPartialNewFromHugoTheme

          onSetName={(name)=>{
            this.setState({newSiteName:name});
          }}

          onValidationDone={(newState)=>{
            this.checkFreeSiteName(this.state.newSiteName);
            this.setState(newState);
          }}
        />
      )
    }
    else if(this.state.newType==="git"){
      fromForm = (
        <FormPartialImportFromGit

          importSiteURL={this.props.importSiteURL}
          onSetName={(name)=>{
            this.setState({newSiteName:name});
          }}

          onSetVersion={(hugover)=>{
            this.handleSetVersion(hugover)
          }}

          onValidationDone={(newState)=>{
            this.checkFreeSiteName(this.state.newSiteName);
            this.setState(newState);
          }}
        />
      )
    }
    else if(this.state.newType==="scratch"){

      fromForm = (
        <FormPartialNewFromScratch
          onChange={(newState)=>{
            this.setState(newState);
          }}
        />
      )

    }

    else if(this.state.newType==="folder"){

      fromForm = (
        <FormPartialNewFromFolder

          onSetName={(name)=>{
            this.setState({newSiteName:name});
          }}

          onSetVersion={(hugover)=>{
            this.handleSetVersion(hugover)
          }}

          onValidationDone={(newState)=>{
            this.checkFreeSiteName(this.state.newSiteName);
            this.setState(newState);
          }}
        />
      )

    }

    return (
      <React.Fragment>

        {fromForm}

        <Box my={2}>
          <TextField
            fullWidth
            id="standard-full-width"
            label="Name"
            value={this.state.newSiteName}
            disabled={(this.state.newReadyForNaming ? false : true)}
            variant="outlined"
            error={(this.state.newSiteNameErrorText === '' ? false : true)}
            helperText={this.state.newSiteNameErrorText}
            onChange={(e)=>{
              this.setState({newSiteName: e.target.value})
              this.checkFreeSiteName(e.target.value);
            }}
          />
          {(this.state.newLastStepBusy ? <CircularProgress size={20} /> : null)}
        </Box>

        <Box my={2}>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="demo-simple-select-outlined-label">Hugo Version</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              disabled={this.state.hugoVersionSelectDisable}
              value={this.state.hugoVersion||""}
              onChange={(e)=>{
                const featureVersion = Number(e.target.value.split(".")[1])
                if(featureVersion > 42){
                  this.setState({
                    hugoVersion: e.target.value,
                    hugoExtendedEnabled: true
                  })
                }
                else{
                  this.setState({
                    hugoVersion: e.target.value,
                    hugoExtendedEnabled: false,
                    hugoExtended: false,
                  })
                }
              }}
              label="Publish Source and Build"
            >
              {filteredVersionItems}
            </Select>
          </FormControl>

          <FormControlLabel className={classes.keyButton}
            control={
              <Switch
                checked={this.state.hugoExtended||false}
                disabled={!this.state.hugoExtendedEnabled}
                onChange={(e)=>{
                  this.setState({hugoExtended: e.target.checked });
                }}

                name="configureActions"
                color="primary"
              />
            }
            label="Hugo Extended"
          />
        </Box>

        <Button
          variant="contained"

          disabled={(
            this.state.hugoVersion !== ''
            && this.state.newReadyForNew
            && !this.state.newLastStepBusy
              ? false : true
          )}

          onClick={()=>{

            const hugoVersion = (this.state.hugoExtended ? "extended_" : "") + this.state.hugoVersion.replace("v",'')
            this.setState({
              newLastStepBusy: true
            });

            if(this.state.newType === 'hugotheme') {

              service.api.newSiteFromPublicHugoThemeUrl(this.state.newSiteName, this.state.newTypeHugoThemeLastValidatedUrl, this.state.newHugoThemeInfoDict, hugoVersion)
                .then((siteKey)=>{
                  this.setState({
                    newLastStepBusy: false,
                    newSiteKey: siteKey,
                  });
                })
                .catch((siteKey)=>{
                  this.setState({
                    newLastStepBusy: false,
                  });
                });
            }

            if(this.state.newType === 'scratch') {

              service.api.newSiteFromScratch(this.state.newSiteName, hugoVersion, this.state.newTypeScratchConfigFormat)
                .then((siteKey)=>{
                  this.setState({
                    newLastStepBusy: false,
                    newSiteKey: siteKey,
                  });
                })
                .catch((siteKey)=>{
                  this.setState({
                    newLastStepBusy: false,
                  });
                });
            }

            if(this.state.newType === 'folder') {

              service.api.newSiteFromLocalDirectory(this.state.newSiteName, this.state.newTypeFolderLastValidatedPath, this.state.generateQuiqrModel, hugoVersion)
                .then((siteKey)=>{
                  this.setState({
                    newLastStepBusy: false,
                    newSiteKey: siteKey,
                  });
                })
                .catch((siteKey)=>{
                  this.setState({
                    newLastStepBusy: false,
                  });
                });
            }

            if(this.state.newType === 'git') {

              if(this.state.gitPrivateRepo){

                const prvdata= this.state.privData;
                service.api.importSiteFromPrivateGitRepo(prvdata.username, prvdata.repository, prvdata.deployPrivateKey, prvdata.email, true, this.state.newSiteName)
                  .then((siteKey)=>{
                    this.setState({
                      newLastStepBusy: false,
                      newSiteKey: siteKey,
                    });
                  })
                  .catch((siteKey)=>{

                    snackMessageService.addSnackMessage('Import Failed');
                    this.setState({
                      newLastStepBusy: false,
                    });
                  });
              }
              else{
                service.api.importSiteFromPublicGitUrl(this.state.newSiteName, this.state.importTypeGitLastValidatedUrl)
                  .then((siteKey)=>{
                    this.setState({
                      newLastStepBusy: false,
                      newSiteKey: siteKey,
                    });
                  })
                  .catch((siteKey)=>{
                    this.setState({
                      newLastStepBusy: false,
                    });
                  });

              }

            }


          }} color="primary">{finalButtonText}</Button>

      </React.Fragment>
    );
  }

  async handleOpenNewSite(){
    this.props.mountSite(this.state.newSiteKey)
    this.props.onClose();
  }

  renderStep3NewFinished(){
    return (
      <div>
        The site has been succesfully created. <Button onClick={()=>{this.handleOpenNewSite()}}>Open {this.state.newSiteName} now</Button>.
      </div>
    )
  }

  render(){

    let { open } = this.props;
    let newButtonHidden = true;
    let backButtonHidden = true;
    let closeText = "cancel";
    let content;


    if(!this.state.newSiteKey && !this.state.newType){
      content = this.renderStep1Cards()
      backButtonHidden = true;
    }
    else if(!this.state.newSiteKey){
      content = this.renderStep2Form();
      backButtonHidden = false;
    }
    else{
      content = this.renderStep3NewFinished();
      newButtonHidden = false;
      backButtonHidden = true;
      closeText = "close";
    }

    if(this.props.importSiteURL){
      backButtonHidden = true;
    }

    const actions = [

      (backButtonHidden ? null :
        <Button
          key={"actionNewDialog2"}
          color="primary" onClick={()=>{ this.setState({newType:""});}} >
          {"back"}
        </Button>),


      <Button
        key={"actionNewDialog1"}
        color="primary" onClick={()=>{
          this.setState({newSiteKey:null});
          this.props.onClose();
        }}>
        {closeText}
      </Button>,
      (newButtonHidden ? null :
        <Button
          key={"actionNewDialog2"}
          color="primary" onClick={()=>{this.handleOpenNewSite()}}>
          {"open "+ this.state.newSiteName}
        </Button>),
    ];

    return (
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth={"md"}
      >
        <SnackbarManager />

        <DialogTitle id="alert-dialog-title">{this.state.title}</DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
        <DialogActions>
          {actions}
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(useStyles)(NewSiteDialog);
