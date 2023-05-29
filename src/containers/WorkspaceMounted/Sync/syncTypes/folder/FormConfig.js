import * as React          from 'react';
import TextField           from '@material-ui/core/TextField';
import { withStyles }      from '@material-ui/core/styles';
import Box                 from '@material-ui/core/Box';
import InputLabel          from '@material-ui/core/InputLabel';
import Switch              from '@material-ui/core/Switch';
import FormControlLabel    from '@material-ui/core/FormControlLabel';
import FormControl         from '@material-ui/core/FormControl';
import MenuItem            from '@material-ui/core/MenuItem';
import Select              from '@material-ui/core/Select';
import FolderPicker        from '../../../../../components/FolderPicker';

const useStyles = theme => ({

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

  paper:{
    margin: theme.spacing(1),
    width: '60ch',
    padding: theme.spacing(3),
  },

  keyField: {
    margin: theme.spacing(1),
    width: '60ch',
  },


  formControl: {
    margin: theme.spacing(1),
    minWidth: 300,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
});

class FormConfig extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      pubData:{
        type: 'folder',
        path: '',
        publishScope:'build',
        overrideBaseURLSwitch: false,
        overrideBaseURL: '',
      }
    }
  }

  componentDidMount(){
    if(this.props.publishConf){
      this.setState({pubData: this.props.publishConf.config});
    }
  }

  updatePubData(newData, callback=null){
    let pubData = {...this.state.pubData, ...newData};
    this.setState({pubData: pubData}, ()=>{
      this.props.setData(pubData);

      if(pubData.path !== ''){
        this.props.setSaveEnabled(true);
      }
      else{
        this.props.setSaveEnabled(false);
      }
      typeof callback === 'function' && callback();
    });
  }

  render(){
    let { classes } = this.props;

    return (
      <React.Fragment>

        <div style={{marginTop:"20px"}}>
          <FolderPicker
            label="Export folder"
            selectedFolder={this.state.pubData.path}
            onFolderSelected={(folder)=>{
              this.updatePubData({path: folder });
            }} />
        </div>


        <Box my={2}>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="demo-simple-select-outlined-label">Publish Source and Build</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={this.state.pubData.publishScope}
              onChange={(e)=>{
                if(e.target.value === "build"){
                  this.updatePubData({
                    publishScope: e.target.value,
                  });
                }
                else{
                  this.updatePubData({
                    publishScope: e.target.value,
                  });
                }
              }}
              label="Publish Source and Build"
            >
              <MenuItem value="build">Publish only build files</MenuItem>
              <MenuItem value="source">Publish only source files</MenuItem>
              <MenuItem value="build_and_source">Publish source and build files</MenuItem>
            </Select>
          </FormControl>

        </Box>

        <Box my={2}>

          <FormControlLabel className={classes.keyButton}
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
            className={classes.textfield}
          />

        </Box>

      </React.Fragment>
    )
  }
}

export default withStyles(useStyles)(FormConfig);
