import React, { useEffect, useMemo, useRef, useState } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { ChevronDown, Upload, Download, Terminal, Book, ChevronLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid"


// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Editor from '@monaco-editor/react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Button } from './components/ui/button';
import FormatDropdown from './FormatDropdown';
import { handleJSON } from './utils/jsonHandler';
import _ from 'lodash';
import moment from 'moment';
import * as R from 'ramda';
import SnapLogicFunctionsHandler from './utils/SnaplogicFunctionsHandler';
import HighLightedJSON from './utils/HighLightedJson';
import HighlightedScript from './utils/HighlightedScript';
import HighlightedActualOutput from './utils/HighlightedActualOutput';
import HighlightedExpectedOutput from './utils/HighlightedExpectedOutput';







const SnaplogicPlayground3 = () => {



  const [format, setFormat] = useState('json');
 
  const canvasRef = useRef(null);
  const [activeLineIndex, setActiveLineIndex] = useState(null);




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
  const [activeInput, setActiveInput] = useState('Payload');
 
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
  


  const [activeScript, setActiveScript] = useState(scripts[0]);
  const [newScript, setNewScript] = useState("");
  const [scriptContent, setScriptContent] = useState(scripts[0].content);
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
    setPayloadContent(inputContents[input] || '{\n  \n}');
  };


  const handleBackClick = () => {
    if (selectedInputIndex !== null) {
      const currentInput = inputs[selectedInputIndex];
      setInputContents({
        ...inputContents,
        [currentInput]: payloadContent
      });
    }
    setIsPayloadView(false);
  };
 
  const handleCreateInput = () => {
    if (newInput.trim() !== "") {
      setInputs([...inputs, newInput]);
      setInputContents({
        ...inputContents,
        [newInput]: '{\n  \n}'
      });
      setNewInput("");
      setIsInputDialogOpen(false);
    }
  };


  const handleScriptChange = (e) => {
    setNewScript(e.target.value);
  };


  const handleCreateScript = () => {
    if (newScript.trim() !== "") {
      const scriptName = newScript.endsWith('.dwl') ? newScript : `${newScript}.dwl`;
      const newScriptObj = {
        id: Date.now() + Math.random(),
        name: scriptName,
        content: '',
        lastModified: new Date()
      };
      setScripts([...scripts, newScriptObj]);
      setNewScript("");
      setIsScriptDialogOpen(false);
    }
  };


  const handleScriptSelect = (script) => {
    if (activeScript) {
      // Auto-save current script
      const updatedScripts = scripts.map(s =>
        s.id === activeScript.id
          ? { ...s, content: scriptContent }
          : s
      );
      setScripts(updatedScripts);
    }
   
    setActiveScript(script);
    setScriptContent(script.content);
  };


  const handleActualOutputChange = (newValue) => {
    setActualOutput(newValue);
  };
  const scrollbarStyle = {
    overflowY: 'auto',
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
      background: '#ffffff'
    },
    '&::-webkit-scrollbar-track': {
      background: '#ffffff',
      borderRadius: '0px',
      margin: '4px 0'
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888888',
      border: '2px solid #ffffff',
      borderRadius: '4px',
      minHeight: '40px',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        background: '#666666'
      },
      '&:active': {
        background: '#555555'
      }
    },
    '&::-webkit-scrollbar-corner': {
      background: '#ffffff'
    },
    // Firefox support
    scrollbarWidth: 'thin',
    scrollbarColor: '#888888 #ffffff',
    // Edge support
    'ms-overflow-style': '-ms-autohiding-scrollbar'
  };
  const scrollbarStyle1 = {
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '10px'
    },
    '&::-webkit-scrollbar-track': {
      background: '#ffffff'
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#ffffff',
      borderRadius: '0px',
      border: '1px solid #ffffff'
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#ffffff'
    },
    '&::-webkit-scrollbar-corner': {
      background: '#ffffff'
    }
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


  const newScript = e.target.value || '';
  setScriptContent(newScript);
  setScriptContent(e.target.value);
 
  // Update script content in scripts array
  setScripts(prevScripts =>
    prevScripts.map(script =>
      script.id === activeScript.id
        ? { ...script, content: newScript, lastModified: new Date() }
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
    console.error("Transformation Error:", error);
    setActualOutput(JSON.stringify({
      error: "Transformation Error",
      message: error.message || "Unknown error occurred",
      input: newScript,
      hint: "Check syntax and ensure all referenced paths exist"
    }, null, 2));
  }
};




  useEffect(() => {
    console.log("Actual output updated:", actualOutput) // Debugging log
  }, [actualOutput])
 
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


  const handleExport = () => {
    const blob = new Blob(['Demo content'], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'snaplogic-playground-export.zip');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
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
// const [jsonContent, setJsonContent] = useState('{\n  \n}');

//   const handleEditorChange = (value) => {
//     if (value !== undefined) {
//       setJsonContent(value);
//     }
//   };


  // const HighlightedJSON = ({ content, onChange, style }) => {
  //   const editorRef = useRef(null);
  //   const initialSetupDone = useRef(false);
  //   const lastCursorPosition = useRef(null);
  
  //   const handleEditorDidMount = (editor, monaco) => {
  //     editorRef.current = editor;
  
  //     monaco.editor.defineTheme('dataweaveTheme', {
  //       base: 'vs',
  //       inherit: true,
  //       rules: [
  //         { token: 'string.key.json', foreground: '000000' },
  //         { token: 'string.value.json', foreground: '0000FF' },
  //         { token: 'number.json', foreground: '098658' },
  //         { token: 'delimiter.bracket.json', foreground: '000000' },
  //         { token: 'delimiter.array.json', foreground: '000000' },
  //         { token: 'delimiter.comma.json', foreground: '000000' }
  //       ],
  //       colors: {
  //         'editor.background': '#FFFFFF',
  //         'editor.lineHighlightBackground': '#F0F0F0',
  //         'editorCursor.foreground': '#000000',
  //         'editor.selectionBackground': '#ADD6FF',
  //         'editor.inactiveSelectionBackground': '#E5EBF1'
  //       }
  //     });
  
  //     editor.updateOptions({
  //       renderLineHighlight: 'all',
  //       highlightActiveIndentGuide: true,
  //       fontSize: 13,
  //       lineHeight: 20,
  //       padding: { top: 4, bottom: 4 },
  //       lineNumbers: 'on',
  //       roundedSelection: false,
  //       scrollBeyondLastLine: false,
  //       readOnly: false,
  //       cursorStyle: 'line',
  //       automaticLayout: true,
  //       wordWrap: 'on',
  //       autoIndent: 'full',
  //       formatOnPaste: true,
  //       formatOnType: false,
  //       suggestOnTriggerCharacters: false,
  //       quickSuggestions: false,
  //       autoClosingBrackets: 'never',
  //       autoClosingQuotes: 'never',
  //       autoSurround: 'never'
  //     });
  
  //     // Track cursor position changes
  //     editor.onDidChangeCursorPosition((e) => {
  //       lastCursorPosition.current = e.position;
  //     });
  
  //     // Handle content changes with proper cursor positioning
  //     editor.onDidChangeModelContent((event) => {
  //       const newContent = editor.getValue();
  //       const currentPosition = editor.getPosition();
        
  //       // Only update if content actually changed
  //       if (newContent !== content) {
  //         onChange(newContent);
          
  //         // Calculate the new cursor position
  //         if (currentPosition) {
  //           const newPosition = {
  //             lineNumber: currentPosition.lineNumber,
  //             column: currentPosition.column
  //           };
  
  //           // Ensure cursor moves forward after typing
  //           if (event.changes.length === 1 && event.changes[0].text) {
  //             newPosition.column = currentPosition.column + 1;
  //           }
  
  //           // Use setTimeout to ensure the position is set after the content update
  //           setTimeout(() => {
  //             editor.setPosition(newPosition);
  //             editor.focus();
  //           }, 0);
  //         }
  //       }
  //     });
  
  //     if (!initialSetupDone.current) {
  //       setTimeout(() => {
  //         const model = editor.getModel();
  //         if (model) {
  //           const lastLine = model.getLineCount();
  //           const lastColumn = model.getLineMaxColumn(lastLine - 1);
  //           editor.setPosition({ lineNumber: lastLine - 1, column: lastColumn - 1 });
  //           editor.focus();
  //           initialSetupDone.current = true;
  //         }
  //       }, 100);
  //     }
  //   };
  
  //   return (
  //     <div className="flex-1 border rounded-sm" style={{ ...style, overflow: 'hidden' }}>
  //       <Editor
  //         height="100%"
  //         defaultLanguage="json"
  //         value={content}
  //         onMount={handleEditorDidMount}
  //         theme="dataweaveTheme"
  //         options={{
  //           minimap: { enabled: false },
  //           overviewRulerLanes: 0,
  //           hideCursorInOverviewRuler: true,
  //           overviewRulerBorder: false,
  //           scrollbar: {
  //             vertical: 'visible',
  //             horizontal: 'visible',
  //             verticalScrollbarSize: 10,
  //             horizontalScrollbarSize: 10,
  //             verticalSliderSize: 10,
  //             horizontalSliderSize: 10,
  //             useShadows: false
  //           }
  //         }}
  //       />
  //     </div>
  //   );
  // };

  const handlePayloadChange = (newContent) => {
    setPayloadContent(newContent);
    // Also update any other necessary state or trigger side effects
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
            className="absolute right-4 top-0 h-full bg-[#E9EEF4] text-[#00044C] border-none outline-none focus:outline-none font-bold text-[18px] flex items-center justify-center font-bold"
          >
            ×
          </button>
        </div>
      )}


      <div className="flex items-center justify-between px-6 py-2 border-b">
        <div className="flex items-center space-x-3">
          {/* <svg
            viewBox="0 0 100 100"
            className="w-8 h-8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="50" fill="#0046BE"/>
            <circle cx="35" cy="35" r="8" fill="white"/>
            <circle cx="65" cy="35" r="8" fill="white"/>
            <circle cx="50" cy="65" r="8" fill="white"/>
            <path d="M35 35 L65 35" stroke="white" strokeWidth="3"/>
            <path d="M65 35 L50 65" stroke="white" strokeWidth="3"/>
            <path d="M35 35 L50 65" stroke="white" strokeWidth="3"/>
          </svg>
          <div className="text-[21px] font-bold text-[#444444] font-['OpenSans']">
            SnapLogic
          </div> */}
           <img
  src="/SnapLogicPlayground1/sl-logo.svg"
  alt="SnapLogic Logo"
  className=" object-contain"
  style={{
    width: isTablet ? '22px' : '32px',
    height: isTablet ? '22px' : '32px'
  }}
