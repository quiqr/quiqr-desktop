import { useRef, useEffect } from 'react';
import '@mdxeditor/editor/style.css';
import {
  MDXEditor,
  MDXEditorMethods,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  ListsToggle,
  Separator,
  toolbarPlugin,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  markdownShortcutPlugin,
} from '@mdxeditor/editor';
import FormItemWrapper from '../components/shared/FormItemWrapper';
import Tip from '../../Tip';
import AiAssist from '../../AiAssist';
import { useField } from '../useField';
import type { MarkdownField as MarkdownFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * MarkdownField - rich markdown editor using MDXEditor.
 * Replaces the legacy react-simplemde-editor and plain textarea implementations.
 */
function MarkdownField({ compositeKey }: Props) {
  const { field, value, setValue, meta } = useField<string>(compositeKey);
  const config = field as MarkdownFieldConfig;
  const editorRef = useRef<MDXEditorMethods>(null);

  // Sync editor content when external value changes
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const currentMarkdown = editorRef.current.getMarkdown();
      if (currentMarkdown !== value) {
        editorRef.current.setMarkdown(value);
      }
    }
  }, [value]);

  const handleChange = (markdown: string) => {
    setValue(markdown, 250);
  };

  const iconButtons: React.ReactNode[] = [];

  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  if (meta.enableAiAssist) {
    iconButtons.push(
      <AiAssist
        key="ai-assist"
        handleSetAiText={(text: string) => {
          editorRef.current?.setMarkdown(text);
          setValue(text);
        }}
        inField={config}
        inValue={value ?? ''}
      />
    );
  }

  return (
    <FormItemWrapper
      control={
        <div style={{ width: '100%' }}>
          {config.title && (
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                color: 'rgba(0, 0, 0, 0.6)',
              }}
            >
              {config.title}
            </label>
          )}
          <div
            style={{
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <MDXEditor
              ref={editorRef}
              markdown={value ?? config.default ?? ''}
              onChange={handleChange}
              plugins={[
                headingsPlugin(),
                listsPlugin(),
                linkPlugin(),
                quotePlugin(),
                markdownShortcutPlugin(),
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <Separator />
                      <BoldItalicUnderlineToggles />
                      <Separator />
                      <BlockTypeSelect />
                      <Separator />
                      <ListsToggle />
                      <Separator />
                      <CreateLink />
                    </>
                  ),
                }),
              ]}
              contentEditableClassName="prose max-w-full min-h-[200px] p-3"
            />
          </div>
        </div>
      }
      iconButtons={iconButtons}
    />
  );
}

export default MarkdownField;
