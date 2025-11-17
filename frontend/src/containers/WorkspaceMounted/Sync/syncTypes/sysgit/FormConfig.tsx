import * as React          from 'react';
import service             from '../../../../../services/service';
import TextField           from '@mui/material/TextField';
import Button              from '@mui/material/Button';
import Box                 from '@mui/material/Box';
import clsx                from 'clsx';
import OutlinedInput       from '@mui/material/OutlinedInput';
import InputLabel          from '@mui/material/InputLabel';
import InputAdornment      from '@mui/material/InputAdornment';
import Switch              from '@mui/material/Switch';
import FormControlLabel    from '@mui/material/FormControlLabel';
import FormControl         from '@mui/material/FormControl';
import Visibility          from '@mui/icons-material/Visibility';
import VisibilityOff       from '@mui/icons-material/VisibilityOff';
import IconButton          from '@mui/material/IconButton';
import MenuItem            from '@mui/material/MenuItem';
import LinearProgress      from '@mui/material/LinearProgress';
import Select              from '@mui/material/Select';
import Paper               from '@mui/material/Paper';

class FormConfig extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      showPassword: false,
      setGitHubActionsSwitchEnable: false,
      syncSelectionSwitchEnable: true,
      pubData:{
        type: 'sysgit',
        title: '',
        git_server_url:'',
        email:'',
        branch:'main',
        deployPrivateKey:'',
        deployPublicKey:'xxxx',
        publishScope:'build',
        setGitHubActions: false,
        keyPairBusy: true,
        overrideBaseURLSwitch: false,
        overrideBaseURL: '',
        pullOnly: false,
        backupAtPull: false,
        syncSelection: "", // "" = all, "contentOnly", "themes and quiqr only"
        CNAMESwitch: false,
        CNAME: '',
      }
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

  componentDidMount(){
    if(this.props.publishConf){
      this.setState({pubData: this.props.publishConf.config});
      if(this.props.publishConf.config.publishScope !== "build"){
        this.setState({
          setGitHubActionsSwitchEnable:true
        });
      }

    }
    else{
      this.getKeyPair();
    }
  }

  updatePubData(newData, callback=null){
    let pubData = {...this.state.pubData, ...newData};
    this.setState({pubData: pubData}, ()=>{
      this.props.setData(pubData);

      if(pubData.git_server_url !== '' && pubData.branch !== '' && pubData.email !== ''){
        this.props.setSaveEnabled(true);
      }
      else{
        this.props.setSaveEnabled(false);
      }
      typeof callback === 'function' && callback();
    });

  }

  renderGitHubActionsForm(){
    if(this.state.pubData.pullOnly===true){
      return null
    }
    else{

      return (
        <React.Fragment>

          <Box my={1}>
            <FormControl variant="outlined" sx={{ m: 1, minWidth: 300 }}>
              <InputLabel id="demo-simple-select-outlined-label">Publish Source or Build</InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={this.state.pubData.publishScope}
                onChange={(e)=>{
                  if(e.target.value === "build"){
                    this.updatePubData({
                      publishScope: e.target.value,
                      setGitHubActions: false,
                      syncSelection: ""
                    });
                    this.setState({
                      setGitHubActionsSwitchEnable: false,
                      syncSelectionSwitchEnable: false,
                    });
                  }
                  else{
                    this.updatePubData({
                      publishScope: e.target.value,
                    });
                    this.setState({
                      setGitHubActionsSwitchEnable:true,
                      syncSelectionSwitchEnable: true
                    });
                  }
                }}
                label="Publish Source and Build"
              >
                <MenuItem value="build">Publish only build files</MenuItem>
                <MenuItem value="source">Publish only source files</MenuItem>
              </Select>
            </FormControl>


          </Box>

          <Box my={1}>


            <FormControlLabel sx={{ m: 1, mt: 2 }}
              control={
                <Switch
                  checked={this.state.pubData.overrideBaseURLSwitch}
                  onChange={(e)=>{
                    if(this.state.pubData.overrideBaseURLSwitch){
                      this.updatePubData({
                        overrideBaseURLSwitch: e.target.checked,
                        overrideBaseURL: "",
                      });
                    }
                    else{
                      this.updatePubData({
                        overrideBaseURLSwitch: e.target.checked,
                      });
                    }
                  }}

                  name="overrideBaseURLSwitch"
                  color="primary"
                />
              }
              label="Override BaseURL"
            />

            <TextField
              id="baseUrl"
              label="BaseURL"
              disabled={!this.state.pubData.overrideBaseURLSwitch}
              onChange={(e)=>{
                this.updatePubData({overrideBaseURL: e.target.value });
              }}
              value={this.state.pubData.overrideBaseURL}
              helperText="Override Hugo Configuration with new baseURL"
              variant="outlined"
              sx={{ m: 1, width: '20ch' }}
            />

          </Box>

        </React.Fragment>
      )
    }

  }

  render(){
    return (
      <React.Fragment>
        <Box my={1} sx={{display:'flex'}}>
          <TextField
            id="target name"
            label="Sync name"
            helperText="This helps identifying the correct Synchronization target"
            variant="outlined"
            sx={{ m: 1 }}
            value={this.state.pubData.title}
            onChange={(e)=>{
              this.updatePubData({title: e.target.value });
            }}
          />
        </Box>
        <Box my={1} sx={{display:'flex'}}>

          <TextField
            id="git_server_url"
            label="git server url (only SSH supported)"
            helperText="e.g: git@github.com:quiqr/quiqr-template-kitchen-sink.git"
            variant="outlined"
            sx={{ m: 1 }}
            value={this.state.pubData.git_server_url}
            onChange={(e)=>{
              this.updatePubData({git_server_url: e.target.value });
            }}
          />

          <TextField
            id="email"
            label="E-mail"
            helperText="E-mail address to use for commit messages"
            variant="outlined"
            sx={{ m: 1 }}
            value={this.state.pubData.email}
            onChange={(e)=>{
              this.updatePubData({email: e.target.value });
            }}
          />

        </Box>
        <Box my={1}>

          <TextField
            id="branch"
            label="Branch"
            onChange={(e)=>{
              this.updatePubData({branch: e.target.value });
            }}
            value={this.state.pubData.branch}
            helperText="Target Branch"
            variant="outlined"
            sx={{ m: 1 }}
          />
        </Box>
        <Box my={1}>

          {(this.state.keyPairBusy ?
            <FormControl sx={{ m: 1 }}>
              <InputLabel shrink htmlFor="progress" sx={{ ml: 3, backgroundColor: 'white' }}>
                Deploy Public Key
              </InputLabel>
              <Paper variant="outlined" id="progress" elevation={1} sx={{ m: 1, width: '60ch', p: 3 }}>
                <LinearProgress   />
              </Paper>
            </FormControl>
            :

            <React.Fragment>
              <FormControl sx={{ m: 1, width: '60ch' }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Deploy Public Key</InputLabel>

                <OutlinedInput
                  id="outlined-adornment-password"
                  type={this.state.showPassword ? 'text' : 'password'}
                  value={this.state.pubData.deployPublicKey}
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
                        size="large">
                        {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                  labelWidth={140}
                />
              </FormControl>
            </React.Fragment>
          )}
          <Button sx={{ m: 1, mt: 2 }} disabled={this.state.keyPairBusy} onClick={()=>{

            const {clipboard} = window.require('electron')
            clipboard.writeText(this.state.pubData.deployPublicKey)

          }} variant="contained">Copy</Button>
          <Button sx={{ m: 1, mt: 2 }} onClick={()=>{this.getKeyPair()}} disabled={this.state.keyPairBusy} color="secondary" variant="contained">Re-generate</Button>

        </Box>
        <Box my={1}>
          <FormControlLabel sx={{ m: 1, mt: 2 }}
            control={
              <Switch
                checked={this.state.pubData.pullOnly}
                onChange={(e)=>{
                  this.updatePubData({
                    pullOnly: e.target.checked,
                    publishScope: 'source'
                  });
                  this.setState({
                    syncSelectionSwitchEnable: true,
                  });

                }}

                name="pullOnly"
                color="primary"
              />
            }
            label="Pull Only"
          />

          <FormControl variant="outlined" sx={{ m: 1, minWidth: 300 }}>
            <InputLabel id="demo-simple-select-outlined-label">Selective Synchronization</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              disabled={!this.state.syncSelectionSwitchEnable}
              id="select-sync-selection"
              value={this.state.pubData.syncSelection}
              onChange={(e)=>{
                this.updatePubData({
                  syncSelection: e.target.value,
                });
              }}
              label="Sync Selection"
            >
              <MenuItem value="all">Sync All</MenuItem>
              <MenuItem value="themeandquiqr">Sync only Design and Model</MenuItem>
            </Select>
          </FormControl>

        </Box>
        {this.renderGitHubActionsForm()}
      </React.Fragment>
    );
  }
}

export default FormConfig;

