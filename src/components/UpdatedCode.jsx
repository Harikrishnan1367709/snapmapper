
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { ChevronDown, Upload, Download, Terminal, Book, ChevronLeft } from "lucide-react";
import { v4 } from "uuid";
import JSZip from 'jszip';
import Editor from '@monaco-editor/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from './ui/button';
import FormatDropdown from './FormatDropdown';
import { handleJSON } from '../utils/jsonHandler';
import _ from 'lodash';
import moment from 'moment';
import * as R from 'ramda';
import SnapLogicFunctionsHandler from '../utils/SnaplogicFunctionsHandler';
import HighLightedJSON from '../utils/HighLightedJson';
import HighlightedScript from '../utils/HighlightedScript';
import HighlightedActualOutput from '../utils/HighlightedActualOutput';
import HighlightedExpectedOutput from '../utils/HighlightedExpectedOutput';

export default function UpdatedCode() {
  const initialState = {
    format: 'json',
    activeLineIndex: null,
    activeInput: 'Payload',
    cursorPosition: 0,
    focusedLine: null,
    wasChecked: localStorage.getItem('wasChecked') === 'true',
    selectedFile: null,
    hoveredLine: null,
    highlightedLine: null,
    showInputContainer: false,
    showScriptContainer: false,
    inputs: ['Payload'],
    inputContents: { Payload: '{}' },
    isPayloadView: false,
    selectedInputIndex: null,
    payloadContent: '{\n\n}',
    outputMatch: true,
    activeNavItem: 'playground',
    currentView: 'playground',
    showImportDialog: false,
    isChecked: false,
    showExportDialog: false,
    leftWidth: parseInt(localStorage.getItem('leftWidth')) || 288,
    middleWidth: parseInt(localStorage.getItem('middleWidth')) || 500,
    rightWidth: parseInt(localStorage.getItem('rightWidth')) || 384,
    bottomHeight: 32,
    isBottomExpanded: false,
    activeTab: null,
    showToast: true,
    isDragging: false,
    isInputDialogOpen: false,
    isScriptDialogOpen: false,
    newInput: "",
    expectedOutput: '',
    actualOutput: '[\n  "Phone"\n]',
    scripts: [{
      id: 1,
      name: 'main.dwl',
      content: '$',
      lastModified: new Date()
    }],
    activeScript: null,
    scriptContent: '',
    newScript: ""
  };

  const [state, setState] = useState(initialState);
  const canvasRef = useRef(null);

  const handleFormatChange = (newFormat) => {
    setState(prev => ({ ...prev, format: newFormat }));
  };

  const handleMouseDown = (e, isLeft, isBottom) => {
    setState(prev => ({ ...prev, isDragging: true }));
    
    if (isBottom) {
      const startY = e.clientY;
      const startHeight = state.bottomHeight;

      const handleMouseMove = (e) => {
        const deltaY = startY - e.clientY;
        const newHeight = Math.max(32, Math.min(800, startHeight + deltaY));
        setState(prev => ({ ...prev, bottomHeight: newHeight }));
      };

      const handleMouseUp = () => {
        setState(prev => ({ ...prev, isDragging: false }));
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return;
    }

    const startX = e.clientX;
    const startLeftWidth = state.leftWidth;
    const startRightWidth = state.rightWidth;

    const handleMouseMove = (e) => {
      if (isLeft) {
        const newWidth = Math.max(200, Math.min(600, startLeftWidth + (e.clientX - startX)));
        setState(prev => ({ ...prev, leftWidth: newWidth }));
      } else {
        const newWidth = Math.max(200, Math.min(600, startRightWidth - (e.clientX - startX)));
        setState(prev => ({ ...prev, rightWidth: newWidth }));
      }
    };

    const handleMouseUp = () => {
      setState(prev => ({ ...prev, isDragging: false }));
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    localStorage.setItem('leftWidth', state.leftWidth);
    localStorage.setItem('middleWidth', state.middleWidth);
    localStorage.setItem('rightWidth', state.rightWidth);
  }, [state.leftWidth, state.middleWidth, state.rightWidth]);

  const handleExport = async () => {
    try {
      const zip = new JSZip();
      const scriptsFolder = zip.folder("scripts");
      state.scripts.forEach(script => {
        scriptsFolder.file(script.name, script.content);
      });
      const inputsFolder = zip.folder("inputs");
      Object.entries(state.inputContents).forEach(([name, content]) => {
        inputsFolder.file(`${name}.json`, content);
      });
      const metadata = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        scripts: state.scripts.map(s => ({
          name: s.name,
          lastModified: s.lastModified
        })),
        inputs: state.inputs,
        expectedOutput: state.expectedOutput
      };
      zip.file("metadata.json", JSON.stringify(metadata, null, 2));
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 9 }
      });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `snaplogic-playground-export-${moment().format('YYYY-MM-DD-HH-mm')}.zip`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    }
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
          <div className="flex items-center justify-between p-4 border-b">
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
          <div className="flex items-center justify-between p-4 border-b">
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
          <div className="flex items-center justify-between p-4 border-b">
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
