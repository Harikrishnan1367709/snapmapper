import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import PropTypes from 'prop-types';

const HighlightedActualOutput = ({ 
  actualOutput = '', 
  onActualOutputChange = () => {} 
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const isError = (output) => {
    try {
      if (typeof output === 'string') {
        const parsed = JSON.parse(output);
        return parsed && parsed.error;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const editor = editorRef.current;
      const monaco = monacoRef.current;

      if (isError(actualOutput)) {
        // Add red color decoration to the entire content
        const model = editor.getModel();
        const decorations = [{
          range: new monaco.Range(
            1,
            1,
            model.getLineCount(),
            model.getLineMaxColumn(model.getLineCount())
          ),
          options: {
            inlineClassName: 'error-text'
          }
        }];
        editor.deltaDecorations([], decorations);
      } else {
        // Clear decorations if not an error
        editor.deltaDecorations([], []);
      }
    }
  }, [actualOutput]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.updateOptions({
        readOnly: true,
        lineNumbers: 'on',
        fontSize: 13,
        fontFamily: 'Manrope, Monaco, Consolas, monospace',
        lineHeight: 24,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        renderLineHighlight: 'none'
  
    });
  };

  return (
    <div className="h-full w-full">
      <div className="h-full w-full relative">
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="json"
          value={actualOutput}
          onChange={onActualOutputChange}
          onMount={handleEditorDidMount}
          options={{
            scrollbar: {
                vertical: 'visible',
                horizontal: 'hidden',
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                verticalSliderSize: 8,
                horizontalSliderSize: 2,
                useShadows: false
              },
              automaticLayout: true // Enable automatic resizing
    
          }}
        />
      </div>
      <style>{`
        .monaco-editor {
          padding-top: 4px;
        }
        .monaco-editor .margin {
          background-color: #FFFFFF !important;
        }
        
        .error-text {
          color: #FF0000 !important;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

HighlightedActualOutput.propTypes = {
  actualOutput: PropTypes.string,
  onActualOutputChange: PropTypes.func
};

export default HighlightedActualOutput;