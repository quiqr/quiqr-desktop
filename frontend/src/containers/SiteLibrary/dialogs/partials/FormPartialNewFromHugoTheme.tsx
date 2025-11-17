import * as React            from 'react';
import service               from '../../../../services/service';
import ScreenShotPlaceholder from '../../../../img-assets/screenshot-placeholder.png';
import TextField             from '@mui/material/TextField';
import Button                from '@mui/material/Button';
import Typography            from '@mui/material/Typography';
import Box                   from '@mui/material/Box';
import CircularProgress      from '@mui/material/CircularProgress';
import Table                 from '@mui/material/Table';
import TableRow              from '@mui/material/TableRow';
import TableCell             from '@mui/material/TableCell';
import TableBody             from '@mui/material/TableBody';
import TableContainer        from '@mui/material/TableContainer';
import Card                  from '@mui/material/Card';
import CardContent           from '@mui/material/CardContent';
import CardMedia             from '@mui/material/CardMedia';

const regexpHttp      = new RegExp('^http(s?)://', 'i')

interface FormPartialNewFromHugoThemeProps {
  onSetName: (name: string) => void;
  onValidationDone: (newState: {
    newReadyForNaming: boolean;
    newTypeHugoThemeLastValidatedUrl: string;
    newHugoThemeInfoDict: any;
  }) => void;
}

interface FormPartialNewFromHugoThemeState {
  newNameErrorText: string;
  newType: string;
  newTypeHugoThemeUrl: string;
  newTypeHugoThemeBusy: boolean;
  newTypeHugoThemeReadyForValidation: boolean;
  newTypeHugoThemeLastValidatedUrl: string;
  newTypeHugoThemeReadyForNew: boolean;
  newTypeHugoThemeProvider: string;
  newTypeHugoThemeErrorText: string;
  newTypeHugoThemeScreenshot: string | null;
  newHugoThemeInfoDict?: any;
  newHugoThemeMinVersion?: string | null;
  newHugoThemeName?: string | null;
  newHugoThemeLicense?: string | null;
  newHugoThemeLicenseLink?: string | null;
  newHugoThemeHomepage?: string | null;
  newHugoThemeDemopage?: string | null;
  newHugoThemeDescription?: string | null;
  newHugoThemeExampleSite?: boolean | null;
  newHugoThemeAuthor?: string | null;
  newHugoThemeAuthorHomepage?: string | null;
}

class FormPartialNewFromHugoTheme extends React.Component<FormPartialNewFromHugoThemeProps, FormPartialNewFromHugoThemeState>{

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
          <Button variant="contained" disabled={(this.state.newTypeHugoThemeBusy || !this.state.newTypeHugoThemeReadyForValidation ? true : false)} sx={{ ml: 1, width: 400, height: 55 }} color="primary" onClick={()=>{
            this.validateURL(this.state.newTypeHugoThemeUrl);
          }}>Validate Remote Repository</Button>

        </Box>

        <Box my={3}>
          <Card sx={{ margin: 0, display: 'flex' }} variant="outlined">
            <CardMedia
              sx={{ width: 351 }}
              image={(this.state.newTypeHugoThemeScreenshot?this.state.newTypeHugoThemeScreenshot:ScreenShotPlaceholder)}
              title="site screenshot"
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: '1 0 auto' }}>

                <TableContainer>
                  <Table size="small" aria-label="a dense table">
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
            </Box>

          </Card>
        </Box>

      </React.Fragment>
    )

  }

}

export default FormPartialNewFromHugoTheme;