/>
<img
  src="/SnapLogicPlayground1/LogoN.svg"
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
    // Always download the file
    const blob = new Blob(['Demo content'], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'snaplogic-playground-export.zip');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);


    // Show dialog if not checked in current session
    if (!wasChecked) {
      setShowExportDialog(true);
    }
  }}
  className="flex items-center px-4 py-1.5 bg-white rounded border-none focus:outline-none group hover:text-blue-500 -ml-3"
>
<img
  src="/SnapLogicPlayground1/cloud-upload-Hover.svg"
  alt="SnapLogic Logo"
 className="mr-2 text-gray-700 group-hover:text-blue-500 text-gray-500 h-4 w-4"
/>
  {/* <Upload className="mr-2 group-hover:text-blue-500 text-gray-500 h-3 w-3" /> */}
  <span className="text-gray-700 font-['Manrope'] group-hover:text-blue-500 text-[0.9rem] tracking-[0.09em] font-['Manrope'] font-normal">Export</span>
</button>








          {showExportDialog && (
            <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
              <div className="bg-white h-[19rem] w-205" style={{ borderRadius: 0 }}>
                <div className="p-6 font-['Manrope']">
                  <h2 className="text-[1.9rem] font-bold mt-[1rem] mb-[2rem] text-gray-700">Open in Visual Studio Code</h2>
                  <div className="h-[1px] bg-gray-200 w-[calc(100%+48px)] -mx-6 mt-4 mb-[1.8rem]"></div>
                  <p className="text-sm mb-3">
                    For the best DataWeave development experience unzip and open the project on <span className="text-blue-500">VSCode</span>
                  </p>
                  <p className="text-sm mb-[3rem]">
                    Don't forget to install the <span className="text-blue-500">DataWeave Playground</span> extension
                  </p>
                  <div className="flex justify-between items-center">
                  <label
  className="flex items-center text-sm cursor-pointer select-none"
  onClick={() => {
    setIsChecked(!isChecked);
    setWasChecked(true);
    // setShowExportDialog(false);
  }}
>
  <div className="w-5 h-5 mr-2 border border-gray-300 flex items-center justify-center bg-white hover:border-gray-400 cursor-pointer" style={{ borderRadius: 0 }}>
    {isChecked && (
      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )}
  </div>
  Don't show popup again
</label>


                    <button
                      onClick={() => setShowExportDialog(false)}
                      className="px-3 py-2.5 text-sm bg-white border border-gray-400 hover:border-gray-400 hover:bg-gray-200 focus:border-none focus:outline-none"
                      style={{ borderRadius: 0 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
                    <button
            onClick={() => {setShowImportDialog(true);
              setSelectedFile(null);
                } }
            className="flex items-center px-4 py-1.5 bg-white rounded border-none focus:outline-none group hover:text-blue-500 -ml-4"
          >
            <img
  src="/SnapLogicPlayground1/cloud-download-Hover.svg"
  alt="SnapLogic Logo"
 className="mr-2 group-hover:text-blue-500 text-gray-500 h-4 w-4"
/>
            {/* <Download className="mr-2 group-hover:text-blue-500 text-gray-500 h-3 w-3" /> */}
            <span className="text-gray-700 group-hover:text-blue-500 text-[0.9rem] font-['Manrope'] tracking-[0.09em] font-normal">Import</span>
          </button>


          {showImportDialog && (
  <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
    <div className="bg-white h-[28.5rem] w-[31rem]" style={{ borderRadius: 0 }}>
      <div className="p-8 pt-10 flex flex-col h-full">
        <h2 className="text-[1.9rem] font-bold text-gray-700">Import project</h2>
        <div className="h-[1px] bg-gray-200 w-[calc(100%+48px)] -mx-6 mt-4 mb-[0.4rem]"></div>
        <div className="mt-6 flex-1 font-['Manrope']">
          <div
            className="border-2 border-dashed border-gray-600 h-[11rem] w-[27.2rem] mx-auto flex flex-col items-center justify-center cursor-pointer hover:border-gray-400"
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
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-center mt-2 text-gray-500">
              {selectedFile ? selectedFile.name : "Drop project zip here or click to upload"}
            </p>
          </div>
          <div className="mt-4 w-[28rem] mx-auto mb-[2.2rem]">
            <p className="text-[#FF0000] text-sm">Upload functionality is only intended for playground exported projects</p>
            <p className="text-[#FF0000] text-sm mt-1 ml-[3.5rem]">Importing modified files may yield an invalid project.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setShowImportDialog(false)}
            className="px-3 py-2.5 text-sm bg-white border border-gray-400 hover:border-gray-400 hover:bg-gray-200 focus:border-none focus:outline-none"
            style={{ borderRadius: 0 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}




          <div className="h-6 w-[1px] bg-gray-500 mx-4"></div>


          <div className="space-x-8 text-[0.82rem] font-bold text-[#333333] relative font-['Manrope'] flex items-center">
      {['blogs', 'docs', 'tutorial', 'playground'].map(item => (
        <a
          key={item}
          href={getNavLink(item)}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-black hover:text-blue-500 px-2 py-2 relative ${
            activeNavItem === item
              ? 'after:content-[""] after:absolute  after:left-0 after:right-0 after:h-0.5 after:bg-[#1B4E8D] after:-bottom-[0.5rem] z-10'
              : ''
          }`}
          onClick={() => handleNavClick(item)}
        >
          {item.toUpperCase()}
        </a>
      ))}
    </div>
        </div>
      </div>
{/* main content */}


      <div className="flex flex-1 overflow-hidden h-[calc(100vh-100px)]" style={responsiveStyles.mainContainer}>
        <div style={{...resizableStyles(leftWidth,'left'),...responsiveStyles.panels}} className="flex-shrink-0 border-r flex flex-col relative h-full overflow-hidden ">
          {isPayloadView ? (
            <div className="flex flex-col h-full overflow-auto"
            style={{...scrollbarStyle}}>
              <div className="border-b">
  <div className="flex justify-center items-center h-[30px] px-2 min-w-[200px]">
    <div className="flex items-center gap-1 ">
      <button onClick={handleBackClick} className="text-gray-600 bg-white  border-none outline-none h-[30px] flex items-center focus:outline-none focus:border-none flex-shrink-0">
        {/* <ChevronLeft className="h-4 w-4" /> */}
        <img
  src="/SnapLogicPlayground1/toolbarExpand-Active.svg"
  alt="SnapLogic Logo"
  className="w-3 h-3 flex-shrink-0 "
/>
      </button>
     
      <span className="font-bold font-['Manrope'] text-gray-600 text-xs mr-4">PAYLOAD</span>
    </div>
    <FormatDropdown onFormatChange={handleFormatChange} />
  </div>
</div>

          {/* <HighlightedJSON
            content={jsonContent}
            onChange={handleEditorChange}
            style={{ height: '100%' }}
          /> */}
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
          ) : (
            <>
            <div className="h-1/2 border-b overflow-auto" style={responsiveStyles.panels}>
            <div className="border-b">
  <div className="flex justify-between items-center h-[30px]  px-4">
    <span className="font-bold text-gray-600  font-['Manrope'] text-xs">INPUT EXPLORER</span>
    <button
      onClick={() => setShowInputContainer(true)}
      className="text-l bg-white  text-gray-500 border-none focus:outline-none h-[30px] flex items-center border-r-2"
      style={{ borderRight: "0px" }}
    >
      {/* + */}
      <img
  src="/SnapLogicPlayground1/add-Hover.svg"
  alt="SnapLogic Logo"
 className="text-gray-500 h-3 w-3"
/>


    </button>
  </div>
</div>








{showInputContainer && (
    <>
   <div className="fixed inset-0 bg-black/75 z-40" />
   <div className="fixed inset-0 z-50 flex items-center justify-center">
   <div className="w-[31.5rem] h-[19rem] bg-gray-100 p-6 shadow-md">
      <div className="mb-3 font-['Manrope']">
        <h2 className="text-[31px] font-bold text-[#444444] mb-7 ml-2 mt-4">
          Create new input
        </h2>
        <div className="border-b border-gray-200 mt-5 -mx-6"></div>
      </div>
      <div className="py-2">
<div className="flex items-center justify-between">
        <label className="block text-sm font-small text-[#262626]  text-[14px] mb-2 ml-1">
          Identifier
        </label>
<div className="w-3.5 h-3.5 rounded-full font-bold border border-gray-900 flex items-center justify-center text-[0.7rem] text-gray-900 mb-2">
      i
    </div>
  </div>
        <input
  value={newInput}
  onChange={handleInputChange}
  className="w-full text-[15px] ml-1 h-11 px-3  outline-none bg-gray-200 border-t-0 border-b-0 border-l-gray-300 border-l-[3px] mt-1 border-r-gray-300 border-r-[3px] hover:bg-gray-100 hover:border-t-0 hover:border-b-0 hover:border-l-gray-400 hover:border-r-gray-400 focus:bg-gray-100 focus:border-t-0 focus:border-b-0 focus:border-l-gray-600 focus:border-r-gray-600"
  style={{
    borderTop: "0",
    borderBottom: "0",
    outline: "none"
  }}
/>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setShowInputContainer(false)}
          className="h-10 px-4 text-sm  font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-200  rounded-none"
          style={{ borderColor: "rgb(209 213 219)",outline: "none" }}
        >
       
          Cancel
        </button>
         <button
          disabled={isCreateInputDisabled}
          onClick={() => {
            handleCreateInput();
            setShowInputContainer(false);
          }}
          className={`h-10 px-4 text-sm  rounded-none font-medium ${
            isCreateInputDisabled
              ? "text-black bg-gray-300 cursor-not-allowed"
              : "text-white bg-blue-500 hover:bg-blue-600 cursor-pointer"
          }`}
          style={{
            border: "none",
            outline: "none"
          }}
        >
          Create
        </button>
      </div>
    </div>
  </div>
  </>
)}
              <div className="w-full  pt-2">
  {inputs.map((input, index) => (
    <div
      key={index}
      className="flex items-center  text-sm text-gray-600 cursor-pointer p-1 w-full  hover:bg-gray-100 p-1 hover:rounded-r-full"
      onClick={() => handleInputClick(input, index)}
    >
      <span className="text-blue-500 px-4">json</span>
      <span>{input}</span>
    </div>
  ))}
</div>
              </div>
              <div className="h-1/2 overflow-auto" style={responsiveStyles.panels}>
              <div className="border-b">
  <div className="flex justify-between items-center h-[30px] px-4">
    <span className="font-bold text-gray-600 font-['Manrope'] text-xs">SCRIPT EXPLORER</span>
    <button
      onClick={() => setShowScriptContainer(true)}
      className="text-l text-gray-500 bg-white text-gray-300 border-none focus:outline-none h-[30px] flex items-center border-r-2"
      style={{ borderRight: "0px" }}
    >
      {/* + */}
      <img
  src="/SnapLogicPlayground1/add-Hover.svg"
  alt="SnapLogic Logo"
 className="text-gray-500 h-3 w-3"
/>
    </button>
  </div>
</div>
{showScriptContainer && (
    <>
   <div className="fixed inset-0 bg-black/75 z-40" />
   <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="w-[31.5rem] h-[19rem] bg-gray-100 p-6 shadow-md ">
      <div className="mb-3 font-['Manrope']">
        <h2 className="text-[31px] font-bold text-[#444444] mb-7 ml-2 mt-4">
          Create new script
        </h2>
        <div className="border-b border-gray-200 mt-5 -mx-6"></div>
      </div>
      <div className="py-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-small text-[#262626] text-[14px] mb-2 ml-1">
          Identifier
        </label>
        <div className="w-3.5 h-3.5 rounded-full font-bold border border-gray-900 flex items-center justify-center text-[0.7rem] text-gray-900 mb-2">
      i
    </div>
  </div>
  <input
  value={newScript}
  onChange={handleScriptChange}
  className="w-full ml-1 h-11 text-[14px] px-3 text-lg outline-none bg-gray-200 border-t-0 border-b-0 border-l-gray-300 border-l-[3px] mt-1 border-r-gray-300 border-r-[3px] hover:bg-gray-100 hover:border-t-0 hover:border-b-0 hover:border-l-gray-400 hover:border-r-gray-400 focus:bg-gray-100 focus:border-t-0 focus:border-b-0 focus:border-l-gray-600 focus:border-r-gray-600"
  style={{
    borderTop: "0",
    borderBottom: "0",
    outline: "none"
  }}
/>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setShowScriptContainer(false)}
          className="h-10 px-4 text-sm  font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-200  rounded-none"
          style={{ borderColor: "rgb(209 213 219)",outline: "none" }}
        >
          Cancel
        </button>
        <button
          disabled={isCreateScriptDisabled}
          onClick={() => {
            handleCreateScript();
            setShowScriptContainer(false);
          }}
          className={`h-10 px-4 text-sm  rounded-none font-medium ${
            isCreateScriptDisabled
              ? "text-black bg-gray-300 cursor-not-allowed"
              : "text-white bg-blue-500 hover:bg-blue-600 cursor-pointer"
          }`}
          style={{
            border: "none",
            outline: "none"
          }}
        >
          Create
        </button>
      </div>
    </div>
  </div>
  </>
)}
                <div className="w-full  pt-2 ">
                {scripts.map((script) => (
  <div
  key={script.id}
  className={`flex items-center text-sm text-gray-600 p-1.5 cursor-pointer w-full group ${
    activeScript?.id === script.id
      ? 'bg-gray-100 relative before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[2px] before:bg-blue-500 after:absolute after:top-0 after:bottom-0 after:right-0 after:w-[2px] after:bg-blue-500 after:rounded-r-full group-hover:rounded-r-full after:group-hover:rounded-r-full hover:bg-gray-200'
      : 'hover:bg-gray-200 hover:rounded-r-full'
  }`}
  onClick={() => handleScriptSelect(script)}
>
  <span className="px-4">{script.name}</span>
</div>




))}


</div>
              </div>
            </>
          )}
        </div>


        {/* Left Resize Handle */}
        <div
          className="w-[2px] bg-gray-200 relative"
          onMouseDown={(e) => handleMouseDown(e, true)}
        >
          <div
            className="absolute -left-2 -right-2 top-0 bottom-0 hover:cursor-ew-resize"
            style={{ cursor: isDragging ? 'ew-resize' : 'ew-resize' }}
          >
            <div className="w-[1px] h-full mx-auto hover:bg-blue-500" />
          </div>
        </div>
                {/* Middle Panel */}
                <div style={{...resizableStyles(middleWidth,'middle'), ...responsiveStyles.panels}} className="flex-1 border-r  flex flex-col relative">
          <div className="border-b">
            <div className="flex items-center justify-between min-h-[30px] px-4">
              <span className="font-bold text-gray-600 font-['Manrope'] text-xs">SCRIPT</span>
              <div className="flex items-center">
                {outputMatch ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-gray-500  font-['Manrope'] text-[12px]">SUCCESS</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-gray-500 font-['Manrope'] text-xs">FAILURE</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-2 pl-2 pr-0 flex flex-1 font-mono text-sm h-full font-['Manrope'] relative "
          style={{ overflow: 'hidden' }}>
            <div className="flex flex-1 " style={scrollbarStyle}>
  {/* <div className="w-12 text-right pr-4 select-none flex-shrink-0">
  {Array.from({ length: getLineCount(scriptContent) }, (_, i) => (
    <div key={i} className="text-blue-400 h-6 leading-6">
      {i + 1}
    </div>
  ))}
  </div>
  <ActiveLineBorder />
  <textarea
    value={scriptContent}
    onChange={handleScriptContentChange}
    onKeyUp={(e) => {
      const lines = e.target.value.substr(0, e.target.selectionStart).split('\n');
      setActiveLineIndex(lines.length - 1);
    }}
    onClick={(e) => {
      const lines = e.target.value.substr(0, e.target.selectionStart).split('\n');
      setActiveLineIndex(lines.length - 1);
    }}
    className={`flex-1 outline-none bg-white resize-none overflow-auto leading-6 relative w-full pr-0`}
    style={{
      lineHeight: '1.5rem',
      // ...scrollbarStyle
      // backgroundImage: `linear-gradient(transparent ${activeLineIndex * 24}px, #f3f4f6 ${activeLineIndex * 24}px, #f3f4f6 ${(activeLineIndex + 1) * 24}px, transparent ${(activeLineIndex + 1) * 24}px)`
    }}
  /> */}
  <HighlightedScript
      content={scriptContent}
      onChange={(newContent) => {
        handleScriptContentChange({ target: { value: newContent } });
        const lines = newContent.split('\n');
        setActiveLineIndex(lines.length - 1);
      }}
      activeLineIndex={activeLineIndex}
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
            backgroundColor: '#1e1e1e',
            zIndex: 11
          }}
        />


</div>




        </div>


        {/* Right Resize Handle */}
        <div
          className="w-[2px] bg-gray-200 relative"
          onMouseDown={(e) => handleMouseDown(e, false)}
        >
          <div
            className="absolute -left-2 -right-2 top-0 bottom-0 hover:cursor-ew-resize"
            style={{ cursor: isDragging ? 'ew-resize' : 'ew-resize' }}
          >
            <div className="w-[1px] h-full mx-auto hover:bg-blue-500" />
          </div>
        </div>
                {/* Right Panel */}
                <div style={{...resizableStyles(rightWidth,'right'), ...responsiveStyles.panels}} className="flex-shrink-0  flex flex-col h-full relative overflow-hidden">
          {/* Actual Output Section */}
          <div className="h-1/2 border-b overflow-hidden">
            <div className="border-b">
              <div className="flex justify-between items-center h-[30px] px-4">
                <span className="font-bold text-gray-600 font-['Manrope'] text-xs">ACTUAL OUTPUT</span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 font-['Manrope']">
                    <FormatDropdown />
                   
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 font-mono text-sm font-['Manrope'] h-[calc(100%-30px)]  "
            >
               <HighlightedActualOutput
  actualOutput={actualOutput}
  onActualOutputChange={handleActualOutputChange}
/>
    {/* <div className="flex">
        {renderLineNumbers(actualLines)}
       
        <textarea
            value={actualOutput}
            readOnly={true}
            spellCheck="false"
            className="flex-1 bg-transparent outline-none resize-none  text-red-500 font-mono text-sm cursor-text "
            style={{
           
                ...textAreaStyles,
                WebkitUserModify: 'read-only',
                userModify: 'read-only',
                height: 'auto',
                minHeight: '100%'
            }}
        />
        <HighlightedActualOutput
        actualOutput={actualOutput}
        actualLines={actualLines}
        scrollbarStyle={scrollbarStyle}
        textAreaStyles={textAreaStyles}
      />
    </div> */}
</div>


          </div>
          {/* Expected Output Section */}
          <div className="h-1/2">
            <div className="border-b">
              <div className="flex justify-between items-center h-[30px] px-4">
                <span className="font-bold text-gray-600 font-['Manrope'] text-xs">EXPECTED OUTPUT</span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 font-['Manrope']">
                    <FormatDropdown />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 font-mono text-sm font-['Manrope'] h-[calc(100%-30px)] overflow-auto "
            style={scrollbarStyle}>
              <HighlightedExpectedOutput
  expectedOutput={expectedOutput}
  onExpectedOutputChange={handleExpectedOutputChange}
/>
              {/* <div className="flex">
                {renderLineNumbers(expectedLines)}
                <textarea
                  value={expectedOutput}
                  onChange={handleExpectedOutputChange}
                  className="flex-1 bg-transparent outline-none resize-none  text-red-500 font-mono text-sm"
                  style={{textAreaStyles}}
                />
              </div> */}
            </div>
          </div>
        </div>
        </div>


{/* Bottom Bar */}
<div
  className="border-t relative flex flex-col   "
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
      // Set maximum height to 250px to prevent collision with input explorer
      setBottomHeight(Math.max(32, Math.min(250, newHeight)));
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
  <div className="w-full h-[1.5px] bg-gray-200 group-hover:bg-blue-500 transition-colors" />
</div>




  <div className="flex items-center justify-between h-8 bg-[#E6EEF4] font-['Manrope'] bg-white relative">
  <div className="flex space-x-4 pl-2 pr-8 z-10">
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
              setBottomHeight(32);
            }
          }}
          className="text-[11px] h-7 px-2 bg-white flex items-center hover:bg-gray-100 cursor-pointer outline-none focus:outline-none focus:ring-0 rounded-none border-none"
        >
          <Terminal className="h-3 w-3" />
          <span className='ml-2 text-gray-600 tracking-[0.03em]'>LOG VIEWER</span>
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
              setBottomHeight(32);
            }
          }}
          className="text-[11px] h-7 px-2 bg-white flex items-center hover:bg-gray-100 cursor-pointer outline-none focus:outline-none focus:ring-0 rounded-none border-none"
        >
          <Book className="h-3 w-3" />
          <span className="ml-2 font-['Manrope'] text-gray-600 tracking-[0.03em]">API REFERENCE</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={15} className="h-2 w-5 rounded-full bg-gray-800 p-0 border-0" />
    </Tooltip>
  </TooltipProvider>
