import * as React from "react";
import { Route } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { ComponentContext } from "./component-context";
import { Debounce } from "./debounce";
import { FormStateBuilder } from "./form-state-builder";
import service from "../../services/service";
import { snackMessageService } from "../../services/ui-service";
import CloseIcon from "@mui/icons-material/Close";
import { FormBreadcrumb } from "../Breadcrumb";
import { FieldsExtender } from "./fields-extender";
import { ComponentRegistry } from "./component-registry";
import type { FieldBase } from "./types";
import { hasOpenAiApiKey, isValidPreviewConfiguration } from "../../utils/type-guards";

const Fragment = React.Fragment;
const componentMarginTop = "16px";

interface BuildAction {
  key: string;
  button_text: string;
}

interface FormProps {
  fields: Array<FieldBase>;
  values?: any;
  componentRegistry: ComponentRegistry;
  siteKey?: string;
  workspaceKey?: string;
  collectionKey?: string;
  collectionItemKey?: string;
  singleKey?: string;
  rootName?: string;
  pageUrl?: string;
  refreshed?: boolean;
  debug?: boolean;
  hideExternalEditIcon?: boolean;
  buildActions?: Array<BuildAction>;
  onChange?: (getDocument: () => any) => void;
  saveFormHandler: () => void;
  onOpenInEditor: () => void;
  plugins:any;
}

interface FormState {
  document: any;
  path: string;
  fields: Array<FieldBase>;
  renderError?: string | null;
  actionButtonLoading?: boolean;
  prefs?: any;
  enableAiAssist?: boolean;
  [key: string]: any; // For dynamic build_action_* properties
}

class Form extends React.Component<FormProps, FormState> {
  stateBuilder: FormStateBuilder;
  root: any;
  currentNode: any;
  history: any;
  forceUpdateThis: () => void;
  cache: string[];

  constructor(props: FormProps) {
    super(props);
    this.stateBuilder = new FormStateBuilder(this.props.componentRegistry);

    try {
      let fields = JSON.parse(JSON.stringify(props.fields));
      new FieldsExtender(this.props.componentRegistry).extendFields(fields);

      let formState = JSON.parse(JSON.stringify(props.values || {}));
      this.stateBuilder.makeRootState(fields, formState);

      let root = {
        field: {
          key: "root",
          compositeKey: "root",
          type: "root",
        },
        state: null,
        parent: null,
        uiState: null,
      };
      this.root = root;
      this.currentNode = root;
      this.state = {
        document: formState,
        path: "ROOT/",
        fields: fields,
        renderError: null,
      };

      this.forceUpdateThis = this.forceUpdate.bind(this);
      this.getFormDocumentClone = this.getFormDocumentClone.bind(this);
    } catch (error) {
      this.state = {
        document: {},
        path: "",
        fields: [],
        renderError: error instanceof Error ? error.message : String(error),
        actionButtonLoading: false,
      };
    }
  }

