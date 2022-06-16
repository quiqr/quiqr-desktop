import * as React            from 'react';
//import service               from '../../../../services/service';
import { withStyles }        from '@material-ui/core/styles';
import InputLabel            from '@material-ui/core/InputLabel';
import FormControl           from '@material-ui/core/FormControl';
import Select                from '@material-ui/core/Select';
import MenuItem              from '@material-ui/core/MenuItem';

const useStyles = theme => ({

});

class FormPartialNewFromScratch extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      configFormat: 'toml',
    }
  }

  componentDidMount(){
    this.props.onChange({
      newTypeScratchConfigFormat: 'toml',
    })
  }

  render(){

    const {classes} = this.props;

    return (
      <React.Fragment>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="demo-simple-select-outlined-label">Config Format</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={this.state.configFormat}
              style={{width:"150px"}}
              onChange={(e)=>{

                this.props.onChange({
                  newTypeScratchConfigFormat: e.target.value,
                })

                this.setState({
                  configFormat: e.target.value,
                })
              }}
              label="Config Format"
            >
              <MenuItem value={"toml"}>{"toml"}</MenuItem>
              <MenuItem value={"json"}>{"json"}</MenuItem>
              <MenuItem value={"yaml"}>{"yaml"}</MenuItem>
            </Select>
          </FormControl>

      </React.Fragment>
    )

  }

}

export default withStyles(useStyles)(FormPartialNewFromScratch);


