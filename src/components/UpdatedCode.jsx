
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
  
  const handleInputDialogOpen = () => {
    setState(prev => ({ ...prev, isInputDialogOpen: true }));
  };
  
  const handleInputDialogClose = () => {
    setState(prev => ({ ...prev, isInputDialogOpen: false }));
  };
  
  const handleScriptDialogOpen = () => {
    setState(prev => ({ ...prev, isScriptDialogOpen: true }));
  };
  
  const handleScriptDialogClose = () => {
    setState(prev => ({ ...prev, isScriptDialogOpen: false }));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden font-['Manrope']">
      {state.showToast && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 relative">
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

      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <img src="/sl-logo.svg" alt="SnapLogic Logo" className="h-8 w-8" />
          <span className="text-lg font-semibold text-gray-800">SnapLogic Playground</span>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700 transition-all duration-200 rounded shadow-sm px-4 py-2 h-9 flex items-center justify-center"
          >
            <span className="mr-2">Export</span>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V16M12 16L7 11M12 16L17 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 20H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleInputDialogOpen}
            className="bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700 transition-all duration-200 rounded shadow-sm px-4 py-2 h-9 flex items-center justify-center"
          >
            <span className="mr-2">Import</span>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 20V8M12 8L7 13M12 8L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 4H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex shadow-sm">
        {/* Left Panel */}
        <div
          style={{
            width: `${dimensions.leftWidth}px`,
            minWidth: '250px',
            borderRight: '1px solid #e5e7eb'
          }}
          className="overflow-y-auto bg-white"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Inputs</h2>
            <Button 
              variant="outline" 
              onClick={handleInputDialogOpen}
              className="bg-white border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-sm h-8 px-3 py-1 text-xs"
            >
              Add
            </Button>
          </div>
          
          {/* Input items would go here */}
          <div className="p-2">
            <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-sm transition-colors duration-150">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">input.json</span>
              </div>
            </div>
          </div>
          
          {/* Input dialog would appear here */}
          {state.isInputDialogOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
              <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full mx-4 transform transition-all duration-200 opacity-100 scale-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Input</h2>
                <div className="mb-4">
                  <Label htmlFor="inputName" className="block text-sm font-medium text-gray-700 mb-1">Input Name</Label>
                  <input
                    id="inputName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter input name"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleInputDialogClose}
                    className="border-gray-300 hover:bg-gray-100 text-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInputDialogClose}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Panel */}
        <div
          style={{
            width: `${dimensions.middleWidth}px`,
            minWidth: '250px',
            borderRight: '1px solid #e5e7eb'
          }}
          className="flex flex-col bg-white"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Script</h2>
            <div className="flex items-center space-x-4">
              <FormatDropdown onFormatChange={handleFormatChange} />
              <Button 
                variant="outline" 
                onClick={handleScriptDialogOpen}
                className="bg-white border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-sm h-8 px-3 py-1 text-xs"
              >
                Add
              </Button>
            </div>
          </div>
          
          {/* Script content area */}
          <div className="flex-1 p-4">
            <div className="bg-white border border-gray-200 rounded-sm h-full shadow-sm hover:shadow transition-shadow duration-300">
              <Editor
                height="100%"
                language={state.scriptFormat}
                theme="light"
                value=""
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontFamily: "'Manrope', 'Monaco', monospace",
                  fontSize: 13,
                  padding: { top: 12, bottom: 12 }
                }}
              />
            </div>
          </div>
          
          {/* Script dialog would appear here */}
          {state.isScriptDialogOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
              <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full mx-4 transform transition-all duration-200 opacity-100 scale-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Script</h2>
                <div className="mb-4">
                  <Label htmlFor="scriptName" className="block text-sm font-medium text-gray-700 mb-1">Script Name</Label>
                  <input
                    id="scriptName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter script name"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleScriptDialogClose}
                    className="border-gray-300 hover:bg-gray-100 text-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleScriptDialogClose}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div
          style={{
            width: `${dimensions.rightWidth}px`,
            minWidth: '250px'
          }}
          className="flex flex-col bg-white"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Output</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <Label htmlFor="actualOutput" className="block text-sm font-medium text-gray-700 mb-2">
              Actual Output
            </Label>
            <div className="rounded-sm border border-gray-200 shadow-sm transition-shadow duration-300">
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
            
            <div className="mt-6">
              <Label htmlFor="expectedOutput" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Output
              </Label>
              <div className="rounded-sm border border-gray-200 shadow-sm transition-shadow duration-300">
                <Editor
                  height="20vh"
                  width="100%"
                  language="json"
                  theme="light"
                  value=""
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
      
      {/* Footer */}
      <div className="border-t border-gray-200 py-2 px-4 text-xs text-gray-500 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>SnapLogic Playground – v1.0.0</div>
          <div className="flex items-center space-x-4">
            <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
              Documentation
            </button>
            <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
              Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
