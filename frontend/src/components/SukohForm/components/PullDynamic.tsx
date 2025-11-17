import { BaseDynamic } from "../../HoForm";
import type { DynamicFormNode, FieldBase, BaseDynamicProps, BaseDynamicState, FieldsExtenderType, FormStateBuilderType } from "../../HoForm";

interface PullDynamicField extends FieldBase {
  group?: string;
  fields: Array<any>;
}

type PullDynamicProps = BaseDynamicProps<PullDynamicField>;

type PullDynamicState = BaseDynamicState;

class PullDynamic extends BaseDynamic<PullDynamicProps, PullDynamicState> {
  allocateStateLevel(field: PullDynamicField, parentState: any, _rootState: any) {
    let key = field.group;
    if (parentState[key] === undefined) parentState[key] = {};
    return parentState[key];
  }

  extendField(field: PullDynamicField, fieldExtender: FieldsExtenderType) {
    fieldExtender.extendFields(field.fields);
  }

  normalizeState({ state, field, stateBuilder }: { state: any; field: PullDynamicField; stateBuilder: FormStateBuilderType }) {
    stateBuilder.setLevelState(state, field.fields);
  }

  getType() {
    return "pull";
  }

  uildBreadcrumbFragment(_node: any, _buttons: Array<{ label: string; node: any }>) {}

  buildPathFragment(_node: DynamicFormNode<PullDynamicField>) {
    return undefined;
  }

  renderComponent() {
    let { context } = this.props;
    let { node, currentPath, nodePath } = context;
    let { field } = node;

    if (currentPath.startsWith(nodePath)) {
      var state = node.state;
      return context.renderLevel({ field, state, parent: node });
    }

    return null;
  }
}

export default PullDynamic;
