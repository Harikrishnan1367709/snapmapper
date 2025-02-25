
import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const HighlightedScript = ({ content, onChange, activeLineIndex }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure Monaco editor
    editor.updateOptions({
      readOnly: false,
      lineNumbers: 'on',
      fontSize: 13,
      fontFamily: 'Manrope, Monaco, Consolas, monospace',
      lineHeight: 24,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'none',
      automaticLayout: false // Disable automatic layout
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
    <div className="h-full w-full relative">
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="javascript"
        value={content}
        onChange={onChange}
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
        }}
      />
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

export default HighlightedScript;
