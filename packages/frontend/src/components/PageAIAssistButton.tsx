import { useState, useEffect, useCallback } from "react";
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
import type { StringField, EasymdeField, MarkdownField } from "@quiqr/types";

// Field type that can be used with AI assist - all have title property
type AiAssistField = StringField | EasymdeField | MarkdownField;

interface PageAIAssistButtonProps {
  inValue: string;
  inField: AiAssistField;
  handleSetAiText: (text: string) => void;
}

const PageAIAssistButton = ({ inValue, inField, handleSetAiText }: PageAIAssistButtonProps) => {
  // State hooks
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState("");
  const [runOn, setRunOn] = useState("");
  const [commandPrompt, setCommandPrompt] = useState("");
  const [assistendNotReady, setAssistendNotReady] = useState(true);
  const [aiBusy, setAiBusy] = useState(false);

  // Check assistant readiness whenever relevant state changes
  useEffect(() => {
    if (commandPrompt !== "") {
      setAssistendNotReady(false);
    } else {
      setAssistendNotReady(true);
    }
  }, [commandPrompt]);

  // Generate prompt based on mode
  const genPrompt = useCallback(() => {
    if (commandPrompt === "") {
      return "";
    }
    if (runOn === "none") {
      return commandPrompt;
    } else if (runOn === "infield") {
      return commandPrompt + "\nApply this on the following text...\n " + inValue;
    }
    return "";
  }, [commandPrompt, runOn, inValue]);

  // Send prompt to OpenAI assistant
  const sendToAssistent = useCallback(async () => {
    const value = await service.api.readConfKey("prefs");
    if (hasOpenAiApiKey(value)) {
      const AIclient = new OpenAI({
        apiKey: value.openAiApiKey,
        dangerouslyAllowBrowser: true,
      });

      const content = genPrompt();
      if (content !== "") {
        setAssistendNotReady(true);
        setAiBusy(true);

        const stream = AIclient.chat.completions.stream({
          model: "gpt-4",
          messages: [{ role: "user", content: content }],
          stream: true,
        });

        const chatCompletion = await stream.finalChatCompletion();

        setAssistendNotReady(false);
        setAiBusy(false);

        if (chatCompletion && chatCompletion.choices.length > 0) {
          setResult(chatCompletion.choices[0].message.content || "");
        } else {
          service.api.logToConsole("error");
        }
      }
    }
  }, [genPrompt]);


  return (
    <span style={{ display: "inline-block", position: "relative", cursor: "default" }}>
      <Dialog open={dialogOpen} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-descriptio" fullWidth={true} maxWidth={"md"}>
        <DialogTitle id="alert-dialog-title">{"AI Assist on: " + inField.title}</DialogTitle>
        <DialogContent>
          <Box my={3} sx={{ display: "flex" }}>
            <TextField
              fullWidth
              sx={{ m: 1 }}
              disabled={inValue === ""}
              id="standard-full-width"
              label="Current Text"
              value={inValue !== "" ? inValue : "empty"}
              variant="outlined"
            />
          </Box>

          <Box my={0} sx={{ display: "flex" }}>
            <FormControl variant="outlined" sx={{ m: 1, minWidth: 300 }}>
              <InputLabel id="demo-simple-select-outlined-label">Run AI Assist with text</InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label"
                id="runOn"
                value={runOn}
                onChange={(e) => setRunOn(e.target.value)}
                label="Run AI Assist with text"
              >
                {inValue !== "" ? <MenuItem value="infield">from input field</MenuItem> : null}
                <MenuItem value="none">command prompt only</MenuItem>
              </Select>
            </FormControl>

            <TextField
              sx={{ m: 1 }}
              fullWidth
              id="standard-full-width"
              label="Command Prompt"
              value={commandPrompt}
              multiline
              variant="outlined"
              onChange={(e) => setCommandPrompt(e.target.value)}
            />
          </Box>

          <Box my={0} sx={{ display: "flex" }}>
            <Button
              sx={{ marginLeft: "auto", m: 1 }}
              onClick={sendToAssistent}
              disabled={assistendNotReady}
              color="primary"
              variant="contained"
            >
              Send prompt to AI assistent
            </Button>
            {aiBusy && (
              <>
                &nbsp;
                <CircularProgress size={24} />
                &nbsp;
              </>
            )}
          </Box>

          <Box my={3} sx={{ display: "flex" }}>
            <TextField
              fullWidth
              sx={{ m: 1 }}
              multiline
              id="standard-full-width"
              label="Result Text"
              placeholder="result text"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            disabled={result === ""}
            onClick={() => {
              handleSetAiText(inValue + " \n" + result);
              setDialogOpen(false);
            }}
          >
            Append text
          </Button>
          <Button
            disabled={result === ""}
            onClick={() => {
              handleSetAiText(result);
              setDialogOpen(false);
            }}
          >
            Replace text
          </Button>
        </DialogActions>
      </Dialog>
      <IconButton aria-label="AI-assist" onClick={() => setDialogOpen(true)} size="large">
        <AiIcon />
      </IconButton>
    </span>
  );
};

export default PageAIAssistButton;
