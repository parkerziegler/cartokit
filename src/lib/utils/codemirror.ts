import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

export const syntaxTheme = HighlightStyle.define([
  {
    tag: [tags.comment, tags.lineComment, tags.blockComment, tags.docComment],
    color: '#637777'
  },
  {
    tag: [tags.name, tags.propertyName],
    color: '#80cbc4'
  },
  {
    tag: tags.variableName,
    color: '#d6deeb'
  },
  {
    tag: [tags.typeName, tags.className, tags.literal, tags.string],
    color: '#addb67'
  },
  {
    tag: tags.number,
    color: '#f78c6c'
  },
  {
    tag: tags.bool,
    color: '#ff5874'
  },
  {
    tag: [tags.keyword, tags.operator],
    color: '#7fdbca'
  },
  {
    tag: [tags.paren, tags.brace, tags.bracket],
    color: '#c792ea'
  },
  {
    tag: tags.function(tags.propertyName),
    color: '#82aaff'
  }
]);

export const editorTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      backgroundColor: '#0f172a'
    },
    '.cm-scroller': {
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;'
    },
    '.cm-gutters': {
      backgroundColor: '#0f172a',
      color: '#506377',
      padding: '0 6px',
      borderRight: '1px solid #506377'
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
      color: '#d6deeb'
    },
    '.cm-activeLine': {
      backgroundColor: 'transparent'
    },
    '.cm-selectionBackground, ::selection': {
      backgroundColor: '#24395a'
    },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground':
      {
        backgroundColor: '#24395a'
      },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#d6deeb'
    }
  },
  { dark: true }
);
