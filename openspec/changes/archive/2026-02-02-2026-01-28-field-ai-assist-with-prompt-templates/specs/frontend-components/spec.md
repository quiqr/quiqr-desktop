# frontend-components Delta Specification

## ADDED Requirements

### Requirement: Field-Level AI Assist Components

The system SHALL provide dedicated components for field-level AI assistance that use backend LLM service and support prompt templates.

#### Scenario: FieldAIAssistButton component

- **GIVEN** a field has `field_prompt_templates` configured
- **WHEN** the field component renders
- **THEN** it SHALL display a `FieldAIAssistButton` icon button
- **AND** the button SHALL have an AI icon
- **AND** the button SHALL have tooltip "AI Assist"
- **AND** clicking the button SHALL open the `FieldAIAssistDialog`

#### Scenario: FieldAIAssistButton hidden without templates

- **GIVEN** a field does not have `field_prompt_templates` configured
- **WHEN** the field component renders
- **THEN** the `FieldAIAssistButton` SHALL NOT be displayed

#### Scenario: FieldAIAssistDialog template selection

- **GIVEN** the `FieldAIAssistDialog` is open
- **WHEN** user views the dialog
- **THEN** the dialog SHALL display a list of available templates from `field_prompt_templates`
- **AND** user SHALL be able to select one template
- **AND** selecting a template SHALL load its configuration from backend

#### Scenario: FieldAIAssistDialog dynamic form

- **GIVEN** a field template is loaded with form fields
- **WHEN** the template configuration is received
- **THEN** the dialog SHALL render a dynamic form based on template fields
- **AND** form SHALL support field types: text, select, textarea, readonly
- **AND** form state SHALL be managed locally in the dialog

#### Scenario: FieldAIAssistDialog prompt processing

- **GIVEN** the user fills out the template form
- **WHEN** user clicks "Generate" or "Process" button
- **THEN** the dialog SHALL call backend API `processFieldAiPrompt`
- **AND** request SHALL include field context: `fieldKey`, `fieldType`, `fieldContent`
- **AND** request SHALL include parent page path: `collectionKey`, `collectionItemKey`, OR `singleKey`
- **AND** request SHALL include form values
- **AND** dialog SHALL show loading indicator during processing

#### Scenario: FieldAIAssistDialog result actions

- **GIVEN** the AI has generated result content
- **WHEN** the result is displayed in the dialog
- **THEN** the dialog SHALL show a preview of the generated content
- **AND** the dialog SHALL show "Replace" button
- **AND** the dialog SHALL show "Append" button
- **AND** the dialog SHALL show "Cancel" button
- **AND** clicking "Replace" SHALL call `onReplace(content)` callback
- **AND** clicking "Append" SHALL call `onAppend(content)` callback
- **AND** both actions SHALL close the dialog

#### Scenario: FieldAIAssistDialog error handling

- **GIVEN** the prompt processing fails
- **WHEN** the backend returns an error
- **THEN** the dialog SHALL display a user-friendly error message
- **AND** the dialog SHALL hide loading indicator
- **AND** the dialog SHALL allow user to retry or cancel

#### Scenario: StringField with AI assist

- **GIVEN** a `StringField` with `field_prompt_templates: ["improve_text"]`
- **WHEN** the field renders
- **THEN** the field SHALL include `FieldAIAssistButton` in icon buttons
- **AND** clicking the button SHALL open dialog with field's current value
- **AND** "Replace" action SHALL update the field value
- **AND** "Append" action SHALL concatenate to existing value

#### Scenario: MarkdownField with AI assist

- **GIVEN** a `MarkdownField` with `field_prompt_templates: ["expand_text"]`
- **WHEN** the field renders
- **THEN** the field SHALL include `FieldAIAssistButton` in toolbar
- **AND** clicking the button SHALL open dialog with field's current content
- **AND** "Replace" action SHALL replace markdown content
- **AND** "Append" action SHALL append to markdown content

