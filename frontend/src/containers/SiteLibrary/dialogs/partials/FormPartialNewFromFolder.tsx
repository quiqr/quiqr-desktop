import * as React            from 'react';
import service               from '../../../../services/service';
import ScreenShotPlaceholder from '../../../../img-assets/screenshot-placeholder.png';
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
import FolderPicker          from '../../../../components/FolderPicker';
import { HugoSiteDirResponse, isHugoSiteDirResponse } from '../../../../utils/type-guards';

interface FormPartialNewFromFolderProps {
  onSetVersion: (version?: string) => void;
  onSetName: (name: string) => void;
  onValidationDone: (data: {
    newReadyForNaming: boolean;
    newTypeFolderLastValidatedPath: string;
    newFolderInfoDict: HugoSiteDirResponse;
  }) => void;
}

interface FormPartialNewFromFolderState {
  newType: string;
  newTypeFolderBusy: boolean;
  newFolderInfoDict: HugoSiteDirResponse;
  newTypeFolderScreenshot: string | null;
  newTypeFolderTheme?: string;
  newFolderSiteTitle?: string;
  newFolderPath?: string | null;
  newTypeFolderErrorText?: string;
}

class FormPartialNewFromFolder extends React.Component<FormPartialNewFromFolderProps, FormPartialNewFromFolderState>{

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
      newFolderInfoDict: {},
      newTypeFolderScreenshot: null,
      newTypeFolderTheme: undefined,
      newFolderSiteTitle: undefined,
      newTypeFolderErrorText: undefined,
    })
  }

  validateDir(path: string | null){

    this.props.onSetVersion();
    if(!path) return;

    this.resetNewTypeFolderState();
    this.setState({newTypeFolderBusy: true});

    service.api.hugosite_dir_show(path)
      .then((response)=>{
        if(!isHugoSiteDirResponse(response)){
          service.api.logToConsole("Invalid response from hugosite_dir_show");
          this.setState({
            newTypeFolderErrorText: "Received invalid response from server",
            newTypeFolderBusy: false
          });
          return;
        }

        this.setState({
          newTypeFolderScreenshot: (response.Screenshot ? response.Screenshot : null),
          newTypeFolderBusy: false,
          newTypeFolderTheme: (response.hugoConfigExists && response.hugoConfigParsed ? response.hugoConfigParsed.theme : ""),
          newFolderSiteTitle: (response.hugoConfigExists && response.hugoConfigParsed ? response.hugoConfigParsed.title : ""),
          newFolderInfoDict: response,
        })

        if(response.quiqrModelParsed){
          this.props.onSetVersion(response.quiqrModelParsed.hugover);
        }

        if(response.dirName){
          this.props.onSetName(response.dirName);
        }

        this.props.onValidationDone({
          newReadyForNaming:true,
          newTypeFolderLastValidatedPath: path,
          newFolderInfoDict: response,
        })
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
          <Card sx={{ margin: 0, display: 'flex' }} variant="outlined">
            <CardMedia
              sx={{ width: 351 }}
              image={(this.state.newTypeFolderScreenshot?this.state.newTypeFolderScreenshot:ScreenShotPlaceholder)}
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
            </Box>

          </Card>
        </Box>

      </React.Fragment>
    )

  }

}

export default FormPartialNewFromFolder;
