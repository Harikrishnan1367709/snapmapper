
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FormatDropdown } from './FormatDropdown';

export default function UpdatedCode() {
  const resizeTimeoutRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    leftWidth: 300,
    middleWidth: 400,
    rightWidth: 300
  });
  
  const [state, setState] = useState({
    isResizingLeft: false,
    isResizingMiddle: false,
    isInputDialogOpen: false,
    isScriptDialogOpen: false,
    showToast: true,
    scriptFormat: 'javascript',
    actualOutput: '',
  });

  // Debounced resize handler
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      window.cancelAnimationFrame(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = window.requestAnimationFrame(() => {
      const container = document.querySelector('.flex-1.flex');
      if (container) {
        const totalWidth = container.clientWidth;
        setDimensions(prev => {
          const ratio = {
            left: prev.leftWidth / totalWidth,
            middle: prev.middleWidth / totalWidth,
            right: prev.rightWidth / totalWidth
          };
          
          return {
            leftWidth: Math.max(250, Math.floor(totalWidth * ratio.left)),
            middleWidth: Math.max(250, Math.floor(totalWidth * ratio.middle)),
            rightWidth: Math.max(250, Math.floor(totalWidth * ratio.right))
          };
        });
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        window.cancelAnimationFrame(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  const handleFormatChange = useCallback((format) => {
    setState(prev => ({ ...prev, scriptFormat: format }));
  }, []);

  const handleExport = () => {
    alert('Export functionality will be implemented here.');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
      {state.showToast && (
        <div className="bg-[#E9EEF4] text-[#00044C] py-2 text-[12px] relative">
          <div className="text-center px-12 font-bold font-['Manrope'] text-[1rem] tracking-[0.09em]">
            Discover the Future of Integration. Explore SnapLogic Playground Highlights
          </div>
          <button
            onClick={() => setState(prev => ({ ...prev, showToast: false }))}
            className="absolute right-4 top-0 h-full bg-[#E9EEF4] text-[#00044C] border-none outline-none focus:outline-none font-bold text-[18px] flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex-1 flex">
        <div
          style={{
            width: `${dimensions.leftWidth}px`,
            minWidth: '250px',
            borderRight: '1px solid #e5e7eb'
          }}
          className="overflow-y-auto"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 border-t-0">
            <h2 className="text-lg font-semibold">Inputs</h2>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, isInputDialogOpen: true }))}>
              Add Input
            </Button>
          </div>
        </div>

        <div
          style={{
            width: `${dimensions.middleWidth}px`,
            minWidth: '250px',
            borderRight: '1px solid #e5e7eb'
          }}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 border-t-0">
            <h2 className="text-lg font-semibold">Script</h2>
            <div className="flex items-center space-x-4">
              <FormatDropdown onFormatChange={handleFormatChange} />
              <Button variant="outline" onClick={() => setState(prev => ({ ...prev, isScriptDialogOpen: true }))}>
                Add Script
              </Button>
            </div>
          </div>
        </div>

        <div
          style={{
            width: `${dimensions.rightWidth}px`,
            minWidth: '250px'
          }}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 border-t-0">
            <h2 className="text-lg font-semibold">Output</h2>
            <Button variant="outline" onClick={handleExport}>Export</Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Label htmlFor="actualOutput" className="block text-sm font-medium text-gray-700 mb-2">
              Actual Output
            </Label>
            <Editor
              height="30vh"
              width="100%"
              language="json"
              theme="light"
              value={state.actualOutput}
              onChange={(value) => setState(prev => ({ ...prev, actualOutput: value }))}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                wrappingIndent: 'indent',
                automaticLayout: true
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
