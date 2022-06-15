import * as React           from 'react';
import service              from '../../../../services/service';
//import LogosGitServices      from '../../../../svg-assets/LogosGitServices';
import IconHugo             from '../../../../svg-assets/IconHugo';
import HugoThemeFormPartial from './HugoThemeFormPartial';
import FolderFormPartial    from './FolderFormPartial';
import { withStyles }       from '@material-ui/core/styles';
import TextField            from '@material-ui/core/TextField';
import Button               from '@material-ui/core/Button';
import Typography           from '@material-ui/core/Typography';
import FolderIcon           from '@material-ui/icons/Folder';
//import BuildIcon             from '@material-ui/icons/Build';
import Box                  from '@material-ui/core/Box';
import Grid                 from '@material-ui/core/Grid';
import Paper                from '@material-ui/core/Paper';
import CircularProgress     from '@material-ui/core/CircularProgress';
import Dialog               from '@material-ui/core/Dialog';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import DialogTitle          from '@material-ui/core/DialogTitle';
import Select               from '@material-ui/core/Select';
import Switch               from '@material-ui/core/Switch';
import FormControlLabel     from '@material-ui/core/FormControlLabel';
import FormControl          from '@material-ui/core/FormControl';
import MenuItem             from '@material-ui/core/MenuItem';
import InputLabel           from '@material-ui/core/InputLabel';

const useStyles = theme => ({

  paper: {
    height: "160px",
    padding:"40px",
    cursor: "pointer",
    backgroundColor:"#eee",
    '&:hover': {
      backgroundColor:"#ccc"
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

    this.state = {
      title: "New Quiqr Site",
      filteredHugoVersions: [],
      newNameErrorText: '',

      newType: '',
      newTypeHugoThemeBusy: false,
      newTypeHugoThemeLastValidatedUrl: '',
      newTypeHugoThemeReadyForNew: false,
      newReadyForNaming: false,
      newTypeHugoThemeNewingBusy: false,

      hugoExtended: '',
      hugoVersion: '',
      newSiteName: '',
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
            newTypeHugoThemeReadyForNew: true,
            newNameErrorText: "",
          })
        }
        else{
          this.setState({
            newTypeHugoThemeReadyForNew: false,
            newNameErrorText: "Site name is already in use. Please choose another name.",
          })
        }
      })
  }

  renderStep1Cards(){
    const {classes} = this.props;
    return (

      <Box y={2}>
        <p>Choose the source you want to new from...</p>
        <Grid container  spacing={2}>
          {/*
          <Grid item xs={6}>
            <Paper
              onClick={()=>{
                this.setState({
                  newType: 'scratch',
                  title: "New Quiqr Site from scratch",
                  dialogSize: "md",
                })
              }}
              className={classes.paper}
              elevation={5}
            >
              <Box display="flex" alignItems="center"  justifyContent="center">
                <BuildIcon fontSize="large"  color="#ccc"/>
              </Box>
              <Box display="flex" alignItems="center"  justifyContent="center" p={1} height={70}>
                <Typography variant="h5">FROM SCRATCH</Typography>
              </Box>
            </Paper>
          </Grid>
          */}

          <Grid item xs={6}>
            <Paper
              onClick={()=>{
                this.setState({
                  newType: 'hugotheme',
                  title: "New Quiqr Site from Hugo Theme",
                  dialogSize: "md",
                })
              }}
              className={classes.paper}
              elevation={5}
            >
              <Box display="flex" alignItems="center" justifyContent="center" height={70}>
                <IconHugo style={{transform: 'scale(1.0)'}} />
              </Box>
              <Box display="flex" alignItems="center"  justifyContent="center" p={1}>
                <Typography variant="h5">FROM HUGO THEME</Typography>
              </Box>

            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper
              onClick={()=>{
                this.setState({newType: 'folder',
                  dialogSize: "md",
                })
              }}
              className={classes.paper}
              elevation={5}
            >
              <Box display="flex" alignItems="center"  justifyContent="center" height={70}>
                <FolderIcon fontSize="large"  color="#ccc"/>
              </Box>
              <Box display="flex" alignItems="center"  justifyContent="center" p={1}>
                <Typography variant="h5">FROM FOLDER</Typography>
              </Box>
            </Paper>
          </Grid>

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

    if(this.state.newType==="hugotheme"){
      fromForm = (
        <HugoThemeFormPartial

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
    else if(this.state.newType==="folder"){

      fromForm = (
      <FolderFormPartial

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

    return (
      <React.Fragment>

        {fromForm}

        <Box my={3}>
          <TextField
            fullWidth
            id="standard-full-width"
            label="Name"
            value={this.state.newSiteName}
            disabled={(this.state.newReadyForNaming?false:true)}
            variant="outlined"
            error={(this.state.newNameErrorText === '' ? false : true)}
            helperText={this.state.newNameErrorText}
            onChange={(e)=>{
              this.setState({newSiteName: e.target.value})
              this.checkFreeSiteName(e.target.value);
            }}
          />
          {(this.state.newTypeHugoThemeNewingBusy ? <CircularProgress size={20} /> : null)}
        </Box>

        <Box my={2}>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="demo-simple-select-outlined-label">Hugo Version</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={this.state.hugoVersion}
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
                checked={this.state.hugoExtended}
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
              && this.state.newTypeHugoThemeReadyForNew
              && !this.state.newTypeHugoThemeNewingBusy
                ? false : true
          )}

          onClick={()=>{
            if(this.state.newType)

            this.setState({
              newTypeHugoThemeNewingBusy: true
            });

            const hugoVersion = (this.state.hugoExtended ? "extended_" : "") + this.state.hugoVersion.replace("v",'')

            service.api.newSiteFromPublicHugoThemeUrl(this.state.newSiteName, this.state.newTypeHugoThemeLastValidatedUrl, this.state.newHugoThemeInfoDict, hugoVersion)
              .then((siteKey)=>{
                this.setState({
                  newTypeHugoThemeNewingBusy: false,
                  newSiteKey: siteKey,
                });
              })
              .catch((siteKey)=>{
                this.setState({
                  newTypeHugoThemeNewingBusy: false,
                });
              });


          }} color="primary">New Site</Button>


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
        The site has been succesfully newed. <Button onClick={()=>{this.handleOpenNewSite()}}>Open {this.state.newSiteName} now</Button>.
      </div>
    )
  }

  render(){

    let { open } = this.props;
    let newButtonHidden = true;
    let closeText = "cancel";
    let content;

    if(!this.state.newSiteKey && !this.state.newType){
      content = this.renderStep1Cards()

    }
    else if(!this.state.newSiteKey){
      content = this.renderStep2Form();
    }
    else{
      content = this.renderStep3NewFinished();
      newButtonHidden = false;
      closeText = "close";
    }

    const actions = [
      <Button
        key={"actionNewDialog1"}
        color="primary" onClick={()=>{
          this.setState({newTypeHugoThemeBusy: false })
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
        <DialogTitle id="alert-dialog-title">{this.state.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {actions}
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(useStyles)(NewSiteDialog);
