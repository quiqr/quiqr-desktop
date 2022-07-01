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

      importHugoTheme: '',

      importQuiqrModel: '',
      importQuiqrForms: '',

    }
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


  render(){

    const {classes} = this.props;

    return (
      <React.Fragment>
        <Box my={3}>
          Enter a public git URL with a quiqr website or template to import.
        </Box>
        <Box my={3} sx={{display:'flex'}}>
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

}

export default withStyles(useStyles)(FormPartialNewFromScratch);