### Requirement: Page-Level AI Assist Component Naming

The system SHALL use semantic, scope-specific names for page-level AI assist components to distinguish them from field-level components.

#### Scenario: PageAIAssistButton component

- **GIVEN** the page-level AI assist button component exists
- **WHEN** referenced in code or documentation
- **THEN** it SHALL be named `PageAIAssistButton` (not `AiAssist`)
- **AND** the component file SHALL be located at `components/PageAIAssistButton.tsx`
- **AND** all imports SHALL use the new name

#### Scenario: PageAIAssistDialog component

- **GIVEN** the page-level AI assist dialog component exists
- **WHEN** referenced in code or documentation
- **THEN** it SHALL be named `PageAIAssistDialog` (not `AIAssistDialog`)
- **AND** the component file SHALL be located at `components/SukohForm/PageAIAssistDialog.tsx`
- **AND** all imports SHALL use the new name

#### Scenario: Component functionality preserved after rename

- **GIVEN** page-level AI components are renamed
- **WHEN** using the renamed components
- **THEN** all existing functionality SHALL work exactly as before
- **AND** page prompts SHALL load from `page_prompt_templates/` directory
- **AND** page context variables SHALL work as expected

### Requirement: Field Components Integration

Field components (StringField, MarkdownField) SHALL integrate `FieldAIAssistButton` when `field_prompt_templates` is configured.

#### Scenario: StringField integration

- **GIVEN** a `StringField` component is rendered
- **WHEN** field config includes `field_prompt_templates` array with at least one template
- **THEN** the component SHALL import and render `FieldAIAssistButton`
- **AND** the button SHALL be added to the `iconButtons` array
- **AND** the button SHALL receive props: `compositeKey`, `fieldKey`, `fieldType`, `fieldContent`, `availableTemplates`, `onSetContent`

#### Scenario: MarkdownField integration

- **GIVEN** a `MarkdownField` component is rendered
- **WHEN** field config includes `field_prompt_templates` array with at least one template
- **THEN** the component SHALL import and render `FieldAIAssistButton`
- **AND** the button SHALL be added to the editor toolbar
- **AND** the button SHALL receive the same props as StringField

#### Scenario: Field AI callback implementation

- **GIVEN** a field component uses `FieldAIAssistButton`
- **WHEN** the button's `onSetContent` callback is invoked
- **THEN** the field SHALL call `setValue(newContent, 0)` for immediate update
- **AND** if `autoSave` is enabled, the field SHALL call `saveForm()`

### Requirement: Frontend API Methods for Field Prompts

The frontend API client SHALL provide methods for loading field prompt templates and processing field prompts.

#### Scenario: Load field prompt template config

- **GIVEN** the API client is initialized
- **WHEN** `service.api.getFieldPromptTemplateConfig(siteKey, workspaceKey, templateKey)` is called
- **THEN** the function SHALL make a request to backend endpoint `getFieldPromptTemplateConfig`
- **AND** the function SHALL return template configuration including fields and LLM settings
- **AND** the function SHALL use proper TypeScript types

#### Scenario: Process field AI prompt

- **GIVEN** the API client is initialized
- **WHEN** `service.api.processFieldAiPrompt(siteKey, workspaceKey, templateKey, formValues, fieldContext)` is called
- **THEN** the function SHALL make a request to backend endpoint `processFieldAiPrompt`
- **AND** `fieldContext` SHALL include: `fieldKey`, `fieldType`, `fieldContent`, `collectionKey?`, `collectionItemKey?`, `singleKey?`
- **AND** the function SHALL return AI-generated content string
- **AND** the function SHALL use proper TypeScript types

## MODIFIED Requirements

None - Existing component requirements remain unchanged. The functional component pattern, type safety, and utility module patterns all remain in place.

## REMOVED Requirements

None - This capability adds new requirements without removing any existing ones.

## RENAMED Requirements

None - No requirements are being renamed, only components are being renamed for clarity.
