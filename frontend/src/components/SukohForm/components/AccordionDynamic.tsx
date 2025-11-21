import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import FolderIcon from "@mui/icons-material/Folder";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import dynamicComponentUtils from "./shared/dynamic-component-utils";
import { Accordion, AccordionItem } from "../../Accordion";
import DangerButton from "../../DangerButton";
import { BaseDynamic, BaseDynamicProps, BaseDynamicState } from "../../HoForm";
import type { FieldBase } from "../../HoForm/types";
import service from "../../../services/service";
import { isDynamicFormFieldConfig, isDynamicFormFieldConfigWithValues, isValidAppThemeConfiguration } from "../../../utils/type-guards";

const Fragment = React.Fragment;

interface ExtendedFieldBase extends FieldBase {
  lazy?: boolean;
  lazyTemp?: boolean;
  arrayTitle?: boolean;
}

export interface AccordionField extends ExtendedFieldBase {
  title: string;
  fields?: ExtendedFieldBase[];
  arrayIndicesAreKeys?: boolean;
  disableCreate?: boolean;
  disableSort?: boolean;
  disableDelete?: boolean;
  dynFormSearchKey?: string;
  dynFormObjectRoot?: string;
}

interface AccordionDynamicProps extends BaseDynamicProps<AccordionField> {}

interface AccordionDynamicState extends BaseDynamicState {
  index: number | null;
  dragFromIndex: number | null;
  dragToIndex: number | null;
  dynFields: Record<string, ExtendedFieldBase[]>;
  dynFieldsEmpty: ExtendedFieldBase[];
  headerBackgroundColor: string;
  itemCount: number;
  shouldSaveAccordionState: boolean;
}

class AccordionDynamic extends BaseDynamic<AccordionDynamicProps, AccordionDynamicState> {
  documentMouseUpListener: ((e: MouseEvent) => void) | undefined;

  constructor(props) {
    super(props);

    this.state = {
      index: null,
      dragFromIndex: null,
      dragToIndex: null,
      dynFields: {},
      dynFieldsEmpty: [],
      headerBackgroundColor: "#efefef",
      itemCount: 0,
      shouldSaveAccordionState: false,
      error_msg: null,
    };
  }

  componentDidMount() {
    this.procDynamicFields();

    let headerBackgroundColor = "#efefef";
    service.api.readConfKey("prefs").then((value) => {
      if (isValidAppThemeConfiguration(value)) {
        if (value.interfaceStyle === "quiqr10-dark") {
          headerBackgroundColor = "#666";
        }

        this.setState({
          headerBackgroundColor: headerBackgroundColor,
        });
      }
    });
  }

  extendField(field, fieldExtender) {
    fieldExtender.extendFields(field.fields);
  }

  getType() {
    return "accordion";
  }

  normalizeState({state, field, stateBuilder}) {
    if (field && field.arrayIndicesAreKeys !== true) {
      dynamicComponentUtils.normalizeStateForArrayOfObject(state, field, stateBuilder);
    }
  }

  buildBreadcrumbFragment(currentNode, items) {
    // has a previous item
    if (items.length > 0) {
      var previousItem = items[items.length - 1];
      if (previousItem.node == null || previousItem.node.uiState == null) {
        throw new Error("Unexpected state");
      }
      items.push({ label: "" + previousItem.node.uiState.childIndex, node: null });
    }
    items.push({ label: currentNode.field.title, node: (currentNode /*: any*/) });
  }

  buildPathFragment(node, nodeLevel, nodes) {
    if (nodeLevel > 0) return node.field.key + "/" + nodes[nodeLevel - 1].uiState.childIndex;
    return node.field.key;
  }

  onAddClickHandler(arrayIndicesAreKeys) {
    let context = this.props.context;
    let copy;

    let newData = {};
    context.setLevelState(newData, context.node.field.fields);
    if (arrayIndicesAreKeys) {
      copy = Object.assign({}, context.value);
      let newkey = `key-${Math.random()}`;
      copy[newkey] = newData;
    } else {
      copy = context.value.slice(0);
      copy.push(newData);
    }

    context.setValue(copy);
  }

