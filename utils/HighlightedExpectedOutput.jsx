
import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const HighlightedExpectedOutput = ({ expectedOutput = '', onExpectedOutputChange = () => {} }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme('outputTheme', {
      base: 'vs',
      inherit: false,
      rules: [
        { token: 'error', foreground: 'FF0000' },
        { token: 'string', foreground: '0451A5' },
        { token: 'number', foreground: '098658' },
        { token: 'keyword', foreground: '0000FF' },
        { token: 'delimiter', foreground: '000000' }
      ],
      colors: {
        'editor.foreground': '#000000',
        'editor.background': '#FFFFFF',
        'editor.lineHighlightBackground': '#FFFFFF'
      }
    });

    editor.updateOptions({
      readOnly: false,
      lineNumbers: 'on',
      fontSize: 13,
      fontFamily: 'Manrope, Monaco, Consolas, monospace',
      lineHeight: 24,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'none',
      automaticLayout: false
    });

    // Manual resize handling
    const resizeEditor = () => {
      const container = editor.getContainerDomNode();
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        editor.layout({ width, height });
      }
    };

    // Add resize observer with debounce
    let resizeTimeout;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimeout) {
        window.cancelAnimationFrame(resizeTimeout);
      }
      resizeTimeout = window.requestAnimationFrame(resizeEditor);
    });

    const container = editor.getContainerDomNode();
    if (container) {
      resizeObserver.observe(container);
    }

    // Cleanup
    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
      resizeObserver.disconnect();
    };
  };

  return (
    <div className="h-full w-full">
      <div className="h-full w-full relative">
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="json"
          value={expectedOutput}
          onChange={onExpectedOutputChange}
          onMount={handleEditorDidMount}
          theme="outputTheme"
          options={{
            scrollbar: {
              vertical: 'visible',
              horizontal: 'hidden',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              verticalSliderSize: 8,
              horizontalSliderSize: 2,
              useShadows: false
            }
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
        .monaco-editor .line-numbers {
          color: #237893 !important;
        }
      `}</style>
    </div>
  );
};

export default HighlightedExpectedOutput;
