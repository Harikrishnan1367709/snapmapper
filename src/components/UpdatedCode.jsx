import React, { useState, useCallback } from 'react';
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FormatDropdown } from './FormatDropdown';

export default function UpdatedCode() {
  const [state, setState] = useState({
    leftWidth: 300,
    middleWidth: 400,
    rightWidth: 300,
    isResizingLeft: false,
    isResizingMiddle: false,
    isInputDialogOpen: false,
    isScriptDialogOpen: false,
    showToast: true,
    scriptFormat: 'javascript',
    actualOutput: '',
  });

  const handleFormatChange = useCallback((format) => {
    setState(prev => ({ ...prev, scriptFormat: format }));
  }, []);

  const handleExport = () => {
    // Placeholder for export functionality
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
            width: `${state.leftWidth}px`,
            minWidth: '250px',
            borderRight: '1px solid #e5e7eb'
          }}
          className="overflow-y-auto"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Inputs</h2>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, isInputDialogOpen: true }))}>
              Add Input
            </Button>
          </div>
        </div>

        <div
          style={{
            width: `${state.middleWidth}px`,
            minWidth: '250px',
            borderRight: '1px solid #e5e7eb'
          }}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
            width: `${state.rightWidth}px`,
            minWidth: '250px'
          }}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
                wrappingIndent: 'indent'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
