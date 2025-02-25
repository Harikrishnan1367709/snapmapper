
import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

const HighlightedScript = ({ content, onChange }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure JavaScript language features
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ["node_modules/@types"]
    });

    // Clear all default validations
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
    });

    // Register custom completion provider
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
                detail: 'JSON key',
                documentation: `Access the "${key}" field from input data`,
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
              detail: 'Array method',
              documentation: `Apply the ${method} method to the array`,
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
              inlineClassName: 'commentedText',
              glyphMarginClassName: 'commentGlyphMargin'
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

    // Define editor theme
    monaco.editor.defineTheme('scriptTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'string', foreground: '0451A5' },
        { token: 'number', foreground: '098658' },
        { token: 'keyword', foreground: '0000FF' }
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F7F7F7',
        'editorGutter.background': '#FFFFFF',
        'editorLineNumber.foreground': '#237893'
      }
    });

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Manrope, Monaco, monospace',
      minimap: { enabled: false },
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      highlightActiveIndentGuide: true,
      wordWrap: 'on',
      tabSize: 2,
      insertSpaces: true,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      formatOnPaste: true,
      formatOnType: true,
      suggest: {
        showMethods: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showKeywords: true,
        showWords: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showSnippets: true,
        showUsers: true
      }
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
          scrollBeyondLastLine: false,
          roundedSelection: false,
          padding: { top: 8, bottom: 8 },
          glyphMargin: true,
          renderValidationDecorations: 'off',
          snippetSuggestions: 'none',
          suggest: {
            snippetsPreventQuickSuggestions: true
          }
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
        .commentGlyphMargin {
          background-color: #f5f5f5;
        }
        :global(.monaco-editor .suggest-widget) {
          width: auto !important;
          max-width: 500px !important;
        }
      `}</style>
    </div>
  );
};

export default HighlightedScript;
