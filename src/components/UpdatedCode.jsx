import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FormatDropdown } from './FormatDropdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Coffee, Beer, UploadCloud, DownloadCloud, PlusCircle, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function UpdatedCode() {
  const navigate = useNavigate();
  const resizeTimeoutRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    leftWidth: 280,
    middleWidth: 450,
    rightWidth: 300
  });
  
  const [state, setState] = useState({
    isResizingLeft: false,
    isResizingMiddle: false,
    isInputDialogOpen: false,
    isScriptDialogOpen: false,
    showToast: true,
    scriptFormat: 'javascript',
    actualOutput: '"Hello world!"',
    importDialogOpen: false,
    activePage: 'playground',
  });

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

  const handleNavigation = (page, e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (page === 'docs') {
      navigate('/docs');
      setState(prev => ({ ...prev, activePage: 'docs' }));
    } else {
      setState(prev => ({ ...prev, activePage: page }));
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-['Manrope']">
      <div className="fixed inset-0 z-[-1] bg-white" />
      
      {state.showToast && (
        <div className="bg-dataweave-blue text-white py-2 relative">
          <div className="text-center px-12 font-semibold tracking-wide">
            EXPERIENCE INNOVATION, UNLEASHED. WATCH THE HIGHLIGHTS FROM CONNECT '22
          </div>
          <button
            onClick={() => setState(prev => ({ ...prev, showToast: false }))}
            className="absolute right-4 top-0 h-full flex items-center text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/d11a9e99-9c20-4aed-9025-1973db87d692.png" 
            alt="DataWeave Logo" 
            className="h-8" 
            style={{ marginTop: '3px', marginLeft: '5px' }}
          />
          <span className="text-lg font-semibold text-gray-800">DataWeave</span>
        </div>
        
        <div className="flex items-center space-x-10">
          <button 
            onClick={(e) => handleNavigation('blogs', e)}
            className={`dataweave-nav ${state.activePage === 'blogs' ? 'dataweave-nav-active' : ''}`}
          >
            BLOGS
          </button>
          <button 
            onClick={(e) => handleNavigation('docs', e)}
            className={`dataweave-nav ${state.activePage === 'docs' ? 'dataweave-nav-active' : ''}`}
          >
            DOCS
          </button>
          <button 
            onClick={(e) => handleNavigation('tutorial', e)}
            className={`dataweave-nav ${state.activePage === 'tutorial' ? 'dataweave-nav-active' : ''}`}
          >
            TUTORIAL
          </button>
          <button 
            onClick={(e) => handleNavigation('playground', e)}
            className={`dataweave-nav ${state.activePage === 'playground' ? 'dataweave-nav-active' : ''}`}
          >
            PLAYGROUND
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 h-9 flex items-center justify-center"
          >
            <span className="mr-2">Export</span>
            <DownloadCloud className="h-4 w-4 text-dataweave-blue" />
          </Button>
          <Button 
            variant="outline" 
            onClick={openImportDialog}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 h-9 flex items-center justify-center"
          >
            <span className="mr-2">Import</span>
            <UploadCloud className="h-4 w-4 text-dataweave-blue" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex m-0 overflow-hidden">
        {/* Left Panel */}
        <div
          style={{
            width: `${dimensions.leftWidth}px`,
            minWidth: '250px'
          }}
          className="dataweave-panel overflow-y-auto"
        >
          <div className="dataweave-panel-header">
            <h2>INPUT EXPLORER</h2>
            <Button 
              variant="ghost" 
              onClick={handleInputDialogOpen}
              className="h-6 w-6 p-0 rounded-full"
            >
              <PlusCircle className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
          
          <div className="p-0">
            <div className="dataweave-item border-l-2 border-dataweave-blue pl-2">
              <div className="text-xs font-bold text-dataweave-blue mr-2">JSON</div>
              <span className="text-gray-700">payload</span>
            </div>
          </div>
          
          {state.isInputDialogOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
              <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Input</h2>
                <div className="mb-4">
                  <Label htmlFor="inputName" className="block text-sm font-medium text-gray-700 mb-1">Input Name</Label>
                  <input
                    id="inputName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-dataweave-blue focus:border-transparent"
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
                    className="bg-dataweave-blue hover:bg-opacity-90 text-white"
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
            minWidth: '250px'
          }}
          className="dataweave-panel flex flex-col"
        >
          <div className="dataweave-panel-header">
            <h2>SCRIPT</h2>
            <div className="flex items-center space-x-4">
              <FormatDropdown onFormatChange={handleFormatChange} />
              <Button 
                variant="ghost" 
                onClick={handleScriptDialogOpen}
                className="h-6 w-6 p-0 rounded-full"
              >
                <PlusCircle className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <Editor
              height="100%"
              language="javascript"
              theme="light"
              value={`%dw 2.0
output application/json
---
payload.message`}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontFamily: "'Manrope', 'Monaco', monospace",
                fontSize: 13,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible'
                }
              }}
              className="dataweave-editor"
            />
          </div>
          
          {state.isScriptDialogOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
              <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Script</h2>
                <div className="mb-4">
                  <Label htmlFor="scriptName" className="block text-sm font-medium text-gray-700 mb-1">Script Name</Label>
                  <input
                    id="scriptName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-dataweave-blue focus:border-transparent"
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
                    className="bg-dataweave-blue hover:bg-opacity-90 text-white"
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
          className="flex flex-col bg-white border-l border-gray-200 h-full"
        >
          <div className="dataweave-panel-header">
            <h2>OUTPUT</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="h-full">
              <Editor
                height="100%"
                language="json"
                theme="light"
                value={state.actualOutput}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  wrappingIndent: 'indent',
                  automaticLayout: true,
                  fontSize: 13,
                  fontFamily: "'Manrope', 'Monaco', monospace",
                  readOnly: true,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible'
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 py-2 px-6 text-xs text-gray-600 bg-white text-center">
        ©2023 MuleSoft LLC, a Salesforce company
      </div>

      {/* Import Project Dialog */}
      <Dialog open={state.importDialogOpen} onOpenChange={closeImportDialog}>
        <DialogContent className="sm:max-w-md w-full bg-white p-0 rounded-sm overflow-hidden border border-gray-300 shadow-xl">
          <DialogHeader className="px-6 pt-6 pb-2 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-800">Import project</DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            <div className="border-2 border-dashed border-gray-300 rounded-sm p-10 flex flex-col items-center justify-center text-center hover:border-gray-400 transition-colors duration-200 cursor-pointer">
              <div className="mb-4 text-dataweave-blue">
                <UploadCloud className="mx-auto h-14 w-14 opacity-80" />
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
              className="px-5 py-2 text-sm rounded-sm bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
