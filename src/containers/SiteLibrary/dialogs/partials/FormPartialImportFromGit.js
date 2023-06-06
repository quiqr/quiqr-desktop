import * as React            from 'react';
import service               from '../../../../services/service';
import { withStyles }        from '@material-ui/core/styles';
import CircularProgress      from '@material-ui/core/CircularProgress';
import Table                 from '@material-ui/core/Table';
import TableRow              from '@material-ui/core/TableRow';
import TableCell             from '@material-ui/core/TableCell';
import TableBody             from '@material-ui/core/TableBody';
import TableContainer        from '@material-ui/core/TableContainer';
import Card                  from '@material-ui/core/Card';
import CardContent           from '@material-ui/core/CardContent';
import CardMedia             from '@material-ui/core/CardMedia';
import ScreenShotPlaceholder from '../../../../img-assets/screenshot-placeholder.png';
import TextField             from '@material-ui/core/TextField';
import Button                from '@material-ui/core/Button';
import Paper                from '@material-ui/core/Paper';
import Typography            from '@material-ui/core/Typography';
import Box                   from '@material-ui/core/Box';
import Switch                       from '@material-ui/core/Switch';
import FormControlLabel             from '@material-ui/core/FormControlLabel';
import FormControl         from '@material-ui/core/FormControl';
import Visibility          from '@material-ui/icons/Visibility';
import VisibilityOff       from '@material-ui/icons/VisibilityOff';
import IconButton          from '@material-ui/core/IconButton';
import InputLabel          from '@material-ui/core/InputLabel';
import InputAdornment      from '@material-ui/core/InputAdornment';
import LinearProgress      from '@material-ui/core/LinearProgress';
import clsx                from 'clsx';
import OutlinedInput       from '@material-ui/core/OutlinedInput';


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

  keyButton: {
    margin: theme.spacing(1),
    marginTop: theme.spacing(2),
  },

  textfield: {
    margin: theme.spacing(1),
  },

  progressLabel:{
    marginLeft: theme.spacing(3),
    backgroundColor: "white",
  },


  keyField: {
    margin: theme.spacing(1),
    width: '60ch',
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 300,
  }

});


const regexpHttp = new RegExp('^http(s?)://', 'i')
class FormPartialNewFromScratch extends React.Component{

  constructor(props){
    super(props);

    this.state = {

      importTypeGitUrl: '',
      importTypeGitBusy: false,
      importTypeGitReadyForValidation: false,
      importTypeGitLastValidatedUrl: '',
      importTypeGitProvider: '',
      importTypeGitErrorText: '',
      importTypeGitScreenshot: null,

      showPassword: false,

      privReadyForVal: false,
      privBusy: false,
      privData:{
        type: 'github',
        username:'',
        email:'',
        repository:'',
        branch:'main',
        deployPrivateKey:'',
        deployPublicKey:'',
      },
      keyPairBusy: false,

      importHugoTheme: '',

      importQuiqrModel: '',
      importQuiqrForms: '',

    }
  }

  getKeyPair(){
    this.setState({
      keyPairBusy: true
    });

    let promise = service.api.createKeyPairGithub();

    promise.then((resp)=>{
      this.updatePubData({deployPrivateKey: resp.keyPair[0], deployPublicKey: resp.keyPair[1] },
        ()=>{
          this.setState({ keyPairBusy: false })
        }
      );

    }, (e)=>{
      service.api.logToConsole(e, "ERRR")
      this.setState({
        keyPairBusy: false
      });
    })
  }

  updatePubData(newData, callback=null){
    let privData = {...this.state.privData, ...newData};
    this.setState({privData: privData}, ()=>{
      if(privData.username !== '' && privData.repository !=='' && privData.branch !== '' && privData.email !== ''){
        this.setState({privReadyForVal: true})

        this.props.onSetName(privData.repository)

        this.props.onValidationDone({
          newReadyForNaming:true,
          gitPrivateRepo:true,
          privData: this.state.privData
        })


      }
      else{
        this.setState({privReadyForVal: false})
      }
      typeof callback === 'function' && callback();
    });

  }

