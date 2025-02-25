
import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const HighlightedActualOutput = ({ actualOutput = '', onActualOutputChange = () => {} }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.updateOptions({
      readOnly: true,
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
        .error-text {
          color: #FF0000 !important;
        }
      `}</style>
    </div>
  );
};

export default HighlightedActualOutput;
