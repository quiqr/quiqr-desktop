import * as React from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FolderPicker from "../../../../../components/FolderPicker";

interface PubData {
  type: string;
  path: string | null;
  publishScope: string;
  overrideBaseURLSwitch: boolean;
  overrideBaseURL: string;
}

interface FormConfigProps {
  publishConf?: {
    config: PubData;
  };
  setData: (data: PubData) => void;
  setSaveEnabled: (enabled: boolean) => void;
}

interface FormConfigState {
  pubData: PubData;
}

class FormConfig extends React.Component<FormConfigProps, FormConfigState> {
  constructor(props: FormConfigProps) {
    super(props);

    this.state = {
      pubData: {
        type: "folder",
        path: null,
        publishScope: "build",
        overrideBaseURLSwitch: false,
        overrideBaseURL: "",
      },
    };
  }

  componentDidMount() {
    if (this.props.publishConf) {
      this.setState({ pubData: this.props.publishConf.config });
    }
  }

  updatePubData(newData: Partial<PubData>, callback: (() => void) | null = null) {
    let pubData = { ...this.state.pubData, ...newData };
    this.setState({ pubData: pubData }, () => {
      this.props.setData(pubData);

      if (pubData.path !== null && pubData.path !== "") {
        this.props.setSaveEnabled(true);
      } else {
        this.props.setSaveEnabled(false);
      }
      typeof callback === "function" && callback();
    });
  }

  render() {
    return (
      <React.Fragment>
        <div style={{ marginTop: "20px" }}>
          <FolderPicker
            label='Export folder'
            selectedFolder={this.state.pubData.path}
            onFolderSelected={(folder) => {
              this.updatePubData({ path: folder });
            }}
          />
        </div>

        <Box my={2}>
          <FormControl variant='outlined' sx={{ m: 1, minWidth: 300 }}>
            <InputLabel id='demo-simple-select-outlined-label'>Publish Source and Build</InputLabel>
            <Select
              labelId='demo-simple-select-outlined-label'
              id='demo-simple-select-outlined'
              value={this.state.pubData.publishScope}
              onChange={(e) => {
                if (e.target.value === "build") {
                  this.updatePubData({
                    publishScope: e.target.value,
                  });
                } else {
                  this.updatePubData({
                    publishScope: e.target.value,
                  });
                }
              }}
              label='Publish Source and Build'>
              <MenuItem value='build'>Publish only build files</MenuItem>
              <MenuItem value='source'>Publish only source files</MenuItem>
              <MenuItem value='build_and_source'>Publish source and build files</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box my={2}>
          <FormControlLabel
            sx={{ m: 1, mt: 2 }}
            control={
              <Switch
                checked={this.state.pubData.overrideBaseURLSwitch}
                onChange={(e) => {
                  if (this.state.pubData.overrideBaseURLSwitch) {
                    this.updatePubData({
                      overrideBaseURLSwitch: e.target.checked,
                      overrideBaseURL: "",
                    });
                  } else {
                    this.updatePubData({
                      overrideBaseURLSwitch: e.target.checked,
                    });
                  }
                }}
                name='overrideBaseURLSwitch'
                color='primary'
              />
            }
            label='Override BaseURL'
          />

          <TextField
            id='baseUrl'
            label='BaseURL'
            disabled={!this.state.pubData.overrideBaseURLSwitch}
            onChange={(e) => {
              this.updatePubData({ overrideBaseURL: e.target.value });
            }}
            value={this.state.pubData.overrideBaseURL}
            helperText='Override Hugo Configuration with new baseURL'
            variant='outlined'
            sx={{ m: 1 }}
          />
        </Box>
      </React.Fragment>
    );
  }
}

export default FormConfig;
