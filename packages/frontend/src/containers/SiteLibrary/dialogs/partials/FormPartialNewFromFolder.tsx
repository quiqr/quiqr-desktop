import { useState } from 'react';
import service from '../../../../services/service';
import ScreenShotPlaceholder from '../../../../img-assets/screenshot-placeholder.png';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import FolderPicker from '../../../../components/FolderPicker';
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

function FormPartialNewFromFolder({ onSetVersion, onSetName, onValidationDone }: FormPartialNewFromFolderProps) {
  const [busy, setBusy] = useState(false);
  const [folderInfoDict, setFolderInfoDict] = useState<HugoSiteDirResponse>({});
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [siteTitle, setSiteTitle] = useState<string | undefined>();
  const [folderPath, setFolderPath] = useState<string | null | undefined>();

  const validateDir = async (path: string | null) => {
    onSetVersion();
    if (!path) return;

    // Reset state
    setBusy(true);
    setFolderInfoDict({});
    setScreenshot(null);
    setSiteTitle(undefined);

    try {
      const response = await service.api.hugosite_dir_show(path);

      if (!isHugoSiteDirResponse(response)) {
        service.api.logToConsole('Invalid response from hugosite_dir_show');
        setBusy(false);
        return;
      }

      setScreenshot(response.Screenshot ?? null);
      setBusy(false);
      setSiteTitle(response.hugoConfigExists && response.hugoConfigParsed ? response.hugoConfigParsed.title : '');
      setFolderInfoDict(response);

      if (response.quiqrModelParsed) {
        onSetVersion(response.quiqrModelParsed.hugover);
      }

      if (response.dirName) {
        onSetName(response.dirName);
      }

      onValidationDone({
        newReadyForNaming: true,
        newTypeFolderLastValidatedPath: path,
        newFolderInfoDict: response,
      });
    } catch (e) {
      service.api.logToConsole(e);
      setBusy(false);
    }
  };

  const handleFolderSelected = (folder: string | null) => {
    setFolderPath(folder);
    validateDir(folder);
  };

  return (
    <>
      <Box my={3}>
        <p>Select a folder on your computer with a Hugo site.</p>
      </Box>
      <Box my={3} sx={{ display: 'flex' }}>
        <FolderPicker
          label="Folder with Hugo Site"
          selectedFolder={folderPath}
          onFolderSelected={handleFolderSelected}
        />
      </Box>

      <Box my={3}>
        <Card sx={{ margin: 0, display: 'flex' }} variant="outlined">
          <CardMedia
            sx={{ width: 351 }}
            image={screenshot ?? ScreenShotPlaceholder}
            title="site screenshot"
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: '1 0 auto' }}>
              <TableContainer>
                <Table size="small" aria-label="a dense table">
                  <TableBody>
                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Site Title
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        {busy && <CircularProgress size={20} />} {siteTitle}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Hugo Directories
                        </Typography>
                      </TableCell>
                      <TableCell align="left">{folderInfoDict.hugoThemesDirExists ? 'Present' : ''}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Content
                        </Typography>
                      </TableCell>
                      <TableCell align="left">{folderInfoDict.hugoContentDirExists ? 'Present' : ''}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Data
                        </Typography>
                      </TableCell>
                      <TableCell align="left">{folderInfoDict.hugoDataDirExists ? 'Present' : ''}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align="right">
                        <Typography variant="subtitle2" display="inline" className="specValue" color="textSecondary">
                          Quiqr Model
                        </Typography>
                      </TableCell>
                      <TableCell align="left">{folderInfoDict.quiqrModelParsed ? 'Present' : ''}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Box>
        </Card>
      </Box>
    </>
  );
}

export default FormPartialNewFromFolder;
