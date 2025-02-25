<lov-code>
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

function UpdatedCode() {
  const [format, setFormat] = useState('json');
  const canvasRef = useRef(null);
  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [activeInput, setActiveInput] = useState('Payload');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [focusedLine, setFocusedLine] = useState(null);
  const [wasChecked, setWasChecked] = useState(() =>
    localStorage.getItem('wasChecked') === 'true'
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [showInputContainer, setShowInputContainer] = useState(false);
  const [showScriptContainer, setShowScriptContainer] = useState(false);
  const [inputs, setInputs] = useState(['Payload']);
  const [inputContents, setInputContents] = useState({
    [inputs[0]]: '{}'
  });
  const [isPayloadView, setIsPayloadView] = useState(false);
  const [selectedInputIndex, setSelectedInputIndex] = useState(null);
  const [payloadContent, setPayloadContent] = useState('{\n\n}');
  const [outputMatch, setOutputMatch] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('playground');
  const [currentView, setCurrentView] = useState('playground');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [leftWidth, setLeftWidth] = useState(() =>
    parseInt(localStorage.getItem('leftWidth')) || 288
  );
  const [middleWidth, setMiddleWidth] = useState(() =>
    parseInt(localStorage.getItem('middleWidth')) || 500
  );
  const [rightWidth, setRightWidth] = useState(() =>
    parseInt(localStorage.getItem('rightWidth')) || 384
  );
  const [bottomHeight, setBottomHeight] = useState(32);
  const [isBottomExpanded, setIsBottomExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [showToast, setShowToast] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isInputDialogOpen, setIsInputDialogOpen] = useState(false);
  const [isScriptDialogOpen, setIsScriptDialogOpen] = useState(false);
  const [newInput, setNewInput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState('');
  const [actualOutput, setActualOutput] = useState('[\n  "Phone"\n]');
  const [scripts, setScripts] = useState([
    {
      id: 1,
      name: 'main.dwl',
      content: '$',
      lastModified: new Date()
    }
  ]);
  const [activeScript, setActiveScript] = useState(null);
  const [scriptContent, setScriptContent] = useState('');
  const [newScript, setNewScript] = useState("");

  const data = {
    "myarray": [3, 6, 8, 2, 9, 4],
    "head": [1, 2],
    "middle": [3, 4],
    "tail": [5, 6],
    "names": ["Fred", "Wilma", "Fred", "Betty", "Fred", "Barney"],
    "Array": [0, 2, 4, 6, 8]
  };

  useEffect(() => {
    localStorage.setItem('leftWidth', leftWidth);
    localStorage.setItem('middleWidth', middleWidth);
    localStorage.setItem('rightWidth', rightWidth);
  }, [leftWidth, middleWidth, rightWidth]);

  const resizableStyles = (width, panelType) => ({
    width: `${width}px`,
    minWidth: '250px',
    position: 'relative',
    cursor: panelType === 'middle' ? 'text' : 'pointer',
    userSelect: 'none'
  });
  const ResizeHandle = () => (
    <div
      style={{
        position: 'absolute',
        right: -3,
        top: 0,
        bottom: 0,
        width: 6,
        cursor: 'default',
        zIndex: 10
      }}
    />
  );

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = 'text';
    }
  }, [isDragging]);

  const handleMouseDown = (e, isLeft, isBottom) => {
    setIsDragging(true);
   
    if (isBottom) {
      const startY = e.clientY;
      const startHeight = bottomHeight;

      const handleMouseMove = (e) => {
        const deltaY = startY - e.clientY;
        const newHeight = startHeight + deltaY;
        setBottomHeight(Math.max(32, Math.min(800, newHeight)));
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return;
    }
    const startX = e.clientX;
    const startLeftWidth = leftWidth;
    const startRightWidth = rightWidth;

    const handleMouseMove = (e) => {
      if (isLeft) {
        const newWidth = startLeftWidth + (e.clientX - startX);
        setLeftWidth(Math.max(200, Math.min(600, newWidth)));
      } else {
        const newWidth = startRightWidth - (e.clientX - startX);
        setRightWidth(Math.max(200, Math.min(600, newWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const [editorLines, setEditorLines] = useState(['']);
 
  const scriptLines = useMemo(() =>
    scriptContent?.split('\n') || [''],
    [scriptContent]
  );

  const expectedLines = useMemo(() =>
    expectedOutput?.split('\n') || [''],
    [expectedOutput]
  );

  const actualLines = useMemo(() =>
    actualOutput?.split('\n') || [''],
    [actualOutput]
  );

  const isCreateInputDisabled = newInput.trim() === "";
  const isCreateScriptDisabled = newScript.trim() === "";

  const renderLineNumbers = (content) => {
    return (
      <div className="pr-4 text-gray-400 select-none">
        {Array.from({ length: content.length }, (_, i) => (
          <div key={i} className="text-right text-blue-400 hover:text-blue-800 h-6">
            {i + 1}
          </div>
        ))}
      </div>
    );
  };

  const handleInputChange = (e) => {
    setNewInput(e.target.value);
    setPayloadContent(e.target.value);
  };

  const handleInputClick = (input, index) => {
    setIsPayloadView(true);
    setSelectedInputIndex(index);
    setActiveInput(input);
    setPayloadContent(inputContents[input] || '{\n  \n}');
  };

  const handleBackClick = () => {
    if (selectedInputIndex !== null) {
      const currentInput = inputs[selectedInputIndex];
      setInputContents(prev => ({
        ...prev,
        [currentInput]: payloadContent
      }));
    }
    setIsPayloadView(false);
  };
 
  const handleCreateInput = () => {
    if (newInput.trim() !== "") {
      const newInputName = newInput;
      setInputs(prev => [...prev, newInputName]);
      setInputContents(prev => ({
        ...prev,
        [newInputName]: '{\n  \n}'
      }));
      setNewInput("");
      setIsInputDialogOpen(false);
    }
  };

  const handleScriptChange = (e) => {
    setNewScript(e.target.value);
  };

  const handleCreateScript = () => {
    if (newScript.trim() !== "") {
      if (activeScript) {
        setScripts(prevScripts =>
          prevScripts.map(s =>
            s.id === activeScript.id
              ? { ...s, content: scriptContent, lastModified: new Date() }
              : s
          )
        );
      }
  
      const scriptName = newScript.endsWith('.dwl') ? newScript : `${newScript}.dwl`;
      const newScriptObj = {
        id: Date.now(),
        name: scriptName,
        content: '',
        lastModified: new Date()
      };
      
      setScripts(prev => [...prev, newScriptObj]);
      setActiveScript(newScriptObj);
      setScriptContent('');
      setNewScript("");
      setIsScriptDialogOpen(false);
    }
  };

  const handleScriptSelect = (script) => {
    if (activeScript) {
      setScripts(prevScripts =>
        prevScripts.map(s =>
          s.id === activeScript.id
            ? { ...s, content: scriptContent, lastModified: new Date() }
            : s
        )
      );
    }
    
    setActiveScript(script);
    setScriptContent(script.content);
  };

  const handleActualOutputChange = (newValue) => {
    setActualOutput(newValue);
  };
  const scrollbarStyle = {
    WebkitScrollbar: {
      width: '8px',
      height: '8px'
    },
    WebkitScrollbarTrack: {
      background: 'transparent'
    },
    WebkitScrollbarThumb: {
      background: '#888',
      borderRadius: '4px'
    },
    WebkitScrollbarCorner: {
      background: 'transparent'
    },
    msOverflowStyle: '-ms-autohiding-scrollbar'
  };
  const scrollbarStyle1 = {
    WebkitScrollbar: {
      width: '8px',
      height: '8px'
    },
    WebkitScrollbarTrack: {
      background: 'transparent'
    },
    WebkitScrollbarThumb: {
      background: '#888',
      borderRadius: '4px'
    },
    WebkitScrollbarCorner: {
      background: 'transparent'
    },
    msOverflowStyle: '-ms-autohiding-scrollbar'
  };
 
  const handleExpectedOutputChange = (newValue) => {
    setExpectedOutput(newValue);
  };
  const detectFunctionType = (script) => {
    if (script.startsWith('$')) return 'jsonPath';
    if (script.includes('match')) return 'match';
    return 'general';
  };

  useEffect(() => {
    if (activeScript && payloadContent) {
      try {
        const handler = new SnapLogicFunctionsHandler();
        const inputData = JSON.parse(payloadContent);
        const result = handler.executeScript(scriptContent, inputData);
        setActualOutput(JSON.stringify(result, null, 2));
      } catch (error) {
        setActualOutput(JSON.stringify({
          error: "Transformation Error",
          message: error.message,
          hint: "Check input format and script syntax"
        }, null, 2));
      }
    }
  }, [payloadContent, scriptContent]);

  const handleScriptContentChange = (e) => {
    if (!e?.target) {
      setActualOutput(JSON.stringify({ error: "Invalid event" }, null, 2));
      return;
    }

    const newContent = e.target.value || '';
    setScriptContent(newContent);
    
    setScripts(prevScripts =>
      prevScripts.map(script =>
        script.id === activeScript?.id
          ? { ...script, content: newContent, lastModified: new Date() }
          : script
      )
    );

    try {
      const handler = new SnapLogicFunctionsHandler();
      if (inputs.length > 1 && newScript.trim() === '$') {
        setActualOutput("Not valid, access with the help of input name");
        return;
      }

      if (inputs.length === 1 && newScript.trim() === '$') {
        setActualOutput(inputContents[inputs[0]]);
        return;
      }

      const inputMatch = newScript.match(/^\$(\w+)/);
      if (inputMatch) {
        const requestedInput = inputMatch[1];
        if (inputContents[requestedInput]) {
          if (newScript === `$${requestedInput}`) {
            setActualOutput(inputContents[requestedInput]);
            return;
          }

          const path = newScript.replace(`$${requestedInput}`, '$');
          const inputData = JSON.parse(inputContents[requestedInput]);
          const result = handler.executeScript(path, inputData);
          setActualOutput(JSON.stringify(result, null, 2));
          return;
        }
      }

      const activeInput = inputs[selectedInputIndex] || inputs[0];
      let inputData;
   
      try {
        inputData = JSON.parse(inputContents[activeInput]);
      } catch (error) {
        setActualOutput(JSON.stringify({
          error: "Invalid Input",
          message: "Input data must be valid JSON",
          input: inputContents[activeInput]
        }, null, 2));
        return;
      }

      const result = handler.executeScript(newScript, inputData);
      setActualOutput(JSON.stringify(result, null, 2));

    } catch (error) {
      setActualOutput(JSON.stringify({
        error: "Transformation Error",
        message: error.message || "Unknown error occurred",
        input: newScript,
        hint: "Check syntax and ensure all referenced paths exist"
      }, null, 2));
    }
  };

  const textAreaStyles = {
    minHeight: '100px',
    lineHeight: '1.5rem',
    padding: '0',
    border: 'none'
  };
  const normalizeJSON = (input) => {
    try {
      if (!input) return '';
      if (typeof input === 'object') {
        return JSON.stringify(input);
      }
      if (typeof input === 'string') {
        const parsed = JSON.parse(input.trim());
        return JSON.stringify(parsed);
      }
      return String(input);
    } catch (error) {
      console.error('JSON normalization error:', error);
      return String(input);
    }
  };
 
  useEffect(() => {
    const compareOutputs = () => {
      try {
        if (!actualOutput || !expectedOutput) {
          setOutputMatch(false);
          return;
        }
        const normalizeJSON = (input) => {
          try {
            return JSON.stringify(JSON.parse(input));
          } catch {
            return input;
          }
        };
        const normalizedActual = normalizeJSON(actualOutput);
        const normalizedExpected = normalizeJSON(expectedOutput);
        setOutputMatch(normalizedActual === normalizedExpected);
      } catch (error) {
        console.error('Comparison error:', error);
        setOutputMatch(false);
      }
    };
    compareOutputs();
  }, [actualOutput, expectedOutput]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
      setShowImportDialog(false);
    }
  };
 
  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
      setShowImportDialog(false);
    }
  };
 
  const [shouldShowExportDialog, setShouldShowExportDialog] = useState(() =>
    localStorage.getItem('showExportDialog') !== 'false'
  );

  const handleExport = async () => {
    try {
      const zip = new JSZip();
      const scriptsFolder = zip.folder("scripts");
      scripts.forEach(script => {
        scriptsFolder.file(script.name, script.content);
      });
      const inputsFolder = zip.folder("inputs");
      Object.entries(inputContents).forEach(([name, content]) => {
        inputsFolder.file(`${name}.json`, content);
      });
      const metadata = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        scripts: scripts.map(s => ({
          name: s.name,
          lastModified: s.lastModified
        })),
        inputs: inputs,
        expectedOutput: expectedOutput
      };
      zip.file("metadata.json", JSON.stringify(metadata, null, 2));
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9
        }
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
      alert('Export failed. Please try again.');
    }
  };
  
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    setWasChecked(true);
    localStorage.setItem('wasChecked', 'true');
    setShowExportDialog(false);
  };

  const getNavLink = (item) => {
    const links = {
      blogs: 'https://www.snaplogic.com/blog',
      docs: 'https://docs.snaplogic.com/',
      tutorial: 'https://www.youtube.com/snaplogic',
      playground: '#'
    };
    return links[item];
  };

  const handleNavClick = (item) => {
    if (item === 'playground') {
      setCurrentView('playground');
    }
    setActiveNavItem(item);
  };
  useEffect(() => {
    setIsBottomExpanded(false);
    setBottomHeight(32);
    setActiveTab(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, canvas.height);
      ctx.strokeStyle = '#e5e7eb';
      ctx.stroke();
    }
  }, [scriptContent]);

  const ActiveLineBorder = () => {
    const top = 8 + (activeLineIndex * 24); // 24px is line height
    return (
      <div
        style={{
          position: 'absolute',
          top: `${top}px`,
          left: '48px', // Adjust based on line numbers width
          right: '0', // Extend all the way to the right
          height: '24px', // Line height
          border: '1px solid #e5e7eb',
          pointerEvents: 'none',
          zIndex: 5
        }}
      />
    );
  };

  const getLineCount = (content) => {
    if (!content) return 1;
    return content.split('\n').length;
  };

  const getResponsiveWidths = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1024) { // Laptop
      return {
        leftWidth: Math.floor(screenWidth * 0.25),
        middleWidth: Math.floor(screenWidth * 0.45),
        rightWidth: Math.floor(screenWidth * 0.30)
      };
    } else if (screenWidth >= 768) { // Tablet
      return {
        leftWidth: Math.floor(screenWidth * 0.30),
        middleWidth: Math.floor(screenWidth * 0.40),
        rightWidth: Math.floor(screenWidth * 0.30)
      };
    }
    return { leftWidth, middleWidth, rightWidth }; // Default widths
  };

  useEffect(() => {
    const handleResize = () => {
      const { leftWidth: newLeft, middleWidth: newMiddle, rightWidth: newRight } = getResponsiveWidths();
      setLeftWidth(newLeft);
      setMiddleWidth(newMiddle);
      setRightWidth(newRight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const responsiveStyles = {
    mainContainer: {
      minWidth: '768px',
      maxWidth: '100vw',
      overflow: 'auto'
    },
    panels: {
      minWidth: '250px'
    }
  };
  const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);
    useEffect(() => {
      const media = window.matchMedia(query);
      const listener = () => setMatches(media.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }, [query]);
    return matches;
  };

  const isTablet = useMediaQuery('(max-width: 1024px)');

  const monacoStyles = `
    .monaco-editor {
      padding-top: 8px;
    }
    .monaco-editor .margin {
      background-color: #f8f9fa;
    }
    .monaco-editor .line-numbers {
      color: #3498db !important;
      font-size: 12px;
    }
    .monaco-editor .current-line {
      border: none !important;
    }
    .monaco-editor .suggest-widget,
    .monaco-editor .parameter-hints-widget,
    .monaco-editor .monaco-hover {
      display: none !important;
    }
  `;

  const handlePayloadChange = (newContent) => {
    setPayloadContent(newContent);
    setInputContents(prev => ({
      ...prev,
      [activeInput]: newContent
    }));
  };
  const handleFormatChange = (newFormat) => {
    setFormat(newFormat);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
      {showToast && (
        <div className="bg-[#E9EEF4] text-[#00044C] py-2 text-[12px] relative">
          <div className="text-center px-12 font-bold font-['Manrope'] text-[1rem] tracking-[0.09em]">
            Discover the Future of Integration. Explore SnapLogic Playground Highlights
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="absolute right-4 top-0 h-full bg-[#E9EEF4] text-[#00044C] border-none outline-none focus:outline-none font-bold text-[18px] flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-2 border-b">
        <div className="flex items-center space-x-3">
          <svg
            viewBox="0 0 100 100"
            className="w-8 h-8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="50" fill="#0046BE"/>
            <path 
              d="M25.7 53.4H34.3L38.6 42.2H46.1L41.7 53.4H47.8" 
              stroke="white" 
              strokeWidth="2"
            />
          </svg>
          <div className="flex items-center space-x-5">
            <a
              href={getNavLink('playground')}
              className={`text-gray-800 hover:text-blue-500 font-bold text-sm ${activeNavItem === 'playground' ? 'active' : ''}`}
              onClick={() => handleNavClick('playground')}
            >
              Playground
            </a>
            <a
              href={getNavLink('blogs')}
              className="text-gray-600 hover:text-blue-500 text-sm"
              target="_blank"
            >
              Blogs
            </a>
            <a
              href={getNavLink('docs')}
              className="text-gray-600 hover:text-blue-500 text-sm"
              target="_blank"
            >
              Docs
            </a>
            <a
              href={getNavLink('tutorial')}
              className="text-gray-600 hover:text-blue-500 text-sm"
              target="_blank"
            >
              Tutorial
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-bold hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                  Sign In
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming Soon!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 flex" style={responsiveStyles.mainContainer}>
        <div
          style={{ ...resizableStyles(leftWidth, 'left'), ...responsiveStyles.panels }}
          className="border-r overflow-y-auto"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Inputs</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Add Input</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Input</DialogTitle>
                  <DialogDescription>
                    Create a new Input to use in the playground.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value={newInput} onChange={handleInputChange} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateInput} disabled={isCreateInputDisabled}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="p-4">
            {isPayloadView ? (
              <div className="flex items-center space-x-2 mb-4">
                <Button variant="ghost" onClick={handleBackClick}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h3 className="text-md font-semibold">Payload View</h3>
              </div>
            ) : (
              <h3 className="text-md font-semibold mb-4">Available Inputs</h3>
            )}
            {isPayloadView ? (
              <div className="mb-4">
                <Label htmlFor="payload" className="block text-sm font-medium text-gray-700 mb-2">
                  {activeInput}
                </Label>
                <Editor
                  height="30vh"
                  width="260px"
                  language="json"
                  theme="light"
                  value={payloadContent}
                  onChange={handlePayloadChange}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    wrappingIndent: 'indent'
                  }}
                />
              </div>
            ) : (
              <ul>
                {inputs.map((input, index) => (
                  <li
                    key={index}
                    className={`py-2 px-4 rounded cursor-pointer hover:bg-gray-100 ${activeInput === input ? 'bg-gray-200' : ''}`}
                    onClick={() => handleInputClick(input, index)}
                  >
                    {input}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div
          style={{ ...resizableStyles(middleWidth, 'middle'), ...responsiveStyles.panels }}
          className="border-r flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Script</h2>
            <div className="flex items-center space-x-4">
              <FormatDropdown onFormatChange={handleFormatChange} />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Add Script</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Script</DialogTitle>
                    <DialogDescription>
                      Create a new Script to use in the playground.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input id="name" value={newScript} onChange={handleScriptChange} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleCreateScript} disabled={isCreateScriptDisabled}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto relative">
            <div className="absolute top-0 left-0 w-full h-full flex">
              <div className="w-12 flex-shrink-0 bg-[#f8f9fa]">
                {renderLineNumbers(scriptLines)}
              </div>
              <canvas ref={canvasRef} width="1" height="100%" style={{ position: 'absolute', left: '48px', top: 0 }} />
              <Editor
                height="77vh"
                width="430px"
                language="javascript"
                theme="light"
                value={scriptContent}
                onChange={(value) => {
                  setScriptContent(value);
                  handleScriptContentChange({ target: { value } });
                }}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  wrappingIndent: 'indent'
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold">Available Scripts</h3>
            </div>
            <div className="flex items-center space-x-2">
              {scripts.map(script => (
                <Button key={script.id} variant="outline" onClick={() => handleScriptSelect(script)}>
                  {script.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{ ...resizableStyles(rightWidth, 'right'), ...responsiveStyles.panels }}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text
