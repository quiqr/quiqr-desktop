import * as React from "react";
import QuiqrColorLogo from "../svg-assets/QuiqrColorLogo";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

interface SplashDialogProps {
  showSplashAtStartup: boolean;
  open: boolean;
  onClose: () => void;
  onChangeSplashCheck: (targetValue: boolean) => void;
}

interface SplashDialogState {
  showSplashAtStartup: boolean;
}

class SplashDialog extends React.Component<SplashDialogProps, SplashDialogState> {
  constructor(props) {
    super(props);
    this.state = {
      showSplashAtStartup: false,
    };
  }

  componentDidMount() {
    this.setState({ showSplashAtStartup: this.props.showSplashAtStartup });
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.showSplashAtStartup !== nextProps.showSplashAtStartup) {
      this.setState({ showSplashAtStartup: nextProps.showSplashAtStartup });
    }
  }

  render() {
    let { open } = this.props;

    return (
      <Dialog open={open} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description' fullWidth={true} maxWidth={"sm"}>
        <DialogContent>
          <Box sx={{ border: "green solid 0px", display: "flex", justifyContent: "center" }}>
            <QuiqrColorLogo style={{ transform: "scale(0.5)" }} />
          </Box>

          <Box sx={{ border: "green solid 0px", display: "flex", justifyContent: "center" }}>
            <Typography variant='h5'>Welcome!</Typography>
          </Box>
          <Box sx={{ border: "green solid 0px", display: "flex", justifyContent: "center" }}>
            <p>Quiqr is a CMS for Hugo Static Generated Websites</p>
          </Box>

          <Box sx={{ border: "green solid 0px", display: "flex", justifyContent: "center" }}>
            <Button
              style={{ margin: "5px" }}
              color='primary'
              variant='contained'
              onClick={() => {
                window.require("electron").shell.openExternal("https://book.quiqr.org/docs/10-getting-started/10.quick-start-video/");
              }}>
              Quickstart Movie
            </Button>

            <Button
              style={{ margin: "5px" }}
              color='primary'
              variant='contained'
              onClick={() => {
                this.props.onClose();
                window.require("electron").shell.openExternal("https://book.quiqr.org/docs/10-getting-started/");
              }}>
              Quickstart Guide
            </Button>
          </Box>
        </DialogContent>

        <Box sx={{ display: "flex", p: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.showSplashAtStartup}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    this.setState({ showSplashAtStartup: e.target.checked });
                    this.props.onChangeSplashCheck(e.target.checked);
                  }}
                  inputProps={{ "aria-label": "primary checkbox" }}
                />
              }
              label='Show this window at start'
              labelPlacement='end'
            />
          </Box>
          <Box>
            <Button
              onClick={() => {
                this.props.onClose();
              }}>
              Close
            </Button>
          </Box>
        </Box>
      </Dialog>
    );
  }
}
export default SplashDialog;
