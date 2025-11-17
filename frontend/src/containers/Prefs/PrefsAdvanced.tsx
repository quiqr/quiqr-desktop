import React          from 'react';
import service        from './../../services/service';
import Typography     from '@mui/material/Typography';
import TextField      from '@mui/material/TextField';
import Box            from '@mui/material/Box';

interface PrefsAdvancedProps {}

interface PrefsAdvancedState {
  // Global prefs object read from config file via readConfKey('prefs')
  prefs: {
    dataFolder?: string;
    interfaceStyle?: string;
    sitesListingView?: string;
    libraryView?: string;
    openAiApiKey?: string;
    systemGitBinPath?: string;
    customOpenInCommand?: string;
    [key: string]: any; // Allow other preference keys
  };
  // Individual input field state (mirrors values from prefs for controlled inputs)
  systemGitBinPath?: string;
  openAiApiKey?: string;
  customOpenInCommand?: string;
}

class PrefsAdvanced extends React.Component<PrefsAdvancedProps, PrefsAdvancedState> {

  history: any;

  constructor(props){
    super(props);
    this.state = {
      prefs: {},
      systemGitBinPath: "",
      openAiApiKey: "",
      customOpenInCommand: "",
    };
  }

  setStringPrefToState(prefKey, value){
    if(value[prefKey]){
      this.setState({[prefKey]: value[prefKey] });
    }
    else{
      this.setState({[prefKey]: "" });
    }
  }

  componentDidMount(){

    //service.registerListener(this);
    service.api.readConfKey('prefs').then((value)=>{
      this.setState({prefs: value });

      this.setStringPrefToState('systemGitBinPath',value)
      this.setStringPrefToState('openAiApiKey',value)
      this.setStringPrefToState('customOpenInCommand',value)

      /*
      if(value.customOpenInCommand){
        this.setState({customOpenInCommand: value.customOpenInCommand });
      }
      else{
        this.setState({customOpenInCommand: "" });
      }
      */

    });
  }

  componentWillUnmount(){
    //service.unregisterListener(this);
  }

  render(){
    return (
      <Box sx={{ padding: '20px', height: '100%' }}>
        <Typography variant="h4">Advanced Preferences</Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <TextField
            id="openInCommand"
            label="Custom open-in-command"
            helperText='Command to open directory in. E.g. alacritty --title "%site_name" --working-directory "%site_path"'
            variant="outlined"
            sx={{ m: 1 }}
            value={this.state.customOpenInCommand}
            onChange={(e)=>{
              this.setState({customOpenInCommand: e.target.value });
              service.api.saveConfPrefKey("customOpenInCommand",e.target.value);
            }}
          />

        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <TextField
            id="openAiApiKey"
            label="openAiApikey"
            helperText='Enter API key to enable AI services. Translate texts, create meta summaries, etc..'
            variant="outlined"
            sx={{ m: 1 }}
            value={this.state.openAiApiKey}
            onChange={(e)=>{
              this.setState({openAiApiKey: e.target.value });
              service.api.saveConfPrefKey("openAiApiKey",e.target.value);
            }}
          />

        </Box>


        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <TextField
            id="gitBinary"
            label="Path to git binary"
            helperText='providing a path to a installed version of git enables the real git sync target'
            variant="outlined"
            sx={{ m: 1 }}
            value={this.state.systemGitBinPath}
            onChange={(e)=>{
              this.setState({systemGitBinPath: e.target.value });
              service.api.saveConfPrefKey("systemGitBinPath",e.target.value);
            }}
          />

        </Box>

      </Box>
    );
  }

}

export default PrefsAdvanced;