</div>












    <span className=" font-['Manrope'] text-sm text-gray-400 absolute left-[calc(45%+0px)] tracking-[0.03em] flex items-center h-full z-10">
      {/* ©2023 Snaplogic LLC, a Salesforce company */}
      SnapLogic Playground – Redefining Integration.
    </span>
    {/* Resize Handle */}
   
  </div>
          {/* Content */}
          {isBottomExpanded && (
          <div className="flex-1 overflow-auto">
            <div className="h-[calc(100%-2rem)] overflow-auto">
              <div className="flex flex-col justify-center items-center h-full">
                {activeTab === 'log' && (
                  <>
                    <h2 className="text-xl font-bold text-black mb-4 font-['Manrope'] ">No Logs Available</h2>
                    <p className="text-sm font-['Manrope'] tracking-[0.04em]">
                      Learn more about the
                      <span className="mx-1 bg-gray-100 px-2 py-1 rounded-none font-['Manrope'] tracking-[0.04em]">jsonPath</span>
                      function in the
                      <span className="text-sky-500 font-['Manrope'] tracking-[0.04em]">  API Reference</span>
                    </p>
                  </>
                )}
               
                {activeTab === 'api' && (
                  <div className="w-full h-full flex">
                    {/* Left Navigation */}
                    <div className="w-64 border-r overflow-y-auto"
                    style={{...scrollbarStyle, ...responsiveStyles.panels}}>
                      <nav className="p-4">
                        <ul className="space-y-2 font-['Manrope']">
                          <li className="font-semibold text-sm">Getting Started</li>
                          <li className="text-blue-500 text-sm cursor-pointer pl-4">Understanding Expressions</li>
                          <li className="text-gray-600 text-sm cursor-pointer pl-4">Expression Types</li>
                          <li className="text-gray-600 text-sm cursor-pointer pl-4">Syntax Guide</li>
                          <li className="text-gray-600 text-sm cursor-pointer pl-4">Common Functions</li>
                          <li className="font-semibold text-sm mt-4">Advanced Topics</li>
                          <li className="text-gray-600 text-sm cursor-pointer pl-4">Complex Expressions</li>
                          <li className="text-gray-600 text-sm cursor-pointer pl-4">Best Practices</li>
                          <li className="text-gray-600 text-sm cursor-pointer pl-4">Troubleshooting</li>
                        </ul>
                      </nav>
                    </div>


                    {/* Right Content */}
                    <div className="flex-1 overflow-y-auto"
                    style={scrollbarStyle}>
                      <div className="p-6 font-['Manrope']">
                        <h1 className="text-2xl font-bold mb-6">Understanding Expressions</h1>
                        <div className="space-y-6">
                          <section>
                            <h2 className="text-lg font-semibold mb-3">Overview</h2>
                            <p className="text-gray-700">
                              SnapLogic expressions provide a powerful way to transform and manipulate data within your pipelines.
                            </p>
                          </section>


                          <section>
                            <h2 className="text-lg font-semibold mb-3">Expression Types</h2>
                            <ul className="list-disc pl-6 space-y-2">
                              <li>JSONPath expressions for data navigation</li>
                              <li>Pipeline parameters for configuration</li>
                              <li>JavaScript expressions for complex logic</li>
                              <li>Runtime expressions for dynamic behavior</li>
                            </ul>
                          </section>


                          <section>
                            <h2 className="text-lg font-semibold mb-3">Examples</h2>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <pre className="text-sm font-mono">
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
        <ResizeHandle/>
      </div>
    </div>
  );
};


export default SnaplogicPlayground3;































