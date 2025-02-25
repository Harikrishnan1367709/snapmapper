import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const HighLightedJSON = ({ content, onChange, style, format = 'json' }) => {
  const editorRef = useRef(null);
  const initialSetupDone = useRef(false);
  const [isValidFormat, setIsValidFormat] = useState(true);

  // Function to validate XML
  const isValidXML = (text) => {
    if (!text.trim()) return false;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/xml");
      const parseError = doc.getElementsByTagName("parsererror");
      return parseError.length === 0;
    } catch (e) {
      return false;
    }
  };

  // Function to validate JSON
  const isValidJSON = (text) => {
    if (!text.trim()) return false;
    try {
      JSON.parse(text);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Function to validate CSV
  const isValidCSV = (text) => {
    if (!text.trim()) return false;
    // Basic CSV validation - checks if all rows have the same number of columns
    const rows = text.split('\n').filter(row => row.trim());
    if (rows.length === 0) return false;
    const columnCount = rows[0].split(',').length;
    return rows.every(row => row.split(',').length === columnCount);
  };

  // Function to check content format validity
  const validateContent = (content, format) => {
    switch (format.toLowerCase()) {
      case 'xml':
        return isValidXML(content);
      case 'json':
        return isValidJSON(content);
      case 'csv':
        return isValidCSV(content);
      default:
        return true;
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // JSON theme
    monaco.editor.defineTheme('jsonTheme', {
      base: 'vs',
      inherit: false,
      rules: [
        { token: 'string.key.json', foreground: '800000' },
        { token: 'string.value.json', foreground: '0451A5' },
        { token: 'number.json', foreground: '098658' },
        { token: 'keyword.json', foreground: '0000FF' },
        { token: 'delimiter.bracket.json', foreground: '000000' },
        { token: 'delimiter.array.json', foreground: '000000' },
        { token: 'delimiter.comma.json', foreground: '000000' },
        { token: 'delimiter.colon.json', foreground: '000000' }
      ],
      colors: {
        'editor.foreground': '#000000',
        'editor.background': '#FFFFFF',
        'editor.lineHighlightBackground': '#F0F0F0',
        'editorCursor.foreground': '#000000',
        'editor.selectionBackground': '#ADD6FF',
        'editor.inactiveSelectionBackground': '#E5EBF1'
      }
    });

    // XML theme
    monaco.editor.defineTheme('xmlTheme', {
        base: 'vs',
        inherit: true, // Changed to true to inherit basic XML tokenization
        rules: [
          // XML elements
          { token: 'delimiter.xml', foreground: '000000' },
          { token: 'metatag.xml', foreground: '800000' },
          { token: 'tag.xml', foreground: '800000' },
          { token: 'tag', foreground: '800000' },
          
          // XML attributes
          { token: 'attribute.name.xml', foreground: 'ff0000' },
          { token: 'attribute.value.xml', foreground: '0451A5' },
          { token: 'string.xml', foreground: '0451A5' },
          
          // XML content
          { token: 'content.xml', foreground: '000000' },
          
          // XML declarations
          { token: 'meta.tag.preprocessor.xml', foreground: '800000' },
          { token: 'meta.tag.xml', foreground: '800000' },
          
          // Comments
          { token: 'comment.xml', foreground: '008000' },
          { token: 'comment.content.xml', foreground: '008000' },
          
          // CDATA
          { token: 'cdata.xml', foreground: 'ff0000' }
        ],
        colors: {
          'editor.foreground': '#000000',
          'editor.background': '#FFFFFF',
          'editor.lineHighlightBackground': '#F0F0F0',
          'editorCursor.foreground': '#000000',
          'editor.selectionBackground': '#ADD6FF',
          'editor.inactiveSelectionBackground': '#E5EBF1'
        }
      });
      

    // CSV theme
    monaco.editor.defineTheme('csvTheme', {
      base: 'vs',
      inherit: false,
      rules: [
        { token: '', foreground: '000000' }
      ],
      colors: {
        'editor.foreground': '#000000',
        'editor.background': '#FFFFFF',
        'editor.lineHighlightBackground': '#F0F0F0',
        'editorCursor.foreground': '#000000',
        'editor.selectionBackground': '#ADD6FF',
        'editor.inactiveSelectionBackground': '#E5EBF1'
      }
    });

    // Plain theme for invalid content
    monaco.editor.defineTheme('plainTheme', {
      base: 'vs',
      inherit: false,
      rules: [
        { token: '', foreground: '000000' }
      ],
      colors: {
        'editor.foreground': '#000000',
        'editor.background': '#FFFFFF',
        'editor.lineHighlightBackground': '#F0F0F0',
        'editorCursor.foreground': '#000000',
        'editor.selectionBackground': '#ADD6FF',
        'editor.inactiveSelectionBackground': '#E5EBF1'
      }
    });

    // Set initial theme based on format and content validity
    const initialIsValid = validateContent(content, format);
    setIsValidFormat(initialIsValid);
    
    const getTheme = (format, isValid) => {
      if (!isValid) return 'plainTheme';
      switch (format.toLowerCase()) {
        case 'json': return 'jsonTheme';
        case 'xml': return 'xmlTheme';
        case 'csv': return 'csvTheme';
        default: return 'plainTheme';
      }
    };

    monaco.editor.setTheme(getTheme(format, initialIsValid));

    editor.updateOptions({
      renderLineHighlight: 'all',
      highlightActiveIndentGuide: true,
      fontSize: 13,
      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
      lineHeight: 20,
      padding: { top: 4, bottom: 4 },
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: false,
      cursorStyle: 'line',
      automaticLayout: true,
      wordWrap: 'on',
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: false,
      suggestOnTriggerCharacters: false,
      quickSuggestions: false,
      autoClosingBrackets: 'never',
      autoClosingQuotes: 'never',
      autoSurround: 'never',
      renderWhitespace: 'none',
      occurrencesHighlight: false,
      links: false,
      contextmenu: false,
      matchBrackets: 'always',
      renderIndentGuides: true,
      highlightMatchingBrackets: true,
      bracketPairColorization: {
        enabled: true,
        independentColorPoolPerBracketType: true
      },
      guides: {
        bracketPairs: true,
        indentation: true,
        highlightActiveIndentation: true,
        highlightActiveBracketPair: true
      }
    });

    // Handle content changes
    editor.onDidChangeModelContent(() => {
      const newContent = editor.getValue();
      const currentPosition = editor.getPosition();
      const isValid = validateContent(newContent, format);
      setIsValidFormat(isValid);
      
      if (newContent !== content) {
        onChange(newContent);
        
        if (currentPosition) {
          setTimeout(() => {
            editor.setPosition(currentPosition);
            editor.focus();
          }, 0);
        }
      }
    });
  };

  // Update theme when format changes or content validity changes
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const monaco = window.monaco;
      if (monaco) {
        // Update language model
        monaco.editor.setModelLanguage(editor.getModel(), format.toLowerCase());
        
        // Update theme
        const getTheme = (format, isValid) => {
          if (!isValid) return 'plainTheme';
          switch (format.toLowerCase()) {
            case 'json': return 'jsonTheme';
            case 'xml': return 'xmlTheme';
            case 'csv': return 'csvTheme';
            default: return 'plainTheme';
          }
        };
        
        monaco.editor.setTheme(getTheme(format, isValidFormat));
      }
    }
  }, [format, isValidFormat]);

  return (
    <div className="flex-1 border rounded-sm" style={{ ...style, overflow: 'hidden' }}>
      <Editor
        height="100%"
        defaultLanguage={format.toLowerCase()}
        language={format.toLowerCase()}
        value={content}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
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
    </div>
  );
};

export default HighLightedJSON;