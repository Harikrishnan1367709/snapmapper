
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { ChevronDown, Upload, Download, Terminal, Book, ChevronLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import JSZip from 'jszip';


// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
import FormatDropdown from '../FormatDropdown';
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
  // const [activeInput, setActiveInput] = useState('Payload');
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
  
  // const [activeScript, setActiveScript] = useState(scripts[0]);
  const [activeScript, setActiveScript] = useState(null);
  const [scriptContent, setScriptContent] = useState('');
  const [newScript, setNewScript] = useState("");
  // const [scriptContent, setScriptContent] = useState(scripts[0].content);

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
    minWidth: '250px', // Increased minimum width
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
      // console.error("Transformation Error:", error);
      setActualOutput(JSON.stringify({
        error: "Transformation Error",
        message: error.message || "Unknown error occurred",
        input: newScript,
        hint: "Check syntax and ensure all referenced paths exist"
      }, null, 2));
    }
  };

  // useEffect(() => {
  //   console.log("Actual output updated:", actualOutput) // Debugging log
  // }, [actualOutput])
 
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
      <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
        {showToast && (
          <div className="bg-[#E9EEF4] text-[#00044C] py-2 text-[12px] relative">
            <div className="text-center px-12 font-bold font-['Manrope'] text-[1rem] tracking-[0.09em]">
              Discover the Future of Integration. Explore SnapLogic Playground Highlights
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="absolute right-4 top-0 h-full bg-[#E9EEF4] text-[#00044C] border-none outline-none focus:outline-none font-bold text-[18px] flex items-center justify-center font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-2 border-b">
          <div className="flex items-center space-x-3">
            <img
              src="/sl-logo.svg"
              alt="SnapLogic Logo"
              className="object-contain"
              style={{
                width: isTablet ? '22px' : '32px',
                height: isTablet ? '22px' : '32px'
              }}
            />
            <img
              src="/LogoN.svg"
              alt="SnapLogic"
              className="object-contain"
              style={{
                height: isTablet ? '20px' : '32px'
              }}
            />
          </div>
          
          <div className="space-x-8 text-[0.82rem] font-bold text-[#333333] relative font-['Manrope'] flex items-center">
            {['blogs', 'docs', 'tutorial', 'playground'].map(item => (
              <a
                key={item}
                href={getNavLink(item)}
                className={`text-black hover:text-blue-500 px-2 py-2 relative ${
                  activeNavItem === item
                    ? 'after:content-[""] after:absolute after:left-0 after:right-0 after:h-0.5 after:bg-[#1B4E8D] after:-bottom-[0.5rem] z-10'
                    : ''
                }`}
                onClick={(e) => handleNavClick(item, e)}
              >
                {item.toUpperCase()}
              </a>
            ))}
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => {
                handleExport();
                if (!wasChecked) {
                  setShowExportDialog(true);
                }
              }}
              className="flex items-center px-4 py-1.5 bg-white rounded border-none focus:outline-none group hover:text-blue-500 -ml-3"
            >
              <img
                src="/cloud-upload-Hover.svg"
                alt="SnapLogic Logo"
                className="mr-2 text-gray-700 group-hover:text-blue-500 text-gray-500 h-4 w-4"
              />
              <span className="text-gray-700 font-['Manrope'] group-hover:text-blue-500 text-[0.9rem] tracking-[0.09em] font-['Manrope'] font-normal">Export</span>
            </button>
            
            <button
              onClick={() => {setShowImportDialog(true); setSelectedFile(null);}} 
              className="flex items-center px-4 py-1.5 bg-white rounded border-none focus:outline-none group hover:text-blue-500 -ml-4"
            >
              <img
                src="/cloud-download-Hover.svg"
                alt="SnapLogic Logo"
                className="mr-2 group-hover:text-blue-500 text-gray-500 h-4 w-4"
              />
              <span className="text-gray-700 group-hover:text-blue-500 text-[0.9rem] font-['Manrope'] tracking-[0.09em] font-normal">Import</span>
            </button>

            <div className="h-6 w-[1px] bg-gray-500 mx-4"></div>
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
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
      {showToast && (
        <div className="bg-[#E9EEF4] text-[#00044C] py-2 text-[12px] relative">
          <div className="text-center px-12 font-bold font-['Manrope'] text-[1rem] tracking-[0.09em]">
           
            Discover the Future of Integration. Explore SnapLogic Playground Highlights
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="absolute right-4 top-0 h-full bg-[#E9EEF4] text-[#00044C] border-none outline-none focus:outline-none font-bold text-[18px] flex items-center justify-center font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-2 border-b">
        <div className="flex items-center space-x-3">
          
           <img
  src="/sl-logo.svg"
  alt="SnapLogic Logo"
  className=" object-contain"
  style={{
    width: isTablet ? '22px' : '32px',
    height: isTablet ? '22px' : '32px'
  }}
/>
<img
  src="/LogoN.svg"
  alt="SnapLogic"
  className=" object-contain"
  style={{
    height: isTablet ? '20px' : '32px'
  }}
/>
        </div>
        <div className="flex items-center">
        <button
  onClick={() => {
    handleExport();
    // Show dialog if not checked in current session
    if (!wasChecked) {
      setShowExportDialog(true);
    }
  }}

  
