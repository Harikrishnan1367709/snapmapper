
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
      
      {/* Footer - Updated with new design and custom icons */}
      <div className="border-t border-gray-200 py-3 px-6 text-sm text-gray-700 bg-white shadow-sm relative">
        <div className="flex justify-center items-center">
          <img 
            src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7" 
            alt="SnapLogic Playground – Redefining Integration" 
            className="h-6 mx-auto"
          />
        </div>
        
        <div className="font-['Manrope'] text-[0.69rem] text-gray-300 absolute left-[calc(45%+0px)] tracking-[0.04em] flex items-center h-full z-10 gap-2.5 font-medium">
          <span className="text-gray-500">Made with</span>
          <div className="inline-flex items-center gap-2.5">
            {/* Tea Icon */}
            <div className="relative w-[18px] h-[18px] animate-pulse transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 19h18v2H2v-2zm2-8v5c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2zm15 0v5H5v-5h14zm-6.75-7L15 8H9l2.75-4z" fill="#374151"/>
                <path d="M19 10h2c0-2.21-1.79-4-4-4h-2l2 4z" fill="#374151"/>
              </svg>
            </div>
            <span className="text-gray-500 font-semibold">&</span>
            {/* Beer Icon */}
            <div className="relative w-[18px] h-[18px] animate-bounce transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3h10v2h-10z" fill="#D97706"/>
                <path d="M18 8c-0.4-2.3-2.4-4-4.8-4h-2.4c-2.4 0-4.4 1.7-4.8 4h-1v12h14v-12h-1zM8 18v-8h8v8h-8z" fill="#D97706"/>
                <path d="M10 11h4v3h-4z" fill="#ffffff"/>
              </svg>
            </div>
          </div>
          <span className="text-gray-500">in</span>
          <span className="text-gray-500 font-semibold hover:text-blue-800 cursor-pointer transition-colors">
            Tamil Nadu, India
          </span>
          <span className="mx-2.5 text-gray-400">|</span>
          <span className="text-gray-500">Powered by</span>
          <a 
            href="https://www.mulecraft.in/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 font-semibold hover:text-blue-800 transition-colors relative group"
          >
            Mulecraft
          </a>
        </div>
        
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .animate-bounce {
            animation: bounce 1s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-25%); }
          }
        `}</style>
      </div>

      {/* Import Project Dialog - Completely redesigned */}
      <Dialog open={state.importDialogOpen} onOpenChange={closeImportDialog}>
        <DialogContent className="sm:max-w-md w-full max-h-[90vh] bg-white p-0 rounded-none overflow-hidden border border-gray-300 shadow-xl">
          <DialogHeader className="px-6 pt-6 pb-2 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-800">Import project</DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-none p-10 flex flex-col items-center justify-center text-center hover:border-gray-400 transition-colors duration-200 cursor-pointer">
              <div className="mb-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-base font-medium text-gray-600 mb-1">
                Drop project zip here or click to upload
              </p>
              <p className="text-sm text-gray-500">
                Supported format: .zip
              </p>
            </div>
            
            <div className="mt-6">
              <p className="text-center text-sm text-red-500 mb-1">
                Upload functionality is only intended for playground exported projects
              </p>
              <p className="text-center text-sm text-gray-500">
                Importing modified files may yield an invalid project.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
            <Button 
              variant="outline" 
              onClick={closeImportDialog} 
              className="px-5 py-2 text-sm rounded-none bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
