import * as React            from 'react';
import service               from '../../../../services/service';
import ScreenShotPlaceholder from '../../../../img-assets/screenshot-placeholder.png';
import { withStyles }        from '@material-ui/core/styles';
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
import FolderPicker          from '../../../../components/FolderPicker';

const useStyles = theme => ({

  root: {
    margin: 0,
    display: 'flex',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },

  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: 351,
  },

});


class FormPartialNewFromFolder extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      newType: '',
      newTypeFolderBusy: false,
      newFolderInfoDict: {},
      newTypeFolderScreenshot: null,
    }
  }

  resetNewTypeFolderState(){
    this.setState({
      newTypeFolderBusy: false,
      newTypeFolderInfoDict: {},
      newTypeFolderScreenshot: null,
    })
  }

  validateDir(path){

    this.props.onSetVersion();
    if(!path) return;

    this.resetNewTypeFolderState();
    this.setState({newTypeFolderBusy: true});

    service.api.hugosite_dir_show(path)
      .then((response)=>{
        if(response){

          this.setState({
            newTypeFolderScreenshot: (response.Screenshot ? response.Screenshot:null),
            newTypeFolderBusy: false,
            newTypeFolderTheme: (response.hugoConfigExists ? response.hugoConfigParsed.theme : ""),
            newFolderSiteTitle: (response.hugoConfigExists ? response.hugoConfigParsed.title : ""),
            newFolderInfoDict: response,
          })
          if(response.quiqrModelParsed){
            this.props.onSetVersion(response.quiqrModelParsed.hugover);
          }

          this.props.onSetName(response.dirName);
          this.props.onValidationDone({
            newReadyForNaming:true,
            newTypeFolderLastValidatedPath: path,
            newFolderInfoDict: response,
          })
        }
      })
      .catch((e)=>{
        service.api.logToConsole(e);
        this.setState({
          newTypeFolderErrorText: "It seems that the directory does not point to a directory with a Hugo site",
          newTypeFolderBusy: false
        });
      });
  }

  render(){

    const {classes} = this.props;

    return (
      <React.Fragment>
        <Box my={3}>
          <p>
            Select a folder on your computer with a Hugo site.
          </p>
        </Box>
        <Box my={3} sx={{display:'flex'}}>

          <FolderPicker
            label="Folder with Hugo Site"
            selectedFolder={this.state.newFolderPath}
            onFolderSelected={(folder)=>{
              this.setState({newFolderPath: folder})
              this.validateDir(folder);
            }} />

        </Box>

        <Box my={3}>
          <Card className={classes.root} variant="outlined">
            <CardMedia
              className={classes.cover}
              image={(this.state.newTypeFolderScreenshot?this.state.newTypeFolderScreenshot:ScreenShotPlaceholder)}
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
                            Site Title
                          </Typography>
                        </TableCell>
                        <TableCell align="left">{(this.state.newTypeFolderBusy ? <CircularProgress size={20} /> : null)} {this.state.newFolderSiteTitle}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell align="right">
                          <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                           Hugo Directories
                          </Typography>
                        </TableCell>
                        <TableCell align="left">{(this.state.newFolderInfoDict.hugoThemesDirExists ? "Present" : "")}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell align="right">
                          <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                            Content
                          </Typography>
                        </TableCell>
                        <TableCell align="left">{(this.state.newFolderInfoDict.hugoContentDirExists ? "Present" : "")}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell align="right">
                          <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                            Data
                          </Typography>
                        </TableCell>
                        <TableCell align="left">{(this.state.newFolderInfoDict.hugoDataDirExists ? "Present" : "")}</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell align="right">
                          <Typography variant="subtitle2"  display="inline"  className="specValue" color="textSecondary">
                           Quiqr Model
                          </Typography>
                        </TableCell>
                        <TableCell align="left">{(this.state.newFolderInfoDict.quiqrModelParsed ? "Present" : "")}</TableCell>
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

export default withStyles(useStyles)(FormPartialNewFromFolder);

