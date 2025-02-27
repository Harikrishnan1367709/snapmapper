import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const HighlightedScript = ({ content, onChange, activeLineIndex, payload }) => {
  const editorRef = useRef(null);
  const completionProviderRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && completionProviderRef.current) {
      updateCompletionProvider(payload);
    }
  }, [payload]);

  const debugKeys = (obj) => {
    const keys = Object.keys(obj);
    console.log('Current payload keys:', keys);
    return keys;
  };

  const validatePayload = (rawPayload) => {
    try {
      return typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
    } catch (error) {
      console.error('Error parsing payload:', error);
      return {};
    }
  };

  const createSuggestions = (jsonData, position, wordUntilPosition, monaco, type = 'keys') => {
    if (type === 'functions') {
      const methods = [
        'concat', 'map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every',
        'includes', 'indexOf', 'join', 'slice', 'splice', 'sort', 'reverse',
        'push', 'pop', 'shift', 'unshift', 'toString', 'valueOf', 'length',
        'toLowerCase', 'toUpperCase', 'trim', 'replace', 'split', 'substring'
      ];
  
      return methods.map(method => ({
        label: method,
        kind: monaco.languages.CompletionItemKind.Method,
        insertText: method,
        detail: `Array/String method: ${method}()`,
        documentation: {
          value: `Common ${method} method for arrays and strings`
        },
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column
        }
      }));
    }
  
    let keys = [];
    if (Array.isArray(jsonData)) {
      const keySet = new Set();
      jsonData.forEach(item => {
        if (item && typeof item === 'object') {
          Object.keys(item).forEach(key => keySet.add(key));
        }
      });
      keys = Array.from(keySet);
    } else if (jsonData && typeof jsonData === 'object') {
      keys = Object.keys(jsonData);
    }
    
    console.log('Generated keys:', keys);
  
    return keys.map(key => ({
      label: key,
      kind: monaco.languages.CompletionItemKind.Field,
      insertText: key,
      detail: Array.isArray(jsonData) 
        ? `Array field: ${key}` 
        : `${key}: ${JSON.stringify(jsonData[key])}`,
      documentation: {
        value: Array.isArray(jsonData)
          ? `Field present in array items`
          : `Type: ${typeof jsonData[key]}\nValue: ${JSON.stringify(jsonData[key], null, 2)}`
      },
      range: {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordUntilPosition.startColumn,
        endColumn: wordUntilPosition.endColumn
      }
    }));
  };

  const updateCompletionProvider = (currentPayload) => {
    const editor = editorRef.current;
    const monaco = window.monaco;

    if (!editor || !monaco) return;

    if (completionProviderRef.current) {
      completionProviderRef.current.dispose();
    }

    completionProviderRef.current = monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const wordUntilPosition = model.getWordUntilPosition(position);
        const lineContent = model.getLineContent(position.lineNumber);
        const lastChar = lineContent.charAt(wordUntilPosition.startColumn - 2);
        
        console.log('Line content:', lineContent);
        console.log('Last char:', lastChar);
        console.log('Current payload:', currentPayload);

        try {
          const jsonData = validatePayload(currentPayload);

          // For $ trigger
          if (lineContent.trim() === '$' || lineContent.endsWith('$')) {
            console.log('$ trigger detected');
            const keySuggestions = createSuggestions(jsonData, position, wordUntilPosition, monaco, 'keys');
            const functionSuggestions = createSuggestions(jsonData, position, wordUntilPosition, monaco, 'functions');
            console.log('Key suggestions:', keySuggestions);
            return { 
              suggestions: [...keySuggestions, ...functionSuggestions]
            };
          }

          // For dot after $ trigger
          if (lineContent.includes('$') && lastChar === '.') {
            console.log('Dot after $ detected');
            let currentObj = jsonData;
            const path = lineContent
              .substring(lineContent.indexOf('$') + 1, lineContent.length - 1)
              .trim();

            if (path) {
              const parts = path.split('.');
              for (const part of parts) {
                if (part && currentObj) {
                  currentObj = currentObj[part];
                }
              }
            }

            const keySuggestions = currentObj ? 
              createSuggestions(currentObj, position, wordUntilPosition, monaco, 'keys') : 
              [];
            const functionSuggestions = createSuggestions(null, position, wordUntilPosition, monaco, 'functions');
            
            return { 
              suggestions: [...keySuggestions, ...functionSuggestions]
            };
          }

          // For regular dot trigger
          if (lastChar === '.') {
            return { 
              suggestions: createSuggestions(null, position, wordUntilPosition, monaco, 'functions')
            };
          }

        } catch (error) {
          console.error('Error in suggestion provider:', error);
        }

        return { suggestions: [] };
      },
      triggerCharacters: ['$', '.']
    });
  };
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    window.monaco = monaco;

    // Initial setup of completion provider
    updateCompletionProvider(payload);

    // Theme definition
    monaco.editor.defineTheme('scriptTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008800' },
        { token: 'comment.js', foreground: '008800' },
        { token: 'comment.multi.js', foreground: '008800' },
        { token: 'jsonpath', foreground: '800000', fontStyle: 'bold' },
        { token: 'delimiter', foreground: '000000' },
        { token: 'property', foreground: '001080' },
        { token: 'string', foreground: '0451A5' },
        { token: 'number', foreground: '098658' },
        { token: 'operator', foreground: '000000' },
        { token: 'function', foreground: '795E26' },
        { token: 'variable', foreground: '001080' }
      ],
      colors: {
        'editor.foreground': '#000000',
        'editor.background': '#FFFFFF',
        'editor.lineHighlightBackground': '#F7F7F7',
        'editorCursor.foreground': '#000000',
        'editor.selectionBackground': '#ADD6FF',
        'editorLineNumber.foreground': '#237893',
        'editorLineNumber.activeForeground': '#0B216F',
        'editor.commentForeground': '#008800'
      }
    });

    // Configure the editor
    editor.updateOptions({
      lineNumbers: 'on',
      fontSize: 13,
      fontFamily: 'Manrope, Monaco, Consolas, monospace',
      lineHeight: 24,
      padding: { top: 8, bottom: 8 },
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      renderLineHighlight: 'all',
      roundedSelection: false,
      wordWrap: 'on',
      autoIndent: 'keep',
      formatOnPaste: false,
      formatOnType: false,
      autoClosingBrackets: 'never',
      autoClosingQuotes: 'never',
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        strings: true,
        comments: true
      },
      acceptSuggestionOnCommitCharacter: true,
      suggestSelection: 'first',
      language: 'javascript',
      suggest: {
        showIcons: true,
        showStatusBar: true,
        preview: true,
        previewMode: 'prefix',
        filterGraceful: true,
        snippets: 'inline'
      }
    });

    // Register custom language configuration
    monaco.languages.setLanguageConfiguration('javascript', {
      comments: {
        lineComment: '//',
        blockComment: ['/*', '*/']
      }
    });

    editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();
      onChange(newValue);
    });

    editor.onDidChangeCursorPosition((e) => {
      const lineNumber = e.position.lineNumber - 1;
      if (typeof activeLineIndex === 'number') {
        editor.deltaDecorations([], [
          {
            range: new monaco.Range(lineNumber + 1, 1, lineNumber + 1, 1),
            options: {
              isWholeLine: true,
              className: 'currentLineDecoration'
            }
          }
        ]);
      }
    });
  };

  return (
    <div className="flex-1 relative font-['Manrope']" style={{ overflow: 'hidden' }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        value={content}
        onMount={handleEditorDidMount}
        theme="scriptTheme"
        options={{
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
            verticalSliderSize: 10,
            horizontalSliderSize: 10,
            useShadows: false
          }
        }}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          .currentLineDecoration {
      background-color: #F7F7F7;
    }
    .monaco-editor .margin {
      background-color: #FFFFFF !important;
    }
    .monaco-editor {
      padding-top: 4px;
    }
    .monaco-editor .comment {
      color: #008800 !important;
    }
    .monaco-editor .mtk1.comment,
    .monaco-editor .mtk1.comment.js,
    .monaco-editor .mtk1.comment.multi.js {
      color: #008800 !important;
    }

    /* Updated styles to remove blue line */
    .monaco-editor .overflow-guard {
      border-top: none !important;
    }
    
    .monaco-editor .editor-scrollable {
      border-top: none !important;
    }

    /* Remove any borders from parent elements */
    .monaco-editor,
    .monaco-editor-background,
    .monaco-scrollable-element {
      border: none !important;
    }

    /* Keep canvas visible but remove top border */
    .decorationsOverviewRuler,
    canvas.decorationsOverviewRuler {
      position: absolute !important;
      width: 14px !important;
      height: calc(100% - 8px) !important;
      right: 0px !important;
      top: 8px !important;
      display: block !important;
      visibility: visible !important;
      border-top: none !important;
    }

    /* Target and remove the specific blue line */
    .monaco-editor .overflow-guard > div[style*="background-color"] {
      display: none !important;
    }

    /* Additional specific selectors */
    .monaco-scrollable-element {
      border-top: none !important;
    }

    .editor-container {
      border-top: none !important;
    }

    /* Remove any possible outline or shadow */
    * {
      outline: none !important;
      box-shadow: none !important;
    }

    /* Force remove any absolute positioned elements at the top */
    .monaco-editor > div[style*="position: absolute"][style*="top: 0"] {
      display: none !important;
    }

        `
      }} />
    </div>
  );
};

export default HighlightedScript;