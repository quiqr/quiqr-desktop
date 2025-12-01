import * as React            from 'react';
import InputLabel            from '@mui/material/InputLabel';
import FormControl           from '@mui/material/FormControl';
import Select                from '@mui/material/Select';
import MenuItem              from '@mui/material/MenuItem';

interface FormPartialNewFromScratchProps {
  onChange: (newState: { newTypeScratchConfigFormat: string }) => void;
}

interface FormPartialNewFromScratchState {
  configFormat: string;
}

class FormPartialNewFromScratch extends React.Component<FormPartialNewFromScratchProps, FormPartialNewFromScratchState>{

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
    return (
      <React.Fragment>
          <FormControl variant="outlined" sx={{ minWidth: 300 }}>
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

export default FormPartialNewFromScratch;
