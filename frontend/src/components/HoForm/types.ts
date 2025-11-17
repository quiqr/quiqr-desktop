import type { ComponentContext } from './component-context'
export type { ComponentContext } from './component-context'

export interface FieldBase {
    key: string;
    compositeKey: string;
    type: string;
}

export interface FieldBaseGroup extends FieldBase {
    fields: Array<FieldBase>;
};

export interface DynamicFormNode<Field extends FieldBase = FieldBase> {
    field: Field;
    state: any;
    parent: DynamicFormNode<any>;
    uiState: any;
}

interface BaseComponentProps { }

interface BaseComponentState { }

export interface ComponentProps<P extends BaseComponentProps, S extends BaseComponentState> {
    context: ComponentContext<FieldBase>
};

// Re-export the real classes for convenience
export type { FormStateBuilder } from './form-state-builder';
export type { FieldsExtender } from './fields-extender';

export type PreviewConfig = { enable: boolean, preview_url: string }
export interface HugoConfigParsed {
  theme?: string;
  title?: string;
}

export interface QuiqrModelParsed {
  hugover?: string;
}