import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import MarkdownIt from 'markdown-it';
import DefaultWrapper from '../components/shared/DefaultWrapper';
import { useField } from '../useField';
import type { InfoField as InfoFieldConfig } from '@quiqr/types';

const md = new MarkdownIt({ html: true });

// Theme-aware style generator
const getInfoStyles = (mode: 'light' | 'dark'): Record<string, React.CSSProperties> => {
  const isDark = mode === 'dark';
  
  return {
    default: { 
      border: isDark ? '1px solid #00a8cc' : '1px solid #00bcdc', 
      borderLeftWidth: '5px', 
      color: isDark ? '#6cb4d6' : '#34749a' 
    },
    bare: { 
      color: isDark ? '#6cb4d6' : '#34749a', 
      padding: 0 
    },
    warn: { 
      border: isDark ? '1px solid rgb(255, 165, 0)' : '1px solid rgb(220, 142, 0)', 
      borderLeftWidth: '5px', 
      color: isDark ? '#d4a574' : '#6f481f' 
    },
    'warn-bare': { 
      color: isDark ? '#d4a574' : '#6f481f', 
      padding: 0 
    },
    black: { 
      border: isDark ? '1px solid #666' : '1px solid #000', 
      borderLeftWidth: '5px', 
      color: isDark ? '#ccc' : '#000' 
    },
    'black-bare': { 
      color: isDark ? '#ccc' : '#000', 
      padding: 0 
    },
    gray: { 
      border: isDark ? '1px solid #555' : '1px solid #ccc', 
      borderLeftWidth: '5px', 
      color: isDark ? '#999' : '#666' 
    },
    'gray-bare': { 
      color: isDark ? '#999' : '#666', 
      padding: 0 
    },
  };
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
  const theme = useTheme();
  const { field } = useField(compositeKey);
  const config = field as InfoFieldConfig;

  const infoStyles = useMemo(() => getInfoStyles(theme.palette.mode), [theme.palette.mode]);

  const style = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      padding: '10px 20px',
      borderRadius: '2px',
      lineHeight: config.lineHeight,
    };

    const themeStyle = config.theme && infoStyles[config.theme] ? infoStyles[config.theme] : infoStyles.default;
    const sizeStyle = config.size && infoSizeStyles[config.size] ? infoSizeStyles[config.size] : infoSizeStyles.default;

    return { ...baseStyle, ...themeStyle, ...sizeStyle };
  }, [config.theme, config.size, config.lineHeight, infoStyles]);

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