  static shapeDocument(updatedDoc: {}, doc: {}) {}

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ renderError: error.message });
    console.warn(error, errorInfo);
  }

  componentDidMount() {
    if (this.props.refreshed) {
      service.api.getCurrentFormNodePath().then((newNode) => {
        if (typeof newNode === "string") {
          this.setState({ path: newNode });
        }
      });
    }

    service.api.readConfKey("prefs").then((value) => {
      this.setState({ prefs: value });

      if (hasOpenAiApiKey(value)) {
        this.setState({ enableAiAssist: true });
      } else {
        this.setState({ enableAiAssist: false });
      }
    });
  }

  static getDerivedStateFromProps(props: FormProps, state: FormState) {
    return null;
  }

  generateParentPath() {
    let encodedSiteKey = this.props.siteKey ? encodeURIComponent(this.props.siteKey) : "";
    let encodedWorkspaceKey = this.props.workspaceKey ? encodeURIComponent(this.props.workspaceKey) : "";
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;
    let itemType = "collections";

    let newPath = `${basePath}/${itemType}/${encodeURIComponent(this.props.collectionKey)}`;
    return newPath;
  }

  setPath(node) {
    window.scrollTo(0, 0);
    this.currentNode = node;
    this.setState({ path: this.buildPath(node) }, () => {
      service.api.setCurrentFormNodePath(this.state.path);
    });
  }

  buildPath(currentNode) {
    if (currentNode == null) return "";
    let path = "";
    let nodes = [];
    let nodeLevel = 0;
    do {
      if (currentNode == null) break;
      nodes.push(currentNode);
      if (currentNode === this.root) {
        path = "ROOT/" + path;
      } else {
        let componentProplessInstance = this.props.componentRegistry.getProplessInstance(currentNode.field.type);
        if (componentProplessInstance) {
          let fragment = componentProplessInstance.buildPathFragment(currentNode, nodeLevel++, nodes);
          if (fragment) {
            path = fragment + "/" + path;
          }
        } else {
          throw new Error("Could not find component of type " + currentNode.field.type);
        }
      }
      if (currentNode.parent == null) break;
      else {
        currentNode = currentNode.parent;
      }
    } while (true);

    return path;
  }

  renderField(node, onValueChanged) {
    if (!node.field.title) {
      node.field.title = node.field.key;
    }

    if (node.field.disabled === true) {
      return null;
    }

    var { field } = node;
    let component = this.props.componentRegistry.get(field.type);
    try {
      if (component === undefined) throw new Error("Could not find component of type " + field.type);

      node.state = component.proplessInstance.allocateStateLevel(field, node.state, this.state.document);

      let nodePath = this.buildPath(node);
      let parentPath = this.buildPath(node.parent);

      let context = new ComponentContext(
        this,
        node,
        this.state.path,
        parentPath,
        nodePath,
        component.proplessInstance,
        onValueChanged,
        this.state.enableAiAssist,
        this.props.pageUrl
      );

      let DynamicComponent = component.classType;
      return <DynamicComponent key={field.key} context={context} />;
    } catch (e) {
      console.warn(e);
      return null;
    }
  }

  handleOpenPageInBrowser() {
    if (!this.props.pageUrl) {
      snackMessageService.addSnackMessage("No page URL (pageUrl) has been set", { severity: "warning" });

      return;
    }

    service.api
      .getPreviewCheckConfiguration()
      .then((conf) => {
        if (isValidPreviewConfiguration(conf) && conf.enable) {
          const sets = ["min_keywords", "max_keywords", "title_character_count", "description_character_count", "word_count", "content_css_selector"];

          let qstr = "";
          for (var i = 0; i < sets.length; i++) {
            qstr += `&${sets[i]}=${conf[sets[i]]}`;
          }

          const previewUrl = conf.preview_url + "?url=" + this.props.pageUrl + qstr;
          service.api.openExternal(previewUrl);
        } else {
          service.api.openExternal(this.props.pageUrl);
        }
      })
      .catch((e) => {
        service.api.logToConsole(e);
        service.api.openExternal(this.props.pageUrl);
      });
  }

  handleBackButton() {
    this.history.push(this.generateParentPath());
  }

  /**
   * Render a level of components
   * Can be used recursively when called by a component
   *
   * @field - the parent field config of the level
   * @state - the level state
   * @uiState - item in e.g. accordion, matches last number in breadcumb number
   * @parent - the previous renderLevel context object
   */
  renderLevel({ field, state, uiState, parent }) {
    if (this.props.debug) service.api.logToConsole("RENDER LEVEL");

    const fieldsElements = field.fields.map(
      function (childField) {
        let data = { field: childField, state: state, uiState, parent };
        let field = this.renderField(data);
        if (this.props.debug)
          service.api.logToConsole(
            {
              data,
              field,
              buildPathData: this.buildPath(data),
            },
            "FIELD"
          );
        return field;
      }.bind(this)
    );

    return <Fragment>{fieldsElements}</Fragment>;
  }

  getFormDocumentClone = () => {
    return JSON.parse(JSON.stringify(this.state.document));
  };

  forceUpdateDebounce: Debounce = new Debounce();
  handleChange(node: any, debounce: number) {
    this.forceUpdateDebounce.run(this.forceUpdateThis, debounce);

    if (this.props.onChange != null) {
      this.props.onChange(this.getFormDocumentClone);
    }
  }

  saveFormHandler() {
    this.props.saveFormHandler();
  }

  renderBreadcumb() {
    let currentNode = this.currentNode;

    let items = [];
    let nodes = [];

    try {
      do {
        nodes.push(currentNode);

        if (currentNode === this.root) {
          if (this.props.collectionItemKey) {
            let label = this.props.collectionItemKey;
            if (this.props.collectionItemKey.split("/").length > 0) {
              label = this.props.collectionItemKey.split("/")[0];
            }
            items.push({ label: label, node: currentNode });
          } else {
            items.push({ label: this.props.rootName || "ROOT", node: currentNode });
          }
        } else {
          let componentPropslessInstace = this.props.componentRegistry.getProplessInstance(currentNode.field.type);
          if (componentPropslessInstace && componentPropslessInstace.buildBreadcrumbFragment) {
            componentPropslessInstace.buildBreadcrumbFragment(currentNode, items);
          } else {
            throw new Error("Could not find component of type " + currentNode.field.type);
          }
        }
        currentNode = currentNode.parent;
      } while (currentNode);
    } catch (e) {
      items.push({ label: "Error", node: this.root });
    }

    items.reverse();

    return <FormBreadcrumb items={items} onNodeSelected={this.setPath.bind(this)} />;
  }

  getCurrentNodeDebugInfo() {
    let path;
    try {
      path = this.buildPath(this.currentNode);
    } catch (e) {
      path = e;
    }
    return { path: path };
  }

  handleDocBuild(buildAction) {
    let { siteKey, singleKey, workspaceKey, collectionKey, collectionItemKey } = this.props;

    let promise;
    this.setState({ actionButtonLoading: true });
    if (collectionKey) {
      promise = service.api.buildCollectionItem(siteKey, workspaceKey, collectionKey, collectionItemKey, buildAction);
    } else {
      promise = service.api.buildSingle(siteKey, workspaceKey, singleKey, buildAction);
    }

    promise.then(
      (buildResult) => {
        if (buildResult.stdoutType === "message") {
          snackMessageService.addSnackMessage(
            `Build ${buildAction} was succesful
              {buildResult.stdoutContent}`,
            { severity: "success" }
          );
        } else if (buildResult.stdoutType === "ascii_message") {
          snackMessageService.addSnackMessage(
              `Build ${buildAction} was succesful
              ${buildResult.stdoutContent}`,
            { severity: "success" }
          );
        } else if (buildResult.stdoutType === "file_path") {
          let action = (
            <React.Fragment>
              <Button
                color='secondary'
                size='small'
                onClick={() => {
                  service.api.openFileInEditor(buildResult.stdoutContent.replace("\n", ""));
                  snackMessageService.reportSnackDismiss();
                }}>
                Open
              </Button>
              <IconButton
                aria-label='close'
                color='inherit'
                onClick={() => {
                  snackMessageService.reportSnackDismiss();
                }}
                size='large'>
                <CloseIcon />
              </IconButton>
            </React.Fragment>
          );

          snackMessageService.addSnackMessage(`Build ${buildAction} was succesful`, { severity: "success", action: action });
        } else {
          snackMessageService.addSnackMessage(`Build ${buildAction} was succesful`, { severity: "success" });
        }
        this.setState({ actionButtonLoading: false });
      },
      () => {
        snackMessageService.addSnackMessage(`Build failed`, { severity: "warning" });
        this.setState({ actionButtonLoading: false });
      }
    );
  }

  render() {
    let backButton = undefined;
    if (this.props.collectionKey) {
      backButton = (
        <IconButton
          aria-label='back'
          onClick={() => {
            this.handleBackButton();
          }}
          size='large'>
          <ArrowBackIcon />
        </IconButton>
      );
    }

    let openInEditorButton = undefined;
    if (!this.props.hideExternalEditIcon) {
      openInEditorButton = (
        <Button
          onClick={() => {
            this.props.onOpenInEditor();
          }}
          size='small'
          variant='contained'
          startIcon={<DescriptionIcon />}>
          Open in Editor
        </Button>
      );
    }

    let openInBrowserButton = undefined;
    if (this.props.pageUrl) {
      openInBrowserButton = (
        <Button
          onClick={() => {
            this.handleOpenPageInBrowser();
          }}
          style={{ marginRight: "5px" }}
          size='small'
          variant='contained'
          startIcon={<OpenInBrowserIcon />}>
          Preview Page
        </Button>
      );
    }

    let buildActionButtons = undefined;
    if (this.props.buildActions) {
      buildActionButtons = this.props.buildActions.map((build_action) => {
        return (
          <Button
            key={"buildButton" + build_action.key}
            onClick={() => {
              this.handleDocBuild(build_action.key);
            }}
            style={{ marginRight: "5px" }}
            size='small'
            variant='contained'
            disabled={this.state["build_action_" + build_action]}
            startIcon={<OpenInBrowserIcon />}>
            {build_action.button_text}
          </Button>
        );
      });
    }

    if (this.state.renderError) return <p style={{ color: "red", padding: "24px" }}>{this.state.renderError}</p>;

    let breadcumb = this.renderBreadcumb();

    let form = (
      <div key={"dynamic-form"} style={{ padding: "0px" }}>
        <Box
          bgcolor='background.default'
          sx={{
            position: "sticky",
            zIndex: 1,
            top: 0,
            paddingBottom: "16px",
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingTop: "6px",
            width: "100%",
            display: "flex",
          }}>
          {backButton}

          <div style={Object.assign({ flexGrow: 1 })}>{breadcumb}</div>

          <div>
            {this.state.actionButtonLoading ? (
              <React.Fragment>
                &nbsp;
                <CircularProgress size={24} />
                &nbsp;
              </React.Fragment>
            ) : null}
            {buildActionButtons}
            {openInBrowserButton}
            {openInEditorButton}
          </div>
        </Box>
        <div key={"dynamic-form2"} style={{ padding: "20px" }}>
          {this.renderLevel({
            field: { fields: this.state.fields, key: "root", compositeKey: "root", type: "root" },
            state: this.state.document,
            uiState: undefined,
            parent: this.root,
          })}

          {this.props.debug ? (
            <div style={{ marginTop: componentMarginTop, overflow: "auto", border: "solid 1px #e8e8e8", borderRadius: "7px" }}>
              <pre style={{ padding: 16, margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{JSON.stringify(this.getCurrentNodeDebugInfo())}</pre>

              <pre style={{ padding: 16, margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{JSON.stringify(this.state, null, "   ")}</pre>
            </div>
          ) : undefined}
        </div>
      </div>
    );

    return (
      <Route
        render={({ history }) => {
          this.history = history;
          return form;
        }}
      />
    );
  }
}

export default Form;
