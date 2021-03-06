import * as React          from 'react';
//import service             from '../../../../../services/service';
import TextField           from '@material-ui/core/TextField';
import { withStyles }      from '@material-ui/core/styles';
import Button              from '@material-ui/core/Button';
import Box                 from '@material-ui/core/Box';
import InputLabel          from '@material-ui/core/InputLabel';
import FormControl         from '@material-ui/core/FormControl';
import MenuItem            from '@material-ui/core/MenuItem';
import Select              from '@material-ui/core/Select';

const useStyles = theme => ({

  keyButton: {
    margin: theme.spacing(1),
    marginTop: theme.spacing(2),
  },

  textfield: {
    margin: theme.spacing(1),
    backgroundColor: 'white',
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

class QuiqrCloudForm extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      showPassword: false,
      pubData:{
        type: 'quiqr',
      }
    }
  }

  componentDidMount(){
    if(this.props.publishConf){
      this.setState({pubData: this.props.publishConf.config});
    }
  }

  updatePubData(newData){
    let pubData = {...this.state.pubData, ...newData};
    this.setState({pubData: pubData}, this.props.setData(pubData));
    if(pubData.username !== '' && pubData.repository !=='' && pubData.branch !== ''){
      this.props.setSaveEnabled(true);
    }
    else{
      this.props.setSaveEnabled(false);
    }
  }

  render(){
    let { classes } = this.props;

    return (
      <React.Fragment>
        <Box my={2}>

          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="demo-simple-select-outlined-label">Quiqr Cloud Account</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={this.state.pubData.publishScope}
              onChange={(e)=>{
                this.updatePubData({publishScope: e.target.value });
              }}
              label="Quiqr Cloud Account"
            >
              <MenuItem value="create">Create new</MenuItem>
            </Select>
          </FormControl>

        </Box>
        <Box my={2}>
          <TextField
            id="path"
            label="Quiqr Cloud Site Name"
            helperText=""
            variant="outlined"
            className={classes.textfield}
            value={this.state.pubData.path}
            onChange={(e)=>{
              this.updatePubData({repository: e.target.value });
            }}
        />
          <Button className={classes.keyButton} variant="contained">Delete Site from cloud</Button>
        </Box>

        <Box my={2} p={2} sx={{
        }}>
          <Button style={{float:"right"}} className={classes.keyButton} variant="contained">Unsubscribe</Button>
          <Box p={2} style={{
            borderRadius: '10px',
            maxWidth: "70ch",
            height: "170px",
            width: "70ch",
            backgroundColor: '#ebf7eb',
            display: "block-inline"
          }}>

            <h3 style={{color: "#66bb6"}}>Quiqr Cloud Level 2</h3>
            <TextField
              id="path"
              label="Custom Domain Name"
              helperText=""
              variant="outlined"
              className={classes.textfield}
              value={this.state.pubData.defaultDomain}
              onChange={(e)=>{
                this.updatePubData({repository: e.target.value });
              }}
            />
            <Button className={classes.keyButton} variant="contained">Disconnect Custom Domain Name</Button>
          </Box>

        </Box>

      </React.Fragment>
    )
  }
}

export default withStyles(useStyles)(QuiqrCloudForm);

