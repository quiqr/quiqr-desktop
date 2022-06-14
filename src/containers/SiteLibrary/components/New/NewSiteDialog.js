import * as React            from 'react';
import service               from '../../../../services/service';
//import LogosGitServices      from '../../../../svg-assets/LogosGitServices';
import IconHugo              from '../../../../svg-assets/IconHugo';
import ScreenShotPlaceholder from '../../../../img-assets/screenshot-placeholder.png';
import { withStyles }        from '@material-ui/core/styles';
import TextField             from '@material-ui/core/TextField';
import Button                from '@material-ui/core/Button';
import Typography            from '@material-ui/core/Typography';
//import FolderIcon            from '@material-ui/icons/Folder';
//import BuildIcon             from '@material-ui/icons/Build';
import Box                   from '@material-ui/core/Box';
import Grid                  from '@material-ui/core/Grid';
import Paper                 from '@material-ui/core/Paper';
import CircularProgress      from '@material-ui/core/CircularProgress';
import Table                 from '@material-ui/core/Table';
import TableRow              from '@material-ui/core/TableRow';
import TableCell             from '@material-ui/core/TableCell';
import TableBody             from '@material-ui/core/TableBody';
import TableContainer        from '@material-ui/core/TableContainer';
import Card                  from '@material-ui/core/Card';
import CardContent           from '@material-ui/core/CardContent';
import CardMedia             from '@material-ui/core/CardMedia';
import Dialog                from '@material-ui/core/Dialog';
import DialogActions         from '@material-ui/core/DialogActions';
import DialogContent         from '@material-ui/core/DialogContent';
import DialogContentText     from '@material-ui/core/DialogContentText';
import DialogTitle           from '@material-ui/core/DialogTitle';
import Select                from '@material-ui/core/Select';
import Switch              from '@material-ui/core/Switch';
import FormControlLabel    from '@material-ui/core/FormControlLabel';
import FormControl         from '@material-ui/core/FormControl';
import MenuItem            from '@material-ui/core/MenuItem';
import InputLabel          from '@material-ui/core/InputLabel';

const useStyles = theme => ({

  root: {
    margin: 0,
    display: 'flex',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },

  rightButton: {
    marginLeft: theme.spacing(1),
    width: 400,
    height: 55,
  },

  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: 351,
  },

  serverFormLogo: {
    position: 'absolute',
    right: theme.spacing(3),
    top: theme.spacing(3),
  },

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
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  keyButton: {
    margin: theme.spacing(1),
    marginTop: theme.spacing(2),
  },

});

const regexpHttp      = new RegExp('^http(s?)://', 'i')

