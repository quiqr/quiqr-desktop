import * as React            from 'react';
import service               from '../../../../services/service';
import LogosGitServices      from '../../../../svg-assets/LogosGitServices';
import IconQuiqr             from '../../../../svg-assets/IconQuiqr';
import ScreenShotPlaceholder from '../../../../img-assets/screenshot-placeholder.png';
import { withStyles }        from '@material-ui/core/styles';
import TextField             from '@material-ui/core/TextField';
import Button                from '@material-ui/core/Button';
import Typography            from '@material-ui/core/Typography';
import FolderIcon            from '@material-ui/icons/Folder';
import Box                   from '@material-ui/core/Box';
import Chip                  from '@material-ui/core/Chip';
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

const useStyles = theme => ({

  root: {
    margin: 0,
    display: 'flex',
    //padding: theme.spacing(2),
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },

  rightButton: {
    marginLeft: theme.spacing(1),
    width: 400,
    height: 55,
    //paddingLeft: 10,
    //paddingRight: 10,
    //whiteSpace: 'nowrap',
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
  }
});

const regexpHttp      = new RegExp('^http(s?)://', 'i')

class ImportSiteDialog extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      title: "Import Quiqr Site",

      importNameErrorText: '',

      importType: 'git',
      importTypeGitUrl: '',
      importTypeGitBusy: false,
      importTypeGitReadyForValidation: false,
      importTypeGitLastValidatedUrl: '',
      importTypeGitReadyForImport: false,
      importTypeGitProvider: '',
      importTypeGitErrorText: '',
      importTypeGitScreenshot: null,

      importHugoVersion: '',
      importHugoTheme: '',

      importQuiqrModel: '',
      importQuiqrForms: '',
      importSiteName: '',
    }
  }

  resetImportTypeGitState(){
    this.setState({
      importTypeGitProvider: '',
      importTypeGitErrorText: '',
      importTypeGitBusy: false,
      importTypeGitLastValidatedUrl: '',
      importTypeGitReadyForValidation: false,
      importTypeGitReadyForImport: false,
      importTypeGitScreenshot: null,

      importHugoVersion: '',
      importHugoTheme: '',

      importQuiqrModel: '',
      importQuiqrForms: '',

      importSiteName: '',
    })

  }

  componentWillMount(){
  }

  validateURL(url){

    this.resetImportTypeGitState();

    const regexpGitHub    = new RegExp('^https://github.com/', 'i')
    const regexpGitLab    = new RegExp('^https://gitlab.com/', 'i')
    const regexpSourceHut = new RegExp('^https://git.sr.ht/', 'i')

    //who is the provider?


    this.setState({importTypeGitBusy: true});

    if(regexpGitHub.test(url)){
      this.setState({importTypeGitProvider: 'GitHub'});
    }
    else if(regexpGitLab.test(url)){
      this.setState({importTypeGitProvider: 'GitLab'});
    }
    else if(regexpSourceHut.test(url)){
      this.setState({importTypeGitProvider: 'SourceHut'});
    }

    var urlparts = url.split('/');
    var lastSegment = urlparts.pop() || urlparts.pop();  // handle potential trailing slash
    if(lastSegment.includes(".")) lastSegment = lastSegment.split(".").pop();
    if(lastSegment !== ""){
      this.setState({importSiteName:lastSegment});
    }

    service.api.quiqr_git_repo_show(url)
      .then((response)=>{
        if(response){
          this.setState({
            importTypeGitScreenshot: (response.Screenshot ? response.Screenshot:null),
            importHugoVersion: (response.HugoVersion ? response.HugoVersion:null),
            importHugoTheme: (response.HugoTheme ? response.HugoTheme:null),
            importQuiqrModel: (response.QuiqrModel? response.QuiqrModel:null),
            importQuiqrForms: (response.QuiqrFormsEndPoints ? response.QuiqrFormsEndPoints:null),
            importTypeGitBusy: false,
            importTypeGitLastValidatedUrl: url,
            importTypeGitReadyForImport: true,
          })
        }
      })
      .catch((e)=>{
        this.setState({
          importTypeGitErrorText: "It seems that the URL does not point to a valid git repository",
          importTypeGitBusy: false
        });
      });
  }

  renderCards(){
    const {classes} = this.props;
    return (

      <Box y={2}>
        <p>Choose the source you want to import from...</p>
        <Grid container  spacing={2}>
          <Grid item xs={6}>
            <Paper
              onClick={()=>{
                this.setState({
                  importType: 'git',
                  title: "Import Quiqr Site from GitHub, GitLab or Generic Git URL",
                  dialogSize: "md",
                })
              }}
              className={classes.paper}
              elevation={5}
            >
              <Box display="flex" alignItems="center"  justifyContent="center">
                <LogosGitServices />
              </Box>
              <Box display="flex" alignItems="center"  justifyContent="center" p={1} height={70}>
                <Typography variant="h5">GIT SERVER</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper
              onClick={()=>{
                this.setState({importType: 'quiqr-archive',
                  dialogSize: "md",
                })
              }}
              className={classes.paper}
              elevation={5}
            >
              <Box display="flex" alignItems="center" justifyContent="center" height={70}>
                <IconQuiqr style={{transform: 'scale(2.5)'}} />
              </Box>
              <Box display="flex" alignItems="center"  justifyContent="center" p={1}>
                <Typography variant="h5">QUIQR ARCHIVE</Typography>
              </Box>

            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper
              onClick={()=>{
                this.setState({importType: 'folder',
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
                <Typography variant="h5">FOLDER</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    )
  }

  renderForm(){

    const {classes} = this.props;


    if(this.state.importType==="git"){
      return (
        <Box>
          <Box my={3}>
            <p>
              Enter a public git URL with a quiqr website or template to import.
            </p>
          </Box>
          <Box my={3} sx={{display:'flex'}}>
            <TextField
              fullWidth
              id="standard-full-width"
              label="Git URL"
              value={this.state.importTypeGitUrl}
              variant="outlined"
              onChange={(e)=>{
                this.setState({importTypeGitUrl: e.target.value});

                if(e.target.value && e.target.value !== ''){
                  if(this.state.importTypeGitLastValidatedUrl !== e.target.value){

                    //is this a valid public git url
                    if(!regexpHttp.test(e.target.value)){
                      this.setState({
                        importTypeGitErrorText: 'URL is invalid. Currently only http:// or https:// are supported.',
                        importTypeGitReadyForValidation: false,
                      });
                    }
                    else{
                      this.setState({
                        importTypeGitErrorText: '',
                        importTypeGitReadyForValidation: true,
                      });
                    }

                  }
                  else{
                    this.setState({
                      importTypeGitErrorText: '',
                      importTypeGitReadyForValidation: false,
                    });
                  }

                }


              }}
              error={(this.state.importTypeGitErrorText === '' ? false : true)}
              helperText={this.state.importTypeGitErrorText}
            />
            <Button variant="contained" disabled={(this.state.importTypeGitBusy || !this.state.importTypeGitReadyForValidation ? true : false)} className={classes.rightButton} color="primary" onClick={()=>{
              this.validateURL(this.state.importTypeGitUrl);
            }}>Validate Remote Repository</Button>

          </Box>


          <Box my={3}>
            <Card className={classes.root} variant="outlined" style={{backgroundColor:'#eee'}}>
              <CardMedia
                className={classes.cover}
                image={(this.state.importTypeGitScreenshot?this.state.importTypeGitScreenshot:ScreenShotPlaceholder)}
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
                              Git URL
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{this.state.importTypeGitLastValidatedUrl}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                              Git Provider
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{this.state.importTypeGitProvider}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                              Hugo Version
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{(this.state.importTypeGitBusy ? <CircularProgress size={20} /> : null)} {this.state.importHugoVersion}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                              Hugo Theme
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{this.state.importHugoTheme}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                              Quiqr Model
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{this.state.importQuiqrModel}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell align="right">
                            <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                              Quiqr Forms
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{this.state.importQuiqrForms}</TableCell>
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
              value={this.state.importSiteName}
              disabled={(this.state.importTypeGitReadyForImport?false:true)}
              variant="outlined"
              error={(this.state.importNameErrorText === '' ? false : true)}
              helperText={this.state.importNameErrorText}
            />
          </Box>
          <Button variant="contained" disabled={(this.state.importTypeGitReadyForImport?false:true)} color="primary">Import Site</Button>

        </Box>

      )

    }
    else{
      return null;
    }
  }

  render(){

    let { open } = this.props;
    let importButtonHidden = true;

    const actions = [
      <Button color="primary" onClick={()=>{
        this.setState({importTypeGitBusy: false })
        this.props.onClose();
      }}>
        {"cancel"}
      </Button>,
      (importButtonHidden ? null :
        <Button color="primary" disabled={!this.state.importButtonEnabled} onClick={()=>{

        }}>
          {"save"}
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
            {(this.state.importType ? this.renderForm() : this.renderCards())}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {actions}
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(useStyles)(ImportSiteDialog);
