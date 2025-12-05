/**
 * EasyMdeField - now uses MDXEditor (same as MarkdownField).
 * The legacy react-simplemde-editor has been replaced with MDXEditor
 * for React 19 compatibility.
 */

// Re-export MarkdownField since both now use MDXEditor
export { default } from './MarkdownField';
