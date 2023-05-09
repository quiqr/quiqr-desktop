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

export interface DynamicFormNode<Field: FieldBase> {
    field: Field;
    state: any;
    parent : ?DynamicFormNode<FieldBase>;
    uiState: ?any;
}

export interface ComponentProps<Field : FieldBase> {
    context: ComponentContext<Field>
};
