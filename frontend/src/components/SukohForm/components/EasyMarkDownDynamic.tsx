import * as React from "react";
import FormItemWrapper from "./shared/FormItemWrapper";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import Tip from "../../Tip";
import { BaseDynamic, BaseDynamicProps, BaseDynamicState, FieldBase } from "../../HoForm";
//import service                              from './../../../services/service'
import { EditorChange } from "codemirror";

export interface EasyMarkdownDynamicField extends FieldBase {
  default?: string;
  multiLine?: boolean;
  tip?: string;
  title?: string;
}

type EasyMarkdownDynamicProps = BaseDynamicProps<EasyMarkdownDynamicField>;

type EasyMarkdownDynamicState = BaseDynamicState;

const autofocusNoSpellcheckerOptions = {
  autofocus: false,
  spellChecker: false,
};

class EasyMarkdownDynamic extends BaseDynamic<EasyMarkdownDynamicProps, EasyMarkdownDynamicState> {
  normalizeState({ state, field }: { state: any; field: EasyMarkdownDynamicField }) {
    let key = field.key;
    if (state[key] === undefined) {
      state[key] = field.default || "";
    }
  }

  getType() {
    return "easymde";
  }

  handleChange = (value: string, e: EditorChange) => {
    this.forceUpdate();
    this.props.context.setValue(e, 250);
  };

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, parentPath } = context;
    let { field } = node;

    if (currentPath !== parentPath) {
      return null;
    }

    let iconButtons = [];
    if (field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    return (
      <FormItemWrapper
        control={<SimpleMDE options={autofocusNoSpellcheckerOptions} value={context.value} onChange={this.handleChange} />}
        iconButtons={iconButtons}
      />
    );
  }
}

export default EasyMarkdownDynamic;