  removeItemAtIndex(i, arrayIndicesAreKeys) {
    let context = this.props.context;
    let copy;

    if (arrayIndicesAreKeys) {
      copy = Object.assign({}, context.value);
      delete copy[i];
    } else {
      copy = context.value.slice(0);
      copy.splice(i, 1);
    }
    context.setValue(copy);
  }

  swapItems({ index, otherIndex }) {
    if (index === otherIndex) {
      return;
    }
    let context = this.props.context;

    //REMOVE ADDED LAZY ELEMENTS, WERE GOING TO ADD THEM AGAIN
    context.node.field.fields.forEach(function (fld, idx) {
      if (fld.lazy === true) {
        delete context.node.field.fields[idx];
      }
    });

    let copy = context.value.slice(0);
    let temp = copy[index];
    copy[index] = copy[otherIndex];
    copy[otherIndex] = temp;
    context.setValue(copy);

    this.procDynamicFields();
  }

  //DRAG EVENTS
  getDocumentMouseUpListener() {
    this.documentMouseUpListener = function (e) {
      if (this.state.dragFromIndex != null && this.state.dragToIndex != null) {
        this.swapItems({ index: this.state.dragFromIndex, otherIndex: this.state.dragToIndex });
        this.setState({ dragFromIndex: null, dragToIndex: null });
      }
      document.removeEventListener("mouseup", this.documentMouseUpListener);
    }.bind(this);
    return this.documentMouseUpListener;
  }

  getOnItemDragHandleMouseDown(index) {
    return function (e) {
      if (true) {
        this.setState({ dragFromIndex: index, dragToIndex: index, index: -1 });
        document.addEventListener("mouseup", this.getDocumentMouseUpListener());
      }
    }.bind(this);
  }

  getOnItemMouseEnter(index) {
    return function (e) {
      if (this.state.dragFromIndex != null) {
        this.setState({ dragToIndex: index });
      }
    }.bind(this);
  }

  getLastOpenState() {
    service.api.getCurrentFormAccordionIndex().then((pathPlusIndex) => {
      if (typeof pathPlusIndex === "string" && pathPlusIndex) {
        const arr = pathPlusIndex.split(" ");
        const index = parseInt(arr[1]);

        if (arr.length === 2 && index >= 0 && arr[0] === this.props.context.node.field.compositeKey) {
          this.setState({ index: index });
        }
      }
    });
  }

  procDynamicFields() {
    let { context } = this.props;
    let { node } = context;
    let { field } = node;

    let dynFields = {};
    let dynFieldsEmpty = field.fields;

    if (field.arrayIndicesAreKeys === true) {
      return;
    }

    if (!Array.isArray(context.value)) {
      context.value = [];
    }

    context.value.map(async (item, childIndex) => {
      let componentKey = `item-${childIndex}`;

      if ("dynFormSearchKey" in field) {
        //let dynFormObjectFile = "base"; //search in model/base by default
        let dynFormObjectRoot = "dynamics"; //search in sukoh by default

        if ("dynFormObjectRoot" in field) {
          dynFormObjectRoot = field.dynFormObjectRoot;
        }

        let searchKey = field["dynFormSearchKey"];
        let searchVal = item[searchKey];
        let dynSearchKeyVal = { key: searchKey, val: searchVal };

        await service.api.getDynFormFields(dynFormObjectRoot, dynSearchKeyVal).then((extraFields) => {
          if (isDynamicFormFieldConfigWithValues(extraFields)) {
            service.api.shouldReloadForm(context.node.field.compositeKey);

            this.setState({ shouldSaveAccordionState: true });

            extraFields.fields.forEach(function (extrField) {
              extrField.compositeKey = field.compositeKey + "." + extrField.key;
              extrField.lazy = true;

              //TODO make recursive
              if ("fields" in extrField) {
                extrField.fields.forEach(function (efld2nd) {
                  efld2nd.compositeKey = extrField.compositeKey + "." + efld2nd.key;
                });
              }
            });

            let cleanedFieldFields = field.fields.filter(function (obj) {
              let found = extraFields.fields.find((x) => x.key === obj.key);
              if (typeof found === "undefined") {
                return true;
              }
              return false; // TODO TESTEN
            });

            let newFields = cleanedFieldFields.concat(extraFields.fields);
            dynFields[componentKey] = newFields;
          } else {
          }
        });

        this.getLastOpenState();
      }
    });
    this.setState({ dynFieldsEmpty: dynFieldsEmpty });
    this.setState({ dynFields: dynFields });
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath } = context;
    let { field } = node;

