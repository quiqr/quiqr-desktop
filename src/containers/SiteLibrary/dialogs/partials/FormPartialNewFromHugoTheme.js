import * as React            from 'react';
import service               from '../../../../services/service';
import ScreenShotPlaceholder from '../../../../img-assets/screenshot-placeholder.png';
import { withStyles }        from '@material-ui/core/styles';
import TextField             from '@material-ui/core/TextField';
import Button                from '@material-ui/core/Button';
import Typography            from '@material-ui/core/Typography';
import Box                   from '@material-ui/core/Box';
import CircularProgress      from '@material-ui/core/CircularProgress';
import Table                 from '@material-ui/core/Table';
import TableRow              from '@material-ui/core/TableRow';
import TableCell             from '@material-ui/core/TableCell';
import TableBody             from '@material-ui/core/TableBody';
import TableContainer        from '@material-ui/core/TableContainer';
import Card                  from '@material-ui/core/Card';
import CardContent           from '@material-ui/core/CardContent';
import CardMedia             from '@material-ui/core/CardMedia';

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

});

const regexpHttp      = new RegExp('^http(s?)://', 'i')

class FormPartialNewFromHugoTheme extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      newNameErrorText: '',

      newType: '',
      newTypeHugoThemeUrl: '',
      newTypeHugoThemeBusy: false,
      newTypeHugoThemeReadyForValidation: false,
      newTypeHugoThemeLastValidatedUrl: '',
      newTypeHugoThemeReadyForNew: false,
      newTypeHugoThemeProvider: '',
      newTypeHugoThemeErrorText: '',
      newTypeHugoThemeScreenshot: null,


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

    })

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
      this.props.onSetName(siteNameFromUrl)
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
          })

          this.props.onValidationDone({
            newReadyForNaming:true,
            newTypeHugoThemeLastValidatedUrl: url,
            newHugoThemeInfoDict: response,
          })

        }
      })
      .catch((e)=>{
        service.api.logToConsole(e);
        this.setState({
          newTypeHugoThemeErrorText: "It seems that the URL does not point to a valid git repository",
          newTypeHugoThemeBusy: false
        });
      });
  }

  render(){

    const {classes} = this.props;

    return (
      <React.Fragment>
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
          <Card className={classes.root} variant="outlined">
            <CardMedia
              className={classes.cover}
              image={(this.state.newTypeHugoThemeScreenshot?this.state.newTypeHugoThemeScreenshot:ScreenShotPlaceholder)}
              title="site screenshot"
            />
            <div className={classes.details}>
              <CardContent className={classes.content}>

                <TableContainer>
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

      </React.Fragment>
    )

  }

}

export default withStyles(useStyles)(FormPartialNewFromHugoTheme);

