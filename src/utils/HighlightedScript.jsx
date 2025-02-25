
import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

const HighlightedScript = ({ content, onChange, activeLineIndex }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Disable validations
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true
    });

    // Register completion provider for $ and . triggers
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const lineContent = model.getLineContent(position.lineNumber);
        const wordUntilPosition = model.getWordUntilPosition(position);
        const prevChar = lineContent.charAt(wordUntilPosition.startColumn - 2);

        if (prevChar === '$') {
          try {
            let inputData = content;
            if (typeof inputData === 'string') {
              inputData = JSON.parse(inputData);
            }
            const keys = Object.keys(inputData);
            
            return {
              suggestions: keys.map(key => ({
                label: key,
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: key,
                range: {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn: wordUntilPosition.startColumn,
                  endColumn: wordUntilPosition.endColumn
                }
              }))
            };
          } catch (e) {
            console.error('Error parsing JSON input:', e);
            return { suggestions: [] };
          }
        }

        if (prevChar === '.') {
          const methods = [
            'concat', 'map', 'filter', 'reduce', 'forEach', 'find',
            'includes', 'indexOf', 'join', 'slice', 'sort', 'reverse'
          ];
          
          return {
            suggestions: methods.map(method => ({
              label: method,
              kind: monaco.languages.CompletionItemKind.Method,
              insertText: method,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: wordUntilPosition.startColumn,
                endColumn: wordUntilPosition.endColumn
              }
            }))
          };
        }

        return { suggestions: [] };
      },
      triggerCharacters: ['$', '.']
    });

    // Handle comments and line execution
    editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      if (!model) return;

      const lines = model.getLinesContent();
      const decorations = [];

      lines.forEach((line, index) => {
        if (line.trim().startsWith('//')) {
          decorations.push({
            range: new monaco.Range(index + 1, 1, index + 1, line.length + 1),
            options: {
              isWholeLine: true,
              className: 'commentedLine',
              inlineClassName: 'commentedText'
            }
          });
        }
      });

      editor.deltaDecorations([], decorations);

      // Filter out commented lines for execution
      const executableContent = lines
        .filter(line => !line.trim().startsWith('//'))
        .join('\n');
      
      onChange(executableContent);
    });

    // Set editor theme and options
    monaco.editor.defineTheme('scriptTheme', {
      base: 'vs',
      inherit: false,
      rules: [
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'string', foreground: '0451A5' },
        { token: 'number', foreground: '098658' },
        { token: 'keyword', foreground: '0000FF' }
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F7F7F7'
      }
    });

    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Manrope, Monaco, monospace',
      minimap: { enabled: false },
      lineNumbers: 'on',
      wordWrap: 'on',
      tabSize: 2,
      insertSpaces: true,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      formatOnPaste: true,
      formatOnType: true
    });
  };

  return (
    <div className="flex-1 relative font-['Manrope']">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        value={content}
        onMount={handleEditorDidMount}
        theme="scriptTheme"
        options={{
          readOnly: false,
          automaticLayout: true,
          scrollBeyondLastLine: false
        }}
      />
      <style jsx>{`
        .commentedLine {
          background-color: #f5f5f5;
          opacity: 0.7;
        }
        .commentedText {
          color: #008000 !important;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default HighlightedScript;