    node.field.fields.forEach(function (fld, idx) {
      if (fld.lazyTemp === true) {
        delete node.field.fields[idx];
      }
    });

    if (field.arrayIndicesAreKeys !== true && !Array.isArray(context.value)) {
      context.value = [];
    }

    if (currentPath === context.parentPath) {
      return this.renderUnOpened(field.title, context, node, field);
    } else if (currentPath === context.nodePath) {
      return this.renderAccordion(field, context, currentPath, node);
    } else if (currentPath.startsWith(context.nodePath)) {
      let matchedNode = context.findPreviousNodeInCurrentNodeTree(node);

      if (matchedNode == null || matchedNode.uiState == null || matchedNode.uiState.childIndex == null) {
        service.api.logToConsole(context.nodePath, "error");
        throw new Error("Unexpected state.");
      }

      let childIndex = matchedNode.uiState.childIndex;
      let newState = context.value[childIndex];

      if (matchedNode.field.lazy === true) {
        //THIS ENSURES THAT THE DATASTRUCTURE IS KNOWN IN DE node.fields-array  for LAZY elements
        let compositeKeyInFields = false;
        node.field.fields.forEach(function (fld) {
          if (fld.compositeKey === matchedNode.field.compositeKey) {
            compositeKeyInFields = true;
          }
        });

        if (!compositeKeyInFields) {
          let newField = { ...matchedNode.field };
          newField.lazyTemp = true;
          node.field.fields.push(newField);
        }
      }

      return context.renderLevel({
        field,
        state: newState,
        uiState: { childIndex },
        parent: node,
      });
    } else {
      return null;
    }
  }

  handleAccordionClick(context, node) {
    context.setPath(node);
  }

  renderUnOpened(title, context, node, field) {
    let count = 0;
    if (field.arrayIndicesAreKeys !== true && Array.isArray(context.value)) {
      count = context.value.length;
    } else if (context.value && !Array.isArray(context.value)) {
      count = Object.keys(context.value).length;
    }

    return (
      <List style={{ marginBottom: 16, padding: 0 }}>
        <ListItem
          style={{ padding: "20px 16px", border: "solid 1px #d8d8d8", borderRadius: "7px" }}
          role={undefined}
          button="true"
          onClick={() => {
            this.handleAccordionClick(context, node);
          }}>
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>

          <ListItemText id={title} primary={`${title}`} secondary={`${count + " items"}`} />
          <ChevronRightIcon />
        </ListItem>
      </List>
    );
  }

  renderAccordion(field, context, currentPath, node) {
    let { dragToIndex, dragFromIndex } = this.state;
    let renderItem;

    if (field && field.arrayIndicesAreKeys === true) {
      renderItem = Object.keys(context.value).map((key) => {
        let componentKey = `item-${key}`;
        let item = context.value[key];
        return this.renderAccordionItem(field, context, node, componentKey, item, key, true);
      });
    } else {
      renderItem = context.value.map((item, childIndex) => {
        let componentKey = `item-${childIndex}`;

        if (childIndex === dragFromIndex) {
          return this.renderAccordionItem(field, context, node, componentKey, item, childIndex, false, true);
        }

        if (childIndex === dragToIndex && dragFromIndex != null && dragToIndex != null) {
          let movedItem = <div style={{ margin: "18px 0", height: "8px", background: "#00bcd4", borderRadius: 3 }}></div>;

          let beforeItem, afterItem;
          if (dragFromIndex < dragToIndex) {
            afterItem = movedItem;
          } else {
            beforeItem = movedItem;
          }
          return (
            <Fragment key={componentKey}>
              {beforeItem}
              {this.renderAccordionItem(field, context, node, componentKey, item, childIndex, false)}
              {afterItem}
            </Fragment>
          );
        } else {
          return this.renderAccordionItem(field, context, node, componentKey, item, childIndex, false);
        }
      });
    }

    return (
      <Fragment>
        <Accordion
          index={this.state.index}
          onChange={(index) => {
            this.setState({ index: this.state.index === index ? -1 : index });
            if (this.state.shouldSaveAccordionState) {
              service.api.setCurrentFormAccordionIndex(field.compositeKey + " " + index);
            }
          }}>
          {renderItem}
        </Accordion>

        {field.disableCreate !== true ? (
          <Button
            style={{ marginTop: 10 }}
            endIcon={<AddIcon />}
            variant='contained'
            onClick={() => {
              this.onAddClickHandler(field.arrayIndicesAreKeys);
            }}>
            Add
          </Button>
        ) : null}
      </Fragment>
    );
  }

  renderAccordionItem(field, context, node, componentKey, item, childIndexOrKey, arrayIndicesAreKeys = false, isDragging = false) {
    if (this.state.dynFieldsEmpty.length > 0) {
      if (componentKey in this.state.dynFields) {
        field.fields = this.state.dynFields[componentKey];
      } else {
        field.fields = this.state.dynFieldsEmpty;
      }
    }

    let label = "Untitled";

    let newNode = {
      field,
      state: context.value[childIndexOrKey],
      uiState: { childIndexOrKey },
      parent: node,
    };

    let itemDisabled = false;
    if (newNode.state["disabled"] !== undefined) {
      if (newNode.state["disabled"]) {
        itemDisabled = true;
      }
    }

    let arrayTitle = field.fields.find((x) => x.arrayTitle === true);
    if (arrayTitle && newNode.state[arrayTitle.key]) {
      if (newNode.state[arrayTitle.key].length > 100) {
        label = newNode.state[arrayTitle.key].substr(0, 100) + "...";
      } else {
        label = newNode.state[arrayTitle.key];
      }
    }

    let headStyle: React.CSSProperties = {
      backgroundColor: this.state.headerBackgroundColor,
    };
    // #aaa looks kind of good on light and dark mode
    // better to check which mode it is. and use efefef again
    if (isDragging) {
      headStyle = {
        backgroundColor: "#e2e2e2",
      };
    }
    if (itemDisabled) {
      headStyle = {
        ...headStyle,
        color: "#cccccc",
      };
    }
    let enableSort = true;
    if (field.arrayIndicesAreKeys === true || field.disableSort === true) {
      enableSort = false;
    }
    return (
      <AccordionItem
        key={componentKey}
        label={label}
        headStyle={headStyle}
        bodyStyle={{ padding: "16px 16px 0px 16px" }}
        //headStyle={{padding:'16px 16px 0px 16px' }}
        body={context.renderLevel(newNode)}
        active={false} // Will be overridden by parent Accordion component
        onHeadClick={() => {}} // Will be overridden by parent Accordion component
        wrapperProps={{
          onMouseEnter: this.getOnItemMouseEnter(childIndexOrKey),
        }}
        headerRightItems={[
          enableSort ? (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={this.getOnItemDragHandleMouseDown(childIndexOrKey)}
              style={{ minWidth: 40, cursor: "move" }}
              size='small'
              aria-label='sort'>
              <DragHandleIcon />
            </IconButton>
          ) : null,
          field.disableDelete !== true ? (
            <DangerButton
              onClick={(e, loaded) => {
                e.stopPropagation();
                if (loaded) {
                  this.removeItemAtIndex(childIndexOrKey, arrayIndicesAreKeys);
                }
              }}
              loadedButton={
                <IconButton size='small' color='secondary' aria-label='delete'>
                  {" "}
                  <ClearIcon />{" "}
                </IconButton>
              }
              button={
                <IconButton size='small' aria-label='delete'>
                  {" "}
                  <ClearIcon />{" "}
                </IconButton>
              }
            />
          ) : null,
        ]}
      />
    );
  }
}

export default AccordionDynamic;
