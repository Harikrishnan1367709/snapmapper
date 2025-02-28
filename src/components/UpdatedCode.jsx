
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FormatDropdown } from './FormatDropdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Coffee, Beer } from "lucide-react";

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
    importDialogOpen: false,
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

  const openImportDialog = () => {
    setState(prev => ({ ...prev, importDialogOpen: true }));
  };

  const closeImportDialog = () => {
    setState(prev => ({ ...prev, importDialogOpen: false }));
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
            onClick={openImportDialog}
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

      <div className="flex-1 flex">
        {/* Left Panel */}
        <div
          style={{
            width: `${dimensions.leftWidth}px`,
            minWidth: '250px',
            borderRight: '1px solid #e5e7eb'
          }}
          className="overflow-y-auto bg-white"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Inputs</h2>
            <Button 
              variant="outline" 
              onClick={handleInputDialogOpen}
              className="bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-sm h-8 px-3 py-1 text-xs"
            >
              Add
            </Button>
          </div>
          
          {/* Input items would go here */}
          <div className="p-2 bg-gradient-to-b from-white to-blue-50/10">
            <div className="p-2 hover:bg-blue-50/40 cursor-pointer rounded-sm transition-colors duration-150 border border-transparent hover:border-blue-100">
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
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Script</h2>
            <div className="flex items-center space-x-4">
              <FormatDropdown onFormatChange={handleFormatChange} />
              <Button 
                variant="outline" 
                onClick={handleScriptDialogOpen}
                className="bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-sm h-8 px-3 py-1 text-xs"
              >
                Add
              </Button>
            </div>
          </div>
          
          {/* Script content area */}
          <div className="flex-1 p-4 bg-gradient-to-b from-white to-blue-50/10">
            <div className="bg-white border border-gray-200 rounded-sm h-full shadow-sm hover:shadow-md transition-shadow duration-300">
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
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Output</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-blue-50/10">
            <Label htmlFor="actualOutput" className="block text-sm font-medium text-gray-700 mb-2">
              Actual Output
            </Label>
            <div className="rounded-sm border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
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
              <div className="rounded-sm border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
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
      
      {/* Footer - Updated with Made with coffee & beer in Tamil Nadu and image instead of text */}
      <div className="border-t border-gray-200 py-3 px-6 text-sm text-gray-700 bg-white shadow-sm">
        <div className="flex justify-center items-center">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Made with</span>
            <Coffee className="h-5 w-5 text-gray-800 animate-pulse" />
            <span>&</span>
            <Beer className="h-5 w-5 text-amber-500 animate-bounce" />
            <span className="text-gray-700">in Tamil Nadu, India</span>
            <span className="mx-1 text-gray-500">|</span>
            <span className="text-gray-700">Powered by</span>
            <a href="https://www.mulecraft.in/" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-medium hover:text-blue-700 transition-colors">
              Mulecraft
            </a>
          </div>
        </div>
        <div className="text-center mt-1">
          <img 
            src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7" 
            alt="SnapLogic Playground – Redefining Integration" 
            className="h-6 mx-auto"
          />
        </div>
      </div>

      {/* Import Project Dialog */}
      <Dialog open={state.importDialogOpen} onOpenChange={closeImportDialog}>
        <DialogContent className="sm:max-w-md bg-white p-0 rounded-md overflow-hidden shadow-xl">
          <DialogHeader className="px-6 pt-6 pb-3 bg-gradient-to-r from-white to-blue-50/30">
            <DialogTitle className="text-xl font-bold text-gray-800">Import project</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            <div className="border-2 border-dashed border-gray-300 rounded-md p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors duration-200 hover:bg-blue-50/20">
              <div className="mb-2 text-blue-500">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-600 mb-1">
                Drop project zip here or click to upload
              </div>
              <div className="text-xs text-gray-500">
                Supported format: .zip
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-red-500">
              Upload functionality is only intended for playground exported projects
            </div>
            <div className="mt-1 text-center text-sm text-gray-500">
              Importing modified files may yield an invalid project.
            </div>
          </div>
          <DialogFooter className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-t border-gray-200">
            <Button variant="outline" onClick={closeImportDialog} className="rounded hover:bg-blue-50 hover:border-blue-400 transition-all duration-200">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
