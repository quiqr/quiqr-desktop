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

export type PreviewConfig = { enable: boolean, preview_url: string }
export interface HugoConfigParsed {
  theme?: string;
  title?: string;
}

export interface QuiqrModelParsed {
  hugover?: string;
}