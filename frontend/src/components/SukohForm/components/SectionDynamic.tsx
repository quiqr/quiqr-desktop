import React from "react";
import type { DynamicFormNode, FieldBase, BaseDynamicProps, BaseDynamicState } from "../../HoForm";

import { BaseDynamic } from "../../HoForm";

interface SectionDynamicField extends FieldBase {
  title: string;
  fields: Array<any>;
  groupdata?: boolean;
}

type SectionDynamicProps = BaseDynamicProps<SectionDynamicField>;

type SectionDynamicState = BaseDynamicState;

class SectionDynamic extends BaseDynamic<SectionDynamicProps, SectionDynamicState> {
  allocateStateLevel(field: SectionDynamicField, parentState: any, _rootState: any) {
    if (field.groupdata == null || field.groupdata === true) {
      if (parentState[field.key] === undefined) parentState[field.key] = {};
      return parentState[field.key];
    }
    return parentState;
  }

  extendField(field: SectionDynamicField, fieldsExtender: any) {
    fieldsExtender.extendFields(field.fields);
  }

  normalizeState({ state, field, stateBuilder }: { state: any; field: SectionDynamicField; stateBuilder: any }) {
    stateBuilder.setLevelState(state, field.fields);
  }

  getType() {
    return "section";
  }

  buildBreadcrumbFragment(_currentNode: DynamicFormNode<SectionDynamicField>, _items: Array<{ label: string; node?: DynamicFormNode<FieldBase> }>): void {}

  buildPathFragment(_node: DynamicFormNode<SectionDynamicField>, _nodeLevel: number, _nodes: Array<DynamicFormNode<FieldBase>>): string | null {
    return undefined;
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, nodePath, parentPath } = context;
    let { field } = node;

    if (currentPath === parentPath) {
      var state = node.state;
      var level = context.renderLevel({
        field,
        state,
        parent: node.parent,
      });

      return (
        <React.Fragment>
          {field.title ? <div style={{ fontWeight: "bold", padding: "16px 0" }}>{field.title}</div> : undefined}
          <div style={{ padding: "16px 0px 0px 16px", marginBottom: "16px", borderLeft: "solid 10px #eee" }}>{level}</div>
        </React.Fragment>
      );
    }

    if (currentPath.startsWith(nodePath)) {
      return context.renderLevel({
        field,
        state: node.state,
        parent: node,
      });
    }

    return null;
  }
}

export default SectionDynamic;
