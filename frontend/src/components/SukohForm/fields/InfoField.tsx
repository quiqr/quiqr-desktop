import { useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import DefaultWrapper from '../components/shared/DefaultWrapper';
import { useField } from '../useField';
import type { InfoField as InfoFieldConfig } from '@quiqr/types';

const md = new MarkdownIt({ html: true });

const infoStyles: Record<string, React.CSSProperties> = {
  default: { border: '1px solid #00bcdc', borderLeftWidth: '5px', color: '#34749a' },
  bare: { color: '#34749a', padding: 0 },
  warn: { border: '1px solid rgb(220, 142, 0)', borderLeftWidth: '5px', color: '#6f481f' },
  'warn-bare': { color: '#6f481f', padding: 0 },
  black: { border: '1px solid #000', borderLeftWidth: '5px', color: '#000' },
  'black-bare': { color: '#000', padding: 0 },
  gray: { border: '1px solid #ccc', borderLeftWidth: '5px', color: '#aaa' },
  'gray-bare': { color: '#aaa', padding: 0 },
};

const infoSizeStyles: Record<string, React.CSSProperties> = {
  default: {},
  small: { fontSize: '85%' },
  large: { fontSize: '110%' },
};

interface Props {
  compositeKey: string;
}

/**
 * InfoField - displays static informational content rendered as markdown.
 * Supports different themes and sizes for styling.
 */
function InfoField({ compositeKey }: Props) {
  const { field } = useField(compositeKey);
  const config = field as InfoFieldConfig;

  const style = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      padding: '10px 20px',
      borderRadius: '2px',
      lineHeight: config.lineHeight,
    };

    const themeStyle = config.theme && infoStyles[config.theme] ? infoStyles[config.theme] : infoStyles.default;
    const sizeStyle = config.size && infoSizeStyles[config.size] ? infoSizeStyles[config.size] : infoSizeStyles.default;

    return { ...baseStyle, ...themeStyle, ...sizeStyle };
  }, [config.theme, config.size, config.lineHeight]);

  const renderedContent = useMemo(() => {
    return md.render(config.content ?? '');
  }, [config.content]);

  return (
    <DefaultWrapper>
      <div style={style} dangerouslySetInnerHTML={{ __html: renderedContent }} />
    </DefaultWrapper>
  );
}

export default InfoField;