  componentDidMount(){
    if(this.props.importSiteURL && this.state.importTypeGitUrl !== this.props.importSiteURL){
      this.setState({importTypeGitUrl: this.props.importSiteURL},
        ()=>{
          if(this.preValidateURL(this.props.importSiteURL)){
            this.validateURL(this.props.importSiteURL);
          }
        }
      );
    }

  }

  componentWillUpdate(nextProps, nextState) {
    if(this.state.importTypeGitUrl !== nextProps.importSiteURL && nextProps.importSiteURL ){
      this.setState({importTypeGitUrl: nextProps.importSiteURL},
        ()=>{
          if(this.preValidateURL(nextProps.importSiteURL)){
            this.validateURL(nextProps.importSiteURL);
          }
        }
      );
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
      importTypeGitReadyForNaming: false,
      importTypeGitImportingBusy: false,
      importTypeGitScreenshot: null,

      importHugoTheme: '',

      importQuiqrModel: '',
      importQuiqrForms: '',

      importNameErrorText: "",

      importSiteName: '',
    })

  }

  //is this a valid public git url
  preValidateURL(url){
    if(!regexpHttp.test(url)){
      this.setState({
        importTypeGitErrorText: 'URL is invalid. Currently only http:// or https:// are supported.',
        importTypeGitReadyForValidation: false,
      });
      return false;
    }
    else{
      this.setState({
        importTypeGitErrorText: '',
        importTypeGitReadyForValidation: true,
      });
      return true;
    }
  }

  validatePrivRepo(){
    this.props.onSetVersion();

    this.props.onValidationDone({
      newReadyForNaming:true,
      gitPrivateRepo:true,
      privData: this.state.privData
    })
  }


  validateURL(url){

    this.props.onSetVersion();
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
    else{
      this.setState({importTypeGitProvider: 'Unknown'});
    }

    var urlparts = url.split('/');
    var siteNameFromUrl = urlparts.pop() || urlparts.pop();  // handle potential trailing slash
    if(siteNameFromUrl.includes(".")) siteNameFromUrl = siteNameFromUrl.split(".").pop();

    if(siteNameFromUrl !== ""){
      this.props.onSetName(siteNameFromUrl)
    }

    service.api.quiqr_git_repo_show(url)
      .then((response)=>{
        if(response){
          this.setState({
            importTypeGitScreenshot: (response.Screenshot ? response.Screenshot:null),
            importHugoTheme: (response.HugoTheme ? response.HugoTheme:null),
            importQuiqrModel: (response.QuiqrModel? response.QuiqrModel:null),
            importQuiqrForms: (response.QuiqrFormsEndPoints ? response.QuiqrFormsEndPoints:null),
            importTypeGitBusy: false,
            importTypeGitLastValidatedUrl: url,
            importTypeGitReadyForNaming: true,
          })

          if(response.HugoVersion){
            this.props.onSetVersion(response.HugoVersion);
          }

          this.props.onValidationDone({
            newReadyForNaming:true,
            importTypeGitLastValidatedUrl: url,
            importTypeGitInfoDict: response,
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

  renderDeployKeyForm(){
    const {classes} = this.props;

    return (
      <React.Fragment>
        <Box my={1}>
          <TextField
            id="username-organization"
            label="Username / Organization"
            helperText="GitHub username or organization containing the target repository"
            variant="outlined"
            className={classes.textfield}
            value={this.state.privData.username}
            onChange={(e)=>{
              this.updatePubData({username: e.target.value });
            }}
          />
          <TextField
            id="email"
            label="E-mail"
            helperText="E-mail address to use for commit messagessages"
            variant="outlined"
            className={classes.textfield}
            value={this.state.privData.email}
            onChange={(e)=>{
              this.updatePubData({email: e.target.value });
            }}
          />
        </Box>
        <Box my={1}>
          <TextField
            id="repository"
            label="Repository"
            helperText="Target Repository"
            variant="outlined"
            className={classes.textfield}
            value={this.state.privData.repository}
            onChange={(e)=>{
              this.updatePubData({repository: e.target.value });
            }}
          />

          {/*
          <TextField
            id="branch"
            label="Branch"
            onChange={(e)=>{
              this.updatePubData({branch: e.target.value });
            }}
            value={this.state.privData.branch}
            helperText="Target Branch"
            variant="outlined"
            className={classes.textfield}
          />
          */}
        </Box>



        <Box my={1} >


          {(this.state.keyPairBusy ?
            <FormControl className={classes.margin}>
              <InputLabel shrink htmlFor="progress" className={classes.progressLabel}>
                Deploy Public Key
              </InputLabel>
              <Paper variant="outlined" id="progress" elevation={1} className={classes.paper}>
                <LinearProgress   />
              </Paper>
            </FormControl>
            :

            <React.Fragment>
              <FormControl className={clsx(classes.margin, classes.keyField)} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Deploy Public Key</InputLabel>

                <OutlinedInput
                  id="outlined-adornment-password"
                  type={this.state.showPassword ? 'text' : 'password'}
                  value={this.state.privData.deployPublicKey}
                  onChange={(e)=>{
                    //this.updatePubData({deployPublicKey: e.target.value });
                  }}

                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle deploy key visibility"
                        onClick={()=>{
                          this.setState({ showPassword: !this.state.showPassword });

                        }}
                        onMouseDown={(event)=>{
                          event.preventDefault();
                        }}
                        edge="end"
                      >
                        {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                  labelWidth={140}
                />
              </FormControl>
            </React.Fragment>
          )}
          <Button className={classes.keyButton} disabled={this.state.keyPairBusy} onClick={()=>{

            const {clipboard} = window.require('electron')
            clipboard.writeText(this.state.privData.deployPublicKey)

          }} variant="contained">Copy</Button>
          <Button className={classes.keyButton} onClick={()=>{this.getKeyPair()}} disabled={this.state.keyPairBusy} color="secondary" variant="contained">Re-generate</Button>

        </Box>

      </React.Fragment>
    )

  }


  renderPublicField(){
    const {classes} = this.props;
    return(
      <React.Fragment>
        <Box my={2}>
          Enter a public git URL with a quiqr website or template to import.
        </Box>
        <Box my={2} sx={{display:'flex'}}>
          <TextField
            fullWidth
            id="standard-full-width"
            autoFocus
            label="Git URL"
            value={this.state.importTypeGitUrl}
            variant="outlined"
            onChange={(e)=>{
              this.setState({importTypeGitUrl: e.target.value});

              if(e.target.value && e.target.value !== ''){
                if(this.state.importTypeGitLastValidatedUrl !== e.target.value){

                  this.preValidateURL(e.target.value);

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



        <Box my={2}>
          <Card className={classes.root} variant="outlined">
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
                        <TableCell align="left">{(this.state.importTypeGitBusy ? <CircularProgress size={20} /> : null)} {this.state.importTypeGitLastValidatedUrl}</TableCell>
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



      </React.Fragment>

    )
  }


  render(){

    const {classes} = this.props;

    return (
      <React.Fragment>

        <Box my={2}>

          <FormControlLabel className={classes.keyButton}
            control={
              <Switch
                checked={this.state.useDeployKey||false}
                onChange={(e)=>{
                  if(e.target.checked){
                    this.getKeyPair();
                    this.props.onSetVersion("set");
                  }
                  else{
                    this.props.onSetVersion();
                  }
                  this.setState({useDeployKey: e.target.checked });
                }}

                name="useDeployKey"
                color="primary"
              />
            }
            label="Private GitHub Repository"
          />
          {(this.state.useDeployKey ? this.renderDeployKeyForm(): this.renderPublicField())}

        </Box>



      </React.Fragment>
    )

  }

}

export default withStyles(useStyles)(FormPartialNewFromScratch);


