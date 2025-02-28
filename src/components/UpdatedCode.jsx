
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
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden font-['Manrope']">
      {state.showToast && (
        <div className="bg-gradient-to-r from-indigo-500/90 to-purple-500/90 text-white py-2 relative transition-all duration-300">
          <div className="text-center px-12 font-bold font-['Manrope'] text-[1rem] tracking-[0.09em]">
            Discover the Future of Integration. Explore SnapLogic Playground Highlights
          </div>
          <button
            onClick={() => setState(prev => ({ ...prev, showToast: false }))}
            className="absolute right-4 top-0 h-full bg-transparent text-white border-none outline-none focus:outline-none font-bold text-[18px] flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex-1 flex shadow-sm">
        <div
          style={{
            width: `${dimensions.leftWidth}px`,
            minWidth: '250px',
            borderRight: '1px solid #e5e7eb'
          }}
          className="overflow-y-auto bg-gradient-to-b from-white to-gray-50/30"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 border-t-0 bg-white">
            <h2 className="text-lg font-semibold text-gray-700">Inputs</h2>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, isInputDialogOpen: true }))}
              className="bg-white border-gray-300 hover:bg-gray-100 hover:border-blue-400 text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-sm"
            >
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
          className="flex flex-col bg-gradient-to-b from-white to-gray-50/30"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 border-t-0 bg-white">
            <h2 className="text-lg font-semibold text-gray-700">Script</h2>
            <div className="flex items-center space-x-4">
              <FormatDropdown onFormatChange={handleFormatChange} />
              <Button 
                variant="outline" 
                onClick={() => setState(prev => ({ ...prev, isScriptDialogOpen: true }))}
                className="bg-white border-gray-300 hover:bg-gray-100 hover:border-blue-400 text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-sm"
              >
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
          className="flex flex-col bg-gradient-to-b from-white to-gray-50/30"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 border-t-0 bg-white">
            <h2 className="text-lg font-semibold text-gray-700">Output</h2>
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="bg-white border-gray-300 hover:bg-gray-100 hover:border-blue-400 text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-sm"
            >
              Export
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Label htmlFor="actualOutput" className="block text-sm font-medium text-gray-700 mb-2">
              Actual Output
            </Label>
            <div className="rounded-sm border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                  automaticLayout: true,
                  fontSize: 13,
                  fontFamily: "'Manrope', 'Monaco', monospace",
                  padding: { top: 12, bottom: 12 }
                }}
                className="font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
