
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { ChevronDown, Upload, Download, Terminal, Book, ChevronLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import JSZip from 'jszip';
import Editor from '@monaco-editor/react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from './components/ui/button';
import FormatDropdown from './FormatDropdown';
import { handleJSON } from './utils/jsonHandler';
import _ from 'lodash';
import moment from 'moment';
import * as R from 'ramda';

import HighLightedJSON from './utils/HighLightedJson';
import HighlightedScript from './utils/HighlightedScript';
import HighlightedActualOutput from './utils/HighlightedActualOutput';
import HighlightedExpectedOutput from './utils/HighlightedExpectedOutput';
import SnapLogicFunctionsHandler from './utils/SnaplogicFunctionsHandler';
import { Documentation } from './components/Documentation';

const UpdatedCode = () => {
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
    [inputs[0]]: '{}'  // Now we can safely use inputs[0]
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
  const [showDocumentation, setShowDocumentation] = useState(false);
 
  const [leftWidth, setLeftWidth] = useState(() =>
    parseInt(localStorage.getItem('leftWidth')) || 288
  );
  const [middleWidth, setMiddleWidth] = useState(() =>
    parseInt(localStorage.getItem('middleWidth')) || 500
  );
  const [rightWidth, setRightWidth] = useState(() =>
    parseInt(localStorage.getItem('rightWidth')) || 384
  );
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

  const handleNavigation = (page, e) => {
    // Prevent default browser navigation behavior
    if (e) {
      e.preventDefault();
    }
    
    if (page === 'docs') {
      setShowDocumentation(true);
      setActiveNavItem('docs');
    } else {
      setActiveNavItem(page);
      setShowDocumentation(false);
    }
  };

  useEffect(() => {
    if (scripts.length > 0 && !activeScript) {
      const mainScript = scripts.find(s => s.name === 'main.dwl') || scripts[0];
      setActiveScript(mainScript);
      setScriptContent(mainScript.content);
    }
  }, []);
  
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
 
  // Convert these direct declarations to useMemo to prevent unnecessary recalculations
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

  // Button disable conditions
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
      // Save content only for the current input
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
        [newInputName]: '{\n  \n}'  // Initialize with empty object
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
      // Save current script content before creating new one
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
        content: '',  // Initialize with empty content
        lastModified: new Date()
      };
      
      setScripts(prev => [...prev, newScriptObj]);
      setActiveScript(newScriptObj);
      setScriptContent('');  // Clear content for new script
      setNewScript("");
      setIsScriptDialogOpen(false);
    }
  };

  const handleScriptSelect = (script) => {
    // Save current script content before switching
    if (activeScript) {
      setScripts(prevScripts =>
        prevScripts.map(s =>
          s.id === activeScript.id
            ? { ...s, content: scriptContent, lastModified: new Date() }
            : s
        )
      );
    }
    
    // Switch to selected script
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
    
    // Update script content in scripts array immediately
    setScripts(prevScripts =>
      prevScripts.map(script =>
        script.id === activeScript?.id
          ? { ...script, content: newContent, lastModified: new Date() }
          : script
      )
    );

    try {
      const handler = new SnapLogicFunctionsHandler();
     
      // Handle multiple inputs case
      if (inputs.length > 1 && newScript.trim() === '$') {
        setActualOutput("Not valid, access with the help of input name");
        return;
      }

      // Handle single input case
      if (inputs.length === 1 && newScript.trim() === '$') {
        setActualOutput(inputContents[inputs[0]]);
        return;
      }

      // For multiple inputs case
      const inputMatch = newScript.match(/^\$(\w+)/);
      if (inputMatch) {
        const requestedInput = inputMatch[1];
        if (inputContents[requestedInput]) {
          // Just show input content for $inputName
          if (newScript === `$${requestedInput}`) {
            setActualOutput(inputContents[requestedInput]);
            return;
          }

          // Execute script with specific input
          const path = newScript.replace(`$${requestedInput}`, '$');
          const inputData = JSON.parse(inputContents[requestedInput]);
          const result = handler.executeScript(path, inputData);
          setActualOutput(JSON.stringify(result, null, 2));
          return;
        }
      }

      // Default to active input
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

      // Execute script with handler
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
     
      // If input is already an object/array, stringify it
      if (typeof input === 'object') {
        return JSON.stringify(input);
      }
 
      // If input is a string, try to parse and re-stringify to normalize
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
      // Create a new JSZip instance
      const zip = new JSZip();
  
      // Add files to the zip
      // Add scripts
      const scriptsFolder = zip.folder("scripts");
      scripts.forEach(script => {
        scriptsFolder.file(script.name, script.content);
      });
  
      // Add inputs
      const inputsFolder = zip.folder("inputs");
      Object.entries(inputContents).forEach(([name, content]) => {
        inputsFolder.file(`${name}.json`, content);
      });
  
      // Add metadata
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
  
      // Generate the zip file
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9
        }
      });
  
      // Create download link and trigger download
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `snaplogic-playground-export-${moment().format('YYYY-MM-DD-HH-mm')}.zip`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      // Optionally show error to user
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
      docs: '#', // Changed to hash to prevent navigation
      tutorial: 'https://www.youtube.com/snaplogic',
      playground: '#'
    };
    return links[item];
  };

  const handleNavClick = (item, e) => {
    if (e) {
      e.preventDefault(); // Prevent default behavior
    }
    
    if (item === 'docs') {
      setShowDocumentation(true);
      setActiveNavItem('docs');
    } else {
      setActiveNavItem(item);
      setShowDocumentation(false);
    }
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

  // Create active line border element
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

  // Add these responsive width calculations
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

  // Add resize listener
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

  // Add responsive styles
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

  // In your component
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

    /* Disable editor widgets that might interfere with typing */
    .monaco-editor .suggest-widget,
    .monaco-editor .parameter-hints-widget,
    .monaco-editor .monaco-hover {
      display: none !important;
    }
  `;

  const handlePayloadChange = (newContent) => {
    setPayloadContent(newContent);
    // Update the content for the current active input only
    setInputContents(prev => ({
      ...prev,
      [activeInput]: newContent
    }));
  };
  
  const handleFormatChange = (newFormat) => {
    setFormat(newFormat);
  };

  // If showing documentation, render the Documentation component
  if (showDocumentation) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-gradient-to-b from-white to-gray-50">
        {showToast && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2 relative">
            <div className="text-center px-12 font-bold font-['Manrope'] text-[1rem] tracking-[0.09em]">
              Discover the Future of Integration. Explore SnapLogic Playground Highlights
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="absolute right-4 top-0 h-full bg-transparent text-white border-none outline-none focus:outline-none font-bold text-[18px] flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-2 border-b bg-white shadow-sm">
          <div className="flex items-center space-x-3">
            <img
              src="/sl-logo.svg"
              alt="SnapLogic Logo"
              className="object-contain hover:scale-105 transition-transform duration-200"
              style={{
                width: isTablet ? '22px' : '32px',
                height: isTablet ? '22px' : '32px'
              }}
            />
            <img
              src="/LogoN.svg"
              alt="SnapLogic"
              className="object-contain hover:scale-105 transition-transform duration-200"
              style={{
                height: isTablet ? '20px' : '32px'
              }}
            />
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="space-x-8 text-[0.82rem] font-semibold text-[#333333] relative font-['Manrope'] flex items-center">
              {['blogs', 'docs', 'tutorial', 'playground'].map(item => (
                <a
                  key={item}
                  href={getNavLink(item)}
                  className={`text-gray-800 hover:text-blue-600 px-2 py-2 relative transition-colors duration-200 ${
                    activeNavItem === item
                      ? 'after:content-[""] after:absolute after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:-bottom-[0.5rem] z-10 text-blue-600 font-bold'
                      : ''
                  }`}
                  onClick={(e) => handleNavClick(item, e)}
                >
                  {item.toUpperCase()}
                </a>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  handleExport();
                  if (!wasChecked) {
                    setShowExportDialog(true);
                  }
                }}
                className="flex items-center px-4 py-1.5 bg-white rounded-md border border-gray-200 shadow-sm focus:outline-none group hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <img
                  src="/cloud-upload-Hover.svg"
                  alt="Export"
                  className="mr-2 h-4 w-4 text-blue-500 group-hover:text-blue-600"
                />
                <span className="text-gray-700 font-['Manrope'] group-hover:text-blue-600 text-[0.9rem] tracking-[0.05em] font-medium">Export</span>
              </button>
              
              <button
                onClick={() => {setShowImportDialog(true); setSelectedFile(null);}} 
                className="flex items-center px-4 py-1.5 bg-white rounded-md border border-gray-200 shadow-sm focus:outline-none group hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <img
                  src="/cloud-download-Hover.svg"
                  alt="Import"
                  className="mr-2 h-4 w-4 text-blue-500 group-hover:text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 text-[0.9rem] font-['Manrope'] tracking-[0.05em] font-medium">Import</span>
              </button>
            </div>
          </div>
        </div>

        <Documentation onBack={() => {
          setShowDocumentation(false);
          setActiveNavItem('playground');
        }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {showToast && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2 relative">
          <div className="text-center px-12 font-bold font-['Manrope'] text-[1rem] tracking-[0.09em]">
            Discover the Future of Integration. Explore SnapLogic Playground Highlights
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="absolute right-4 top-0 h-full bg-transparent text-white border-none outline-none focus:outline-none font-bold text-[18px] flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-2 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <img
            src="/sl-logo.svg"
            alt="SnapLogic Logo"
            className="object-contain hover:scale-105 transition-transform duration-200"
            style={{
              width: isTablet ? '22px' : '32px',
              height: isTablet ? '22px' : '32px'
            }}
          />
          <img
            src="/LogoN.svg"
            alt="SnapLogic"
            className="object-contain hover:scale-105 transition-transform duration-200"
            style={{
              height: isTablet ? '20px' : '32px'
            }}
          />
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                handleExport();
                if (!wasChecked) {
                  setShowExportDialog(true);
                }
              }}
              className="flex items-center px-4 py-1.5 bg-white rounded-md border border-gray-200 shadow-sm focus:outline-none group hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <img
                src="/cloud-upload-Hover.svg"
                alt="Export"
                className="mr-2 h-4 w-4 text-blue-500 group-hover:text-blue-600"
              />
              <span className="text-gray-700 font-['Manrope'] group-hover:text-blue-600 text-[0.9rem] tracking-[0.05em] font-medium">Export</span>
            </button>
            
            <button
              onClick={() => {setShowImportDialog(true); setSelectedFile(null);}} 
              className="flex items-center px-4 py-1.5 bg-white rounded-md border border-gray-200 shadow-sm focus:outline-none group hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <img
                src="/cloud-download-Hover.svg"
                alt="Import"
                className="mr-2 h-4 w-4 text-blue-500 group-hover:text-blue-600"
              />
              <span className="text-gray-700 group-hover:text-blue-600 text-[0.9rem] font-['Manrope'] tracking-[0.05em] font-medium">Import</span>
            </button>
          </div>

          <div className="h-6 w-[1px] bg-gray-300"></div>

          <div className="space-x-8 text-[0.82rem] font-semibold text-[#333333] relative font-['Manrope'] flex items-center">
            {['blogs', 'docs', 'tutorial', 'playground'].map(item => (
              <a
                key={item}
                href={getNavLink(item)}
                className={`text-gray-800 hover:text-blue-600 px-2 py-2 relative transition-colors duration-200 ${
                  activeNavItem === item
                    ? 'after:content-[""] after:absolute after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:-bottom-[0.5rem] z-10 text-blue-600 font-bold'
                    : ''
                }`}
                onClick={(e) => handleNavClick(item, e)}
              >
                {item.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-100px)] bg-white m-4 rounded-lg shadow-md" style={responsiveStyles.mainContainer}>
        {/* Left Panel */}
        <div style={{...resizableStyles(leftWidth,'left'),...responsiveStyles.panels}} className="flex-shrink-0 border-r border-gray-200 flex flex-col relative h-full overflow-hidden bg-gray-50">
          {isPayloadView ? (
            <div className="flex flex-col h-full overflow-auto" style={{...scrollbarStyle}}>
              <div className="border-b border-gray-200 bg-white">
                <div className="flex justify-center items-center h-[40px] px-4 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleBackClick} 
                      className="text-gray-600 bg-transparent hover:bg-gray-100 rounded-full p-1 border-none outline-none h-8 w-8 flex items-center justify-center focus:outline-none transition-colors duration-200"
                    >
                      <img
                        src="/toolbarExpand-Active.svg"
                        alt="Back"
                        className="w-4 h-4 flex-shrink-0"
                      />
                    </button>
                    <span className="font-bold font-['Manrope'] text-gray-700 text-sm">PAYLOAD</span>
                  </div>
                  <div className="ml-auto">
                    <FormatDropdown onFormatChange={handleFormatChange} />
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 bg-white">
                <HighLightedJSON
                  content={payloadContent}
                  onChange={handlePayloadChange}
                  format={format}
                  style={{
                    lineHeight: '1.5rem',
                    ...scrollbarStyle,
                    height: '100%',
                    backgroundColor: 'white'
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Input Explorer */}
              <div className="h-1/2 border-b border-gray-200 overflow-auto bg-white" style={responsiveStyles.panels}>
                <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center h-[40px] px-4">
                    <span className="font-bold text-gray-700 font-['Manrope'] text-sm tracking-wide">INPUT EXPLORER</span>
                    <button
                      onClick={() => setShowInputContainer(true)}
                      className="text-gray-500 hover:text-blue-600 bg-transparent hover:bg-gray-100 rounded-full p-1 border-none outline-none h-8 w-8 flex items-center justify-center transition-colors duration-200"
                    >
                      <img
                        src="/add-Hover.svg"
                        alt="Add Input"
                        className="h-4 w-4"
                      />
                    </button>
                  </div>
                </div>

                {showInputContainer && (
                  <>
                    <div className="fixed inset-0 bg-black/75 z-40" />
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="w-[32rem] bg-white p-6 shadow-lg rounded-md">
                        <div className="mb-5 font-['Manrope']">
                          <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Create new input
                          </h2>
                          <div className="border-b border-gray-200 -mx-6"></div>
                        </div>
                        <div className="py-2">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Identifier
                            </label>
                            <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-500 cursor-help hover:bg-gray-100 transition-colors duration-200">
                              i
                            </div>
                          </div>
                          <input
                            value={newInput}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 text-base bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md transition-all duration-200 outline-none"
                            placeholder="Enter identifier name"
                          />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            onClick={() => setShowInputContainer(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={isCreateInputDisabled}
                            onClick={() => {
                              handleCreateInput();
                              setShowInputContainer(false);
                            }}
                            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                              isCreateInputDisabled
                                ? "text-gray-500 bg-gray-200 cursor-not-allowed"
                                : "text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-2">
                  {inputs.map((input, index) => (
                    <div
                      key={index}
                      className={`flex items-center text-sm p-2 cursor-pointer w-full group transition-colors duration-200
                        ${activeInput === input
                          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-medium'
                          : 'text-gray-700 hover:bg-gray-100 border-l-2 border-transparent'}`}
                      onClick={() => handleInputClick(input, index)}
                    >
                      <div className="flex items-center">
                        <span className="text-blue-500 px-3 font-mono text-xs uppercase">json</span>
                        <span>{input}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Script Explorer */}
              <div className="h-1/2 overflow-auto bg-white" style={responsiveStyles.panels}>
                <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center h-[40px] px-4">
                    <span className="font-bold text-gray-700 font-['Manrope'] text-sm tracking-wide">SCRIPT EXPLORER</span>
                    <button
                      onClick={() => setShowScriptContainer(true)}
                      className="text-gray-500 hover:text-blue-600 bg-transparent hover:bg-gray-100 rounded-full p-1 border-none outline-none h-8 w-8 flex items-center justify-center transition-colors duration-200"
                    >
                      <img
                        src="/add-Hover.svg"
                        alt="Add Script"
                        className="h-4 w-4"
                      />
                    </button>
                  </div>
                </div>
                
                {showScriptContainer && (
                  <>
                    <div className="fixed inset-0 bg-black/75 z-40" />
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="w-[32rem] bg-white p-6 shadow-lg rounded-md">
                        <div className="mb-5 font-['Manrope']">
                          <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Create new script
                          </h2>
                          <div className="border-b border-gray-200 -mx-6"></div>
                        </div>
                        <div className="py-2">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Identifier
                            </label>
                            <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-xs text-gray-500 cursor-help hover:bg-gray-100 transition-colors duration-200">
                              i
                            </div>
                          </div>
                          <input
                            value={newScript}
                            onChange={handleScriptChange}
                            className="w-full px-4 py-2 text-base bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md transition-all duration-200 outline-none"
                            placeholder="Enter script name"
                          />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            onClick={() => setShowScriptContainer(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={isCreateScriptDisabled}
                            onClick={() => {
                              handleCreateScript();
                              setShowScriptContainer(false);
                            }}
                            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                              isCreateScriptDisabled
                                ? "text-gray-500 bg-gray-200 cursor-not-allowed"
                                : "text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-2">
                  {scripts.map((script) => (
                    <div
                      key={script.id}
                      className={`flex items-center text-sm p-2 cursor-pointer w-full group transition-colors duration-200
                        ${activeScript?.id === script.id
                          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-medium'
                          : 'text-gray-700 hover:bg-gray-100 border-l-2 border-transparent'}`}
                      onClick={() => handleScriptSelect(script)}
                    >
                      <span className="pl-3">{script.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Left Resize Handle */}
        <div
          className="w-[4px] bg-gray-100 relative hover:bg-blue-200 transition-colors duration-200"
          onMouseDown={(e) => handleMouseDown(e, true)}
        >
          <div
            className="absolute -left-2 -right-2 top-0 bottom-0 hover:cursor-ew-resize"
            style={{ cursor: isDragging ? 'ew-resize' : 'ew-resize' }}
          >
            <div className="w-[2px] h-full mx-auto bg-gray-300 hover:bg-blue-500 transition-colors duration-200" />
          </div>
        </div>

        {/* Middle Panel */}
        <div style={{...resizableStyles(middleWidth,'middle'), ...responsiveStyles.panels}} className="flex-1 border-r border-gray-200 flex flex-col relative bg-white">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between min-h-[40px] px-4">
              <span className="font-bold text-gray-700 font-['Manrope'] text-sm tracking-wide">SCRIPT</span>
              <div className="flex items-center">
                {outputMatch ? (
                  <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="font-medium">SUCCESS</span>
                  </div>
                ) : (
                  <div className="flex items-center bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    <span className="font-medium">FAILURE</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-1 font-mono text-sm h-full font-['Manrope'] relative bg-white" style={{ overflow: 'hidden' }}>
            <div className="flex flex-1 rounded-md shadow-inner" style={scrollbarStyle}>
              <HighlightedScript
                content={scriptContent}
                onChange={(newContent) => {
                  handleScriptContentChange({ target: { value: newContent } });
                  const lines = newContent.split('\n');
                  setActiveLineIndex(lines.length - 1);
                }}
                activeLineIndex={activeLineIndex}
                payload={inputContents[activeInput] || '{}'}
              />
            </div>

            <canvas
              ref={canvasRef}
              className="decorationsOverviewRuler"
              aria-hidden="true"
              width="14"
              height={scriptContent.split('\n').length * 24}
              style={{
                position: 'absolute',
                willChange: 'transform',
                top: '8px',
                right: 0,
                width: '14px',
                height: 'calc(100% - 8px)',
                zIndex: 10
              }}
            />

            {/* Active Line Indicator */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: `${8 + (activeLineIndex * 24)}px`,
                width: '14px',
                height: '2px',
                backgroundColor: '#3b82f6',
                zIndex: 11
              }}
            />
          </div>
        </div>

        {/* Right Resize Handle */}
        <div
          className="w-[4px] bg-gray-100 relative hover:bg-blue-200 transition-colors duration-200"
          onMouseDown={(e) => handleMouseDown(e, false)}
        >
          <div
            className="absolute -left-2 -right-2 top-0 bottom-0 hover:cursor-ew-resize"
            style={{ cursor: isDragging ? 'ew-resize' : 'ew-resize' }}
          >
            <div className="w-[2px] h-full mx-auto bg-gray-300 hover:bg-blue-500 transition-colors duration-200" />
          </div>
        </div>

        {/* Right Panel */}
        <div style={{...resizableStyles(rightWidth,'right'), ...responsiveStyles.panels}} className="flex-shrink-0 flex flex-col h-full relative overflow-hidden bg-gray-50">
          {/* Actual Output Section */}
          <div className="h-1/2 border-b border-gray-200 overflow-hidden bg-white">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center h-[40px] px-4">
                <span className="font-bold text-gray-700 font-['Manrope'] text-sm tracking-wide">ACTUAL OUTPUT</span>
                <div className="flex items-center">
                  <FormatDropdown />
                </div>
              </div>
            </div>
            <div className="p-4 font-mono text-sm font-['Manrope'] h-[calc(100%-40px)] bg-white">
              <HighlightedActualOutput
                actualOutput={actualOutput}
                onActualOutputChange={handleActualOutputChange}
              />
            </div>
          </div>

          {/* Expected Output Section */}
          <div className="h-1/2 bg-white">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center h-[40px] px-4">
                <span className="font-bold text-gray-700 font-['Manrope'] text-sm tracking-wide">EXPECTED OUTPUT</span>
                <div className="flex items-center">
                  <FormatDropdown />
                </div>
              </div>
            </div>
            <div className="p-4 font-mono text-sm font-['Manrope'] h-[calc(100%-40px)] overflow-auto bg-white" style={scrollbarStyle}>
              <HighlightedExpectedOutput
                expectedOutput={expectedOutput}
                onExpectedOutputChange={handleExpectedOutputChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t border-gray-200 relative flex flex-col bg-white shadow-inner"
        style={{
          height: `${bottomHeight}px`,
          transition: isDragging ? 'none' : 'height 0.2s ease-in-out',
          ...responsiveStyles.panels
        }}
      >
        <div
          className="absolute left-0 right-0 top-0 h-2 cursor-ns-resize z-20 group"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
            const startY = e.clientY;
            const startHeight = bottomHeight;

            const handleMouseMove = (e) => {
              const deltaY = startY - e.clientY;
              const newHeight = startHeight + deltaY;
              setBottomHeight(Math.max(32, Math.min(300, newHeight)));
            };

            const handleMouseUp = () => {
              setIsDragging(false);
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="w-full h-1 bg-gray-200 group-hover:bg-blue-500 transition-colors duration-200" />
        </div>

        <div className="flex items-center justify-between min-h-[40px] bg-gray-50 font-['Manrope'] relative px-4">
          <div className="flex space-x-4 z-10">
            <TooltipProvider delayDuration={50}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (!isBottomExpanded || activeTab !== 'log') {
                        setIsBottomExpanded(true);
                        setActiveTab('log');
                        setBottomHeight(300);
                      } else {
                        setIsBottomExpanded(false);
                        setBottomHeight(40);
                      }
                    }}
                    className={`text-xs px-3 py-2 flex items-center hover:bg-gray-100 cursor-pointer outline-none focus:outline-none focus:ring-0 rounded-md transition-colors duration-200 ${
                      activeTab === 'log' ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <Terminal className="h-3.5 w-3.5 mr-2" />
                    <span className='tracking-wide'>LOG VIEWER</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={15} className="h-2 w-5 rounded-full bg-gray-800 p-0 border-0" />
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      if (!isBottomExpanded || activeTab !== 'api') {
                        setIsBottomExpanded(true);
                        setActiveTab('api');
                        setBottomHeight(300);
                      } else {
                        setIsBottomExpanded(false);
                        setBottomHeight(40);
                      }
                    }}
                    className={`text-xs px-3 py-2 flex items-center hover:bg-gray-100 cursor-pointer outline-none focus:outline-none focus:ring-0 rounded-md transition-colors duration-200 ${
                      activeTab === 'api' ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <Book className="h-3.5 w-3.5 mr-2" />
                    <span className="tracking-wide">API REFERENCE</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={15} className="h-2 w-5 rounded-full bg-gray-800 p-0 border-0" />
              </Tooltip>
            </TooltipProvider>
          </div>

          <span className="font-['Manrope'] text-sm text-gray-500 absolute left-1/2 transform -translate-x-1/2 tracking-wide">
            SnapLogic Playground – Redefining Integration.
          </span>
        </div>

        {/* Content */}
        {isBottomExpanded && (
          <div className="flex-1 overflow-auto">
            <div className="h-full overflow-auto">
              <div className="flex flex-col justify-center items-center h-full p-6">
                {activeTab === 'log' && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">No Logs Available</h2>
                    <p className="text-sm text-gray-600">
                      Learn more about the
                      <span className="mx-2 bg-blue-50 px-3 py-1 rounded-md text-blue-700 font-mono">jsonPath</span>
                      function in the
                      <span className="ml-1 text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => {
                        setActiveTab('api');
                      }}>API Reference</span>
                    </p>
                  </>
                )}
               
                {activeTab === 'api' && (
                  <div className="w-full h-full flex">
                    {/* Left Navigation */}
                    <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50" style={{...scrollbarStyle, ...responsiveStyles.panels}}>
                      <nav className="p-4">
                        <ul className="space-y-1 font-['Manrope']">
                          <li className="font-semibold text-gray-900 px-3 py-2">Getting Started</li>
                          <li className="text-blue-600 bg-blue-50 rounded-md px-3 py-1.5 text-sm cursor-pointer font-medium">Understanding Expressions</li>
                          <li className="text-gray-700 hover:bg-gray-100 rounded-md px-3 py-1.5 text-sm cursor-pointer transition-colors duration-200">Expression Types</li>
                          <li className="text-gray-700 hover:bg-gray-100 rounded-md px-3 py-1.5 text-sm cursor-pointer transition-colors duration-200">Syntax Guide</li>
                          <li className="text-gray-700 hover:bg-gray-100 rounded-md px-3 py-1.5 text-sm cursor-pointer transition-colors duration-200">Common Functions</li>
                          <li className="font-semibold text-gray-900 mt-4 px-3 py-2">Advanced Topics</li>
                          <li className="text-gray-700 hover:bg-gray-100 rounded-md px-3 py-1.5 text-sm cursor-pointer transition-colors duration-200">Complex Expressions</li>
                          <li className="text-gray-700 hover:bg-gray-100 rounded-md px-3 py-1.5 text-sm cursor-pointer transition-colors duration-200">Best Practices</li>
                          <li className="text-gray-700 hover:bg-gray-100 rounded-md px-3 py-1.5 text-sm cursor-pointer transition-colors duration-200">Troubleshooting</li>
                        </ul>
                      </nav>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 overflow-y-auto bg-white" style={scrollbarStyle}>
                      <div className="p-6 font-['Manrope']">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Understanding Expressions</h1>
                        <div className="space-y-6">
                          <section>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Overview</h2>
                            <p className="text-gray-700 leading-relaxed">
                              SnapLogic expressions provide a powerful way to transform and manipulate data within your pipelines.
                              These expressions can be used to extract, filter, map, and restructure your data as it moves through the integration flow.
                            </p>
                          </section>

                          <section>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Expression Types</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                              <li><span className="font-medium text-gray-800">JSONPath expressions</span> - Navigate and extract data from JSON structures</li>
                              <li><span className="font-medium text-gray-800">Pipeline parameters</span> - Configure dynamic behavior for pipeline execution</li>
                              <li><span className="font-medium text-gray-800">JavaScript expressions</span> - Implement complex logic and custom transformations</li>
                              <li><span className="font-medium text-gray-800">Runtime expressions</span> - Define behavior that responds to execution context</li>
                            </ul>
                          </section>

                          <section>
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Examples</h2>
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                              <pre className="text-sm font-mono text-gray-800">
                                {`// Data Navigation
$.phoneNumbers[0].type

// String Operations
$uppercase($.firstName)

// Array Operations
$.items[*].price`}
                              </pre>
                            </div>
                          </section>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div className="bg-white w-[32rem] rounded-md shadow-xl overflow-hidden">
            <div className="p-6 font-['Manrope']">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Open in Visual Studio Code</h2>
              <div className="h-[1px] bg-gray-200 w-full -mx-6 mb-6"></div>
              <p className="text-gray-700 mb-3">
                For the best DataWeave development experience, unzip and open the project in <span className="text-blue-600 font-medium">VSCode</span>
              </p>
              <p className="text-gray-700 mb-8">
                Don't forget to install the <span className="text-blue-600 font-medium">DataWeave Playground</span> extension
              </p>
              <div className="flex justify-between items-center">
                <label
                  className="flex items-center text-sm cursor-pointer select-none"
                  onClick={() => {
                    setIsChecked(!isChecked);
                    setWasChecked(true);
                  }}
                >
                  <div className="w-5 h-5 mr-2 border border-gray-300 flex items-center justify-center bg-white hover:border-blue-400 cursor-pointer rounded transition-colors duration-200">
                    {isChecked && (
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  Don't show popup again
                </label>

                <button
                  onClick={() => setShowExportDialog(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div className="bg-white w-[32rem] rounded-md shadow-xl overflow-hidden">
            <div className="p-6 font-['Manrope']">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Import project</h2>
              <div className="h-[1px] bg-gray-200 w-full -mx-6 mb-6"></div>
              <div 
                className="border-2 border-dashed border-gray-400 rounded-md p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors duration-200 bg-gray-50"
                onClick={() => document.getElementById('fileInput').click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
              >
                <input
                  id="fileInput"
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-base font-medium text-gray-700 mt-4 mb-1">
                  {selectedFile ? selectedFile.name : "Drop project zip here or click to upload"}
                </p>
                <p className="text-sm text-gray-500">
                  Supported format: .zip
                </p>
              </div>
              <div className="mt-6 text-center">
                <p className="text-red-500 text-sm mb-1">
                  Upload functionality is only intended for playground exported projects
                </p>
                <p className="text-gray-500 text-sm">
                  Importing modified files may yield an invalid project.
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatedCode;
