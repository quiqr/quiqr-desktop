import React          from 'react';
import service        from './../../services/service';
import Typography     from '@material-ui/core/Typography';
import TextField      from '@material-ui/core/TextField';
import Button         from '@material-ui/core/Button';
import IconButton      from '@material-ui/core/IconButton';
import RemoveIcon      from '@material-ui/icons/Remove';


import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({

  container:{
    padding: '20px',
    height: '100%'
  },

  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textfield: {
    margin: theme.spacing(1),
  },


});

class PrefsVars extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      appVariables : []
    };
  }

  componentDidMount(){

    service.api.readConfKey('appVars').then((value)=>{

      this.setState({appVariables: value });
    });
  }

  renderVarRows(){
    const { classes } = this.props;

    let rows = this.state.appVariables.map((_,index)=>{
      if(this.state.appVariables[index] && this.state.appVariables[index].hasOwnProperty('var_name')){
        return (
          <React.Fragment
            key={"varEntry"+index}
          >
            <TextField
              id={"varEntry"+index}
              label="Variable Name"
              helperText='Name for the variable to define E.g. "TERRAFORM_EXECUTABLE"'
              variant="outlined"
              value={this.state.appVariables[index].var_name}
              className={classes.textfield}
              onChange={(e)=>{
                let appVariables= this.state.appVariables;
                appVariables[index].var_name = e.target.value;
                this.setState({appVariables: appVariables})
              }}
            />
            <TextField
              id={"varValue"+index}
              label="Variable Value"
              helperText='Replacement value for the variable to define E.g. "/usr/bin/terraform"'
              value={this.state.appVariables[index].var_value}
              variant="outlined"
              className={classes.textfield}
              onChange={(e)=>{
                let appVariables= this.state.appVariables;
                appVariables[index].var_value = e.target.value;
                this.setState({appVariables: appVariables})
              }}
            />
            <IconButton aria-label="clear"  onClick={()=>{
              let appVariables= this.state.appVariables;
              delete appVariables[index]
              this.setState({appVariables: appVariables})
            }}> <RemoveIcon /> </IconButton>

          </React.Fragment>
        )
      }
      else{
        return null;

      }

    });
    return (
      <div className={classes.root}>
        {rows}
        </div>
    )
  }

  render(){
    let appVars = this.state.appVariables;
    return (
      <div className={ this.props.classes.container }>
        <Typography variant="h4">Variables</Typography>

        {this.renderVarRows()}

        <Button onClick={()=>{
          appVars.push({var_name: "NEW_VARIABLE", var_value: ""})
          this.setState({
            appVariables: appVars
          });
        }}>Add variable</Button>

        <Button onClick={()=>{
          let appVariables = this.state.appVariables
          appVariables = appVariables.filter((item)=>{
            return item !== null;
          })

          service.api.saveConfAppVars(appVariables);

        }}>Save</Button>

      </div>
    );
  }

}

export default withStyles(useStyles)(PrefsVars);