class NewSiteDialog extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      title: "New Quiqr Site",
      filteredHugoVersions: [],
      newNameErrorText: '',

      newType: '',
      newTypeHugoThemeUrl: '',
      newTypeHugoThemeBusy: false,
      newTypeHugoThemeReadyForValidation: false,
      newTypeHugoThemeLastValidatedUrl: '',
      newTypeHugoThemeReadyForNew: false,
      newTypeHugoThemeReadyForNaming: false,
      newTypeHugoThemeNewingBusy: false,
      newTypeHugoThemeProvider: '',
      newTypeHugoThemeErrorText: '',
      newTypeHugoThemeScreenshot: null,

      hugoExtended: '',
      hugoVersion: '',
      newHugoTheme: '',

      newQuiqrModel: '',
      newQuiqrForms: '',
      newSiteName: '',
    }
  }

  resetNewTypeHugoThemeState(){
    this.setState({
      newTypeHugoThemeProvider: '',
      newTypeHugoThemeErrorText: '',
      newTypeHugoThemeBusy: false,
      newTypeHugoThemeLastValidatedUrl: '',
      newTypeHugoThemeReadyForValidation: false,
      newTypeHugoThemeReadyForNew: false,
      newTypeHugoThemeReadyForNaming: false,
      newTypeHugoThemeNewingBusy: false,
      newTypeHugoThemeScreenshot: null,

      newHugoThemeMinVersion: null,
      newHugoThemeName: null,
      newHugoThemeLicense: null,
      newHugoThemeLicenseLink: null,
      newHugoThemeHomepage: null,
      newHugoThemeDemopage: null,
      newHugoThemeDescription: null,
      newHugoThemeExampleSite: null,
      newHugoThemeAuthor: null,
      newHugoThemeAuthorHomepage: null,

      newNameErrorText: "",

      newSiteName: '',
    })

  }

  componentDidMount(){
    service.api.getFilteredHugoVersions().then((versions)=>{
      this.setState({filteredHugoVersions: versions});
    });
  }

  validateURL(url){

    this.resetNewTypeHugoThemeState();

    const regexpGitHub    = new RegExp('^https://github.com/', 'i')
    const regexpGitLab    = new RegExp('^https://gitlab.com/', 'i')
    const regexpSourceHut = new RegExp('^https://git.sr.ht/', 'i')

    //who is the provider?

    this.setState({newTypeHugoThemeBusy: true});

    if(regexpGitHub.test(url)){
      this.setState({newTypeHugoThemeProvider: 'GitHub'});
    }
    else if(regexpGitLab.test(url)){
      this.setState({newTypeHugoThemeProvider: 'GitLab'});
    }
    else if(regexpSourceHut.test(url)){
      this.setState({newTypeHugoThemeProvider: 'SourceHut'});
    }

    var urlparts = url.split('/');
    var siteNameFromUrl = urlparts.pop() || urlparts.pop();  // handle potential trailing slash
    if(siteNameFromUrl.includes(".")) siteNameFromUrl = siteNameFromUrl.split(".").pop();
    if(siteNameFromUrl !== ""){
      this.setState({newSiteName:siteNameFromUrl});
    }

    service.api.hugotheme_git_repo_show(url)
      .then((response)=>{
        if(response){
          this.setState({
            newTypeHugoThemeScreenshot: (response.Screenshot ? response.Screenshot:null),

            newHugoThemeInfoDict: response,

            newHugoThemeMinVersion: (response.MinHugoVersion ? response.MinHugoVersion:null),
            newHugoThemeName: (response.Name ? response.Name : null),
            newHugoThemeLicense: (response.License ? response.License : null),
            newHugoThemeLicenseLink: (response.LicenseLink ? response.LicenseLink : null),
            newHugoThemeHomepage: (response.Homepage ? response.Homepage : null),
            newHugoThemeDemopage: (response.Demosite ? response.Demosite : null),
            newHugoThemeDescription: (response.Description ? response.Description : null),
            newHugoThemeExampleSite: (response.ExampleSite ? response.ExampleSite : false),
            newHugoThemeAuthor: (response.Author ? response.Author:null),
            newHugoThemeAuthorHomepage: (response.AuthorHomepage ? response.AuthorHomepage:null),

            newTypeHugoThemeBusy: false,
            newTypeHugoThemeLastValidatedUrl: url,
            newTypeHugoThemeReadyForNaming: true,
          })
          this.checkFreeSiteName(siteNameFromUrl);
        }
      })
      .catch((e)=>{
        this.setState({
          newTypeHugoThemeErrorText: "It seems that the URL does not point to a valid git repository",
          newTypeHugoThemeBusy: false
        });
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
          {/*

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
          */}
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

    if(this.state.newType==="hugotheme"){
      return (
        <Box>
          <Box my={3}>
            <p>
              Enter a public git URL with a Hugo theme.
            </p>
          </Box>
          <Box my={3} sx={{display:'flex'}}>
            <TextField
              fullWidth
              id="standard-full-width"
              autoFocus
              label="Hugo Theme Git URL"
              value={this.state.newTypeHugoThemeUrl}
              variant="outlined"
              onChange={(e)=>{
                this.setState({newTypeHugoThemeUrl: e.target.value});

                if(e.target.value && e.target.value !== ''){
                  if(this.state.newTypeHugoThemeLastValidatedUrl !== e.target.value){

                    //is this a valid public git url
                    if(!regexpHttp.test(e.target.value)){
                      this.setState({
                        newTypeHugoThemeErrorText: 'URL is invalid. Currently only http:// or https:// are supported.',
                        newTypeHugoThemeReadyForValidation: false,
                      });
                    }
                    else{
                      this.setState({
                        newTypeHugoThemeErrorText: '',
                        newTypeHugoThemeReadyForValidation: true,
                      });
                    }

                  }
                  else{
                    this.setState({
                      newTypeHugoThemeErrorText: '',
                      newTypeHugoThemeReadyForValidation: false,
                    });
                  }

                }


              }}
              error={(this.state.newTypeHugoThemeErrorText === '' ? false : true)}
              helperText={this.state.newTypeHugoThemeErrorText}
            />
            <Button variant="contained" disabled={(this.state.newTypeHugoThemeBusy || !this.state.newTypeHugoThemeReadyForValidation ? true : false)} className={classes.rightButton} color="primary" onClick={()=>{
              this.validateURL(this.state.newTypeHugoThemeUrl);
            }}>Validate Remote Repository</Button>

          </Box>


          <Box my={3}>
            <Card className={classes.root} variant="outlined" style={{backgroundColor:'#eee'}}>
              <CardMedia
                className={classes.cover}
                image={(this.state.newTypeHugoThemeScreenshot?this.state.newTypeHugoThemeScreenshot:ScreenShotPlaceholder)}
                title="site screenshot"
              />
              <div className={classes.details}>
                <CardContent className={classes.content}>


                  <TableContainer xcomponent={Paper}>
                    <Table className={classes.table} size="small" aria-label="a dense table">
                      <TableBody>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                              Hugo Theme Git URL
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{this.state.newTypeHugoThemeLastValidatedUrl}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                              Git Provider
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{this.state.newTypeHugoThemeProvider}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                             Example Content
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{(this.state.newHugoThemeExampleSite ? "Present" : "")}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                              Name
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{(this.state.newTypeHugoThemeBusy ? <CircularProgress size={20} /> : null)} {this.state.newHugoThemeName}
                            {(this.state.newHugoThemeHomepage? <Button onClick={()=>{window.require('electron').shell.openExternal(this.state.newHugoThemeHomepage)}}>Homepage</Button> : null) }
                            {(this.state.newHugoThemeDemopage? <Button onClick={()=>{window.require('electron').shell.openExternal(this.state.newHugoThemeDemopage)}}>Demo</Button> : null) }
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                             Description
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{this.state.newHugoThemeDescription}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                              Author
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{(this.state.newHugoThemeAuthorHomepage? <Button onClick={()=>{window.require('electron').shell.openExternal(this.state.newHugoThemeAuthorHomepage)}}>{this.state.newHugoThemeAuthor}</Button> : this.state.newHugoThemeAuthor) }</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                              Licence
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{(this.state.newHugoThemeLicenseLink? <Button onClick={()=>{window.require('electron').shell.openExternal(this.state.newHugoThemeLicenseLink)}}>{this.state.newHugoThemeLicense}</Button> : this.state.newHugoThemeLicense) }</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                              Minimal Hugo version
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{this.state.newHugoThemeMinVersion}</TableCell>
                        </TableRow>

                      </TableBody>
                    </Table>
                  </TableContainer>

                </CardContent>
              </div>

            </Card>
          </Box>

          <Box my={3}>
            <TextField
              fullWidth
              id="standard-full-width"
              label="Name"
              value={this.state.newSiteName}
              disabled={(this.state.newTypeHugoThemeReadyForNaming?false:true)}
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

          <Button variant="contained" disabled={(this.state.hugoVersion !== '' && this.state.newTypeHugoThemeReadyForNew && !this.state.newTypeHugoThemeNewingBusy ? false : true)} onClick={()=>{

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

        </Box>

      )

    }
    else{
      return null;
    }
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
