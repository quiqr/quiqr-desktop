import React from "react";
import AiIcon from "@mui/icons-material/Memory";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import service from "../services/service";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";

import OpenAI from "openai";
import { hasOpenAiApiKey } from "../utils/type-guards";
import { EasyMarkdownDynamicField } from "./SukohForm/components/EasyMarkDownDynamic";
import { TextFieldDynamicField } from "./SukohForm/components/TextFieldDynamic";
import MarkdownDynamic, { MarkdownDynamicField } from "./SukohForm/components/MarkdownDynamic";

interface AiAssistProps {
  inValue: string;
  inField: TextFieldDynamicField | EasyMarkdownDynamicField | MarkdownDynamicField;
  pageUrl: string;
  handleSetAiText: (text: string) => void;
}

interface AiAssistState {
  dialogOpen: boolean;
  result: string;
  runOn: string; // TODO: "none" | "infield" | "previewpage" | "";
  commandPrompt: string;
  webpage: string;
  assistendNotReady: boolean;
  aiBusy: boolean;
  formNotReady: boolean;
}

class AiAssist extends React.Component<AiAssistProps, AiAssistState> {
  constructor(props: AiAssistProps) {
    super(props);
    this.state = {
      dialogOpen: false,
      result: "",
      runOn: "",
      commandPrompt: "",
      webpage: "",
      assistendNotReady: true,
      aiBusy: false,
      formNotReady: true,
    };
  }

  checkAssistentReady() {
    if (this.state.commandPrompt !== "") {
      if (this.state.runOn === "previewpage" && this.state.webpage !== "") {
        this.setState({ assistendNotReady: false });
      } else if (this.state.runOn !== "previewpage") {
        this.setState({ assistendNotReady: false });
      } else {
        this.setState({ assistendNotReady: true });
      }
    } else {
      this.setState({ assistendNotReady: true });
    }
  }

  genPrompt() {
    if (this.state.commandPrompt === "") {
      return "";
    }
    if (this.state.runOn === "none") {
      return this.state.commandPrompt;
    } else if (this.state.runOn === "infield") {
      return this.state.commandPrompt + "\nApply this on the following text...\n " + this.props.inValue;
    } else if (this.state.runOn === "previewpage") {
      return this.state.commandPrompt + "\nApply this on the following text extracted from a webpage...\n " + this.props.inValue;
    }
    return "";
  }

  sendToAssistent() {
    service.api.readConfKey("prefs").then(async (value) => {
      if (hasOpenAiApiKey(value)) {
        const AIclient = new OpenAI({
          apiKey: value.openAiApiKey,
          dangerouslyAllowBrowser: true,
        });

        const content = this.genPrompt();
        //service.api.logToConsole(content);
        if (content !== "") {
          this.setState({ assistendNotReady: true, aiBusy: true });

          const stream = AIclient.chat.completions.stream({
            model: "gpt-4",
            messages: [{ role: "user", content: content }],
            stream: true,
          });

          const chatCompletion = await stream.finalChatCompletion();

          this.setState({ assistendNotReady: false, aiBusy: false });

          if (chatCompletion && chatCompletion.choices.length > 0) {
            this.setState({ result: chatCompletion.choices[0].message.content });
          } else {
            service.api.logToConsole("error");
          }
        }
      }
    });
  }

  renderDialog() {
    return (
      <Dialog open={this.state.dialogOpen} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-descriptio' fullWidth={true} maxWidth={"md"}>
        <DialogTitle id='alert-dialog-title'>{"AI Assist on: " + this.props.inField.title}</DialogTitle>
        <DialogContent>
          <Box my={3} sx={{ display: "flex" }}>
            <TextField
              fullWidth
              sx={{ m: 1 }}
              disabled={this.props.inValue === ""}
              id='standard-full-width'
              label='Current Text'
              value={this.props.inValue !== "" ? this.props.inValue : "empty"}
              variant='outlined'
            />
          </Box>

          <Box my={0} sx={{ display: "flex" }}>
            <FormControl variant='outlined' sx={{ m: 1, minWidth: 300 }}>
              <InputLabel id='demo-simple-select-outlined-label'>Run AI Assist with text</InputLabel>
              <Select
                labelId='demo-simple-select-outlined-label'
                id='runOn'
                value={this.state.runOn}
                onChange={(e) => {
                  this.checkAssistentReady();
                  this.setState({
                    runOn: e.target.value,
                  });

                  if (e.target.value === "previewpage") {
                    fetch(this.props.pageUrl)
                      .then((response) => {
                        switch (response.status) {
                          case 200:
                            return response.text();
                          case 404:
                            throw response;
                          default:
                            throw response;
                        }
                      })
                      .then((template) => {
                        this.setState({
                          webpage: template,
                        });
                        //service.api.logToConsole(template);
                      })
                      .catch((response) => {
                        this.setState({ webpage: "" });
                        //console.log(response);
                      });
                  }
                }}
                label='Run AI Assist with text'>
                {this.props.inValue !== "" ? <MenuItem value='infield'>from input field</MenuItem> : null}
                <MenuItem value='previewpage'>from preview page</MenuItem>
                <MenuItem value='none'>command prompt only</MenuItem>
              </Select>
            </FormControl>

            <TextField
              sx={{ m: 1 }}
              fullWidth
              id='standard-full-width'
              label='Command Prompt'
              value={this.state.commandPrompt}
              multiline
              variant='outlined'
              onChange={(e) => {
                this.setState({ commandPrompt: e.target.value });
                this.checkAssistentReady();
              }}
            />
          </Box>

          <Box my={0} sx={{ display: "flex" }}>
            <Button
              sx={{ marginLeft: "auto", m: 1 }}
              onClick={() => {
                this.sendToAssistent();
              }}
              disabled={this.state.assistendNotReady}
              color='primary'
              variant='contained'>
              Send prompt to AI assistent
            </Button>
            {this.state.aiBusy ? (
              <React.Fragment>
                &nbsp;
                <CircularProgress size={24} />
                &nbsp;
              </React.Fragment>
            ) : null}
          </Box>

          <Box my={3} sx={{ display: "flex" }}>
            <TextField
              fullWidth
              sx={{ m: 1 }}
              multiline
              id='standard-full-width'
              label='Result Text'
              placeholder='result text'
              value={this.state.result}
              onChange={(e) => {
                this.setState({ result: e.target.value });
              }}
              variant='outlined'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.setState({ dialogOpen: false });
            }}>
            Cancel
          </Button>
          <Button
            disabled={this.state.result === ""}
            onClick={() => {
              this.props.handleSetAiText(this.props.inValue + " \n" + this.state.result);
              this.setState({ dialogOpen: false });
            }}>
            Append text
          </Button>
          <Button
            disabled={this.state.result === ""}
            onClick={() => {
              this.props.handleSetAiText(this.state.result);
              this.setState({ dialogOpen: false });
            }}>
            Replace text
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  handleClick() {
    this.setState({ dialogOpen: true });
  }

  render() {
    return (
      <span style={{ display: "inline-block", position: "relative", cursor: "default" }}>
        {this.renderDialog()}
        <IconButton
          aria-label='AI-assist'
          onClick={() => {
            this.handleClick();
          }}
          size='large'>
          <AiIcon />
        </IconButton>
      </span>
    );
  }
}

export default AiAssist;
