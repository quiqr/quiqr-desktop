import * as React from "react";
import FormItemWrapper from "./shared/FormItemWrapper";
// import SimpleMDE from "react-simplemde-editor";
// import "easymde/dist/easymde.min.css";
import Tip from "../../Tip";
import { BaseDynamic, BaseDynamicProps, BaseDynamicState, FieldBase } from "../../HoForm";
//import service                              from './../../../services/service'
// import { EditorChange } from "codemirror";

export interface EasyMarkdownDynamicField extends FieldBase {
  default?: string;
  multiLine?: boolean;
  tip?: string;
  title?: string;
}

type EasyMarkdownDynamicProps = BaseDynamicProps<EasyMarkdownDynamicField>;

type EasyMarkdownDynamicState = BaseDynamicState;

class EasyMarkdownDynamic extends BaseDynamic<EasyMarkdownDynamicProps, EasyMarkdownDynamicState> {
  normalizeState({ state, field }: { state: any; field: EasyMarkdownDynamicField }) {
    const key = field.key;
    if (state[key] === undefined) {
      state[key] = field.default || "";
    }
  }

  getType() {
    return "easymde";
  }

  renderComponent() {
    const { context } = this.props;
    const { node, currentPath, parentPath } = context;
    const { field } = node;

    if (currentPath !== parentPath) {
      return null;
    }

    const iconButtons = [];
    if (field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    return (
      <FormItemWrapper
        control={
          <div style={{ color: "red", fontSize: "2rem" }}>
            This component has temporarily been disabled.
          </div>
        }
        iconButtons={iconButtons}
      />
    );
  }
}

export default EasyMarkdownDynamic;
