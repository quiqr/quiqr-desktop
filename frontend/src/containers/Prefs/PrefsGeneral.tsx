import React                 from 'react';
import Typography            from '@mui/material/Typography';
import Select                from '@mui/material/Select';
import Box                   from '@mui/material/Box';
import InputLabel            from '@mui/material/InputLabel';
import MenuItem              from '@mui/material/MenuItem';
import FormControl           from '@mui/material/FormControl';
import service               from './../../services/service';
import FolderPicker          from '../../components/FolderPicker';
import { UserPreferences } from '../../../types';

interface PrefsGeneralProps {}
interface PrefsGeneralState {
  prefs: UserPreferences;
  prefsDataFolder: string;
  prefsInterfaceStyle: string;
}

class PrefsGeneral extends React.Component<PrefsGeneralProps, PrefsGeneralState> {

  history: any;

  constructor(props){
    super(props);

    this.state = {
      prefs: {},
      prefsDataFolder: '',
      prefsInterfaceStyle: ''
    };
  }

  componentDidMount(){

    //service.registerListener(this);
    service.api.readConfKey('prefs').then((value: UserPreferences)=>{
      this.setState({prefs: value });

      if(value.interfaceStyle){
        this.setState({prefsInterfaceStyle: value.interfaceStyle });
      }
      else{
        this.setState({prefsInterfaceStyle: "quiqr10" });
      }

      if(value.dataFolder){
        this.setState({prefsDataFolder: value.dataFolder });
      }
      else{
        this.setState({prefsDataFolder: "~/Quiqr" });
      }

    });
  }

  componentWillUnmount(){
   // service.unregisterListener(this);
  }

  handleFolderSelected(folder: string | null){
    if (folder) {
      service.api.saveConfPrefKey("dataFolder", folder);
      this.setState({prefsDataFolder: folder });
    }
  }

  render(){
    return (
      <Box sx={{ padding: '20px', height: '100%' }}>
        <Typography variant="h4">General Preferences</Typography>

        <Box my={2} mx={1}>
          <FolderPicker
            label="Quiqr Data Folder"
            selectedFolder={this.state.prefsDataFolder}
            onFolderSelected={(e)=>{this.handleFolderSelected(e)}} />
        </Box>

        <Box my={2}>
          <FormControl variant="outlined" sx={{ m: 1, minWidth: 300 }}>
            <InputLabel>Interface Style</InputLabel>
            <Select
              value={this.state.prefsInterfaceStyle}
              onChange={(e)=>{
                service.api.reloadThemeStyle();
                service.api.saveConfPrefKey("interfaceStyle", e.target.value);
                this.setState({prefsInterfaceStyle: e.target.value as string });

              }}
              label="Interface Style"
            >
              <MenuItem key={"quiqr10"} value={"quiqr10"}>Light</MenuItem>
              <MenuItem key={"quiqr10-dark"} value={"quiqr10-dark"}>Dark</MenuItem>
            </Select>
          </FormControl>
        </Box>


        {/*
          <div style={{marginTop:"20px"}}>

          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.showSplashAtStartup}
                onChange={(e)=>{
                  //TODO Save settings
                  if(e.target.checked){
                    service.api.showMenuBar();
                  }
                  else{
                    service.api.hideMenuBar();
                  }
                }}
                inputProps={{ 'aria-label': 'primary checkbox' }}
              />
            }
            label="Show Menu Bar"
            labelPlacement="end"
          />
          </div>
          */}


      </Box>
    );
  }

}

export default PrefsGeneral;
