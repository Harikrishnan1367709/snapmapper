import React, { useEffect, useMemo, useRef, useState } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { ChevronDown, Upload, Download, Terminal, Book, ChevronLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid"
import { Link } from 'react-router-dom';
import JSZip from 'jszip';



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

import HighLightedJSON from './utils/HighLightedJson';
import HighlightedScript from './utils/HighlightedScript';
import HighlightedActualOutput from './utils/HighlightedActualOutput';
import HighlightedExpectedOutput from './utils/HighlightedExpectedOutput';
import SnapLogicFunctionsHandler from './utils/SnaplogicFunctionsHandler';
import { Documentation } from './components/ui/Documentation';
import SupportButton from './components/ui/supportButton';
import SnapLogicTutorial from './components/ui/snaplogicTutorial';
import { createClient } from "@supabase/supabase-js";
import Joyride, { STATUS } from 'react-joyride';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);















const UpdatedCode = () => {


  const [tutorialScriptContent, setTutorialScriptContent] = useState('');
const [tutorialOutput, setTutorialOutput] = useState("");
const [tutorialExerciseSuccess, setTutorialExerciseSuccess] = useState(false);
  const [isGuideActive, setIsGuideActive] = useState(true);

  const steps = [
    {
      target: '.input-explorer-section',
      content: 'Place to see,add and edit your input payload',
      placement: 'left',
      disableBeacon: true
    },
    {
      target: '.script-explorer-section',
      content: 'Place to see and add the script files',
      placement: 'left',
      disableBeacon: true
    },
    {
      target: '.script-section',
      content: 'Write your transformation script here',
      placement: 'bottom'
    },
    {
      target: '.actual-output-section',
      content: 'See your transformed output here',
      placement: 'right'
    },
    {
      target: '.expected-output-section',
      content: 'write your expected output here',
      placement: 'right'
    }
  ];

  const joyrideStyles = {
    options: {
      arrowColor: '#fff',
      backgroundColor: '#fff',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      primaryColor: '#007bff',
      textColor: '#333',
      width: 300,
      zIndex: 10000,
    },
    tooltip: {
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    },
    buttonNext: {
      backgroundColor:'rgb(27, 78, 141)',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '4px'
    },
    buttonBack: {
      marginRight: '10px',
      color: '#666'
    },
    buttonSkip: {
      color: '#666'
    }
  };

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setIsGuideActive(false);
    }
  };



 

  const [showSolution, setShowSolution] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentSubTopicIndex, setCurrentSubTopicIndex] = useState(0);
  const [openSections, setOpenSections] = useState(['introduction']); 
 
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // const [showDocumentation, setShowDocumentation] = useState(false);
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
  [inputs[0]]: JSON.stringify({
    Message: "Hello World!"
  }, null, 2)
});




  const [isPayloadView, setIsPayloadView] = useState(false);
  const [selectedInputIndex, setSelectedInputIndex] = useState(null);
  const [payloadContent, setPayloadContent] = useState('{\n\n}');
  const [outputMatch, setOutputMatch] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('Mapper');
  const [currentView, setCurrentView] = useState('Mapper');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  // const [activeInput, setActiveInput] = useState('Payload');
 
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
 
  const [expectedOutput, setExpectedOutput] = useState('{}');
  const [actualOutput, setActualOutput] = useState('[\n  "Phone"\n]');
  const [scripts, setScripts] = useState([
    {
      id: 1,
      name: 'main.slexpr',
      content: '$',
      lastModified: new Date()
    }
  ]);
 




  // const [activeScript, setActiveScript] = useState(scripts[0]);
  const [activeScript, setActiveScript] = useState(null);
const [scriptContent, setScriptContent] = useState('');
  const [newScript, setNewScript] = useState("");
  // const [scriptContent, setScriptContent] = useState(scripts[0].content);

  useEffect(() => {
    if (scripts.length > 0 && !activeScript) {
      const mainScript = scripts.find(s => s.name === 'main.slexpr') || scripts[0];
      setActiveScript(mainScript);
      setScriptContent(mainScript.content);
    }
  }, []);
  const ExplanationPanel = ({ content }) => {
    // Function to preserve formatting
    const formatContent = (text) => {
      return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ));
    };
  
    return (
      <div className="p-6 overflow-auto">
        <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
          {content}
        </pre>
      </div>
    );
  };
  

  const tutorialData = [
    {
      id: 'what-is-SnapMapper',
          title: '1 - What is SnapMapper',
          content: `SnapMapper is an interactive environment designed for developers and integration specialists to experiment with SnapLogic's expression language and data transformation capabilities.
  
  Key Features:
  • Interactive Expression Testing
    - Real-time validation
    - Immediate feedback
    - Syntax highlighting
  
  • Multiple Input Support
    - JSON data
  
  • Advanced Debugging
    - Step-by-step execution
    - Error tracking
  
  • Learning Environment
    - Built-in examples
    - Documentation access
    - Best practices guides`,
      subTopics: [
    
        {
          id: 'why SnapMapper',
          title: '1.1 - Why SnapMapper',
          content: `SnapMapper offers several key advantages for developers and integration specialists:
  
  1. Rapid Prototyping
     • Test expressions instantly
     • Validate transformations
     • Experiment with different approaches
     • Quick iteration cycles
  
  2. Learning and Development
     • Safe environment for learning
     • Interactive documentation
     • Real-world examples
     • Best practices implementation
  
  3. Collaboration
     • Share expressions with team
     • Standardize approaches
     • Knowledge transfer
     • Code review support
  
  4. Productivity
     • Faster development
     • Reduced errors
     • Immediate feedback
     • Enhanced debugging`,
  
  
        },
        {
          id: 'ui-overview',
          title: '1.2 - User Interface Overview',
          content: `The SnapMapper interface is organized into several key areas:
      
      1. Navigation Bar
         • Project management
         • Documentation links
         • User preferences
      
      2. Input Panel
         • Data entry
         • File upload
         • Format selection
         • Template library
      
      3. Expression Editor
         • Code editing
         • Syntax highlighting
         • Error detection
      
      4. Output Panel
         • Results display
         • Error messages
         • Debug information
      
      5. Documentation Panel
         • Function reference
         • Examples
         • Tutorials
         • Best practices`,
      
      
        },
        {
          id: 'core-functionalities',
          title: '1.3 - Core Functionalities',
          content: `SnapMapper provides essential core functionalities for integration development:
      
      1. Data Transformation
         • JSON path queries
         • Data mapping
         • Structure modification
      
      2. Expression Processing
         • Syntax validation
         • Runtime execution
         • Error handling
         • Performance optimization
      
      3. Testing and Debugging
         • Real-time validation
         • Error detection
         • Step-through debugging
      
      4. Project Management
         • Save expressions
         • Share code
         • Import/Export`,
      
        },
      ]
    },
   
    {
      id: 'functions',
      title: '2 - Functions',
      content: 'SnapLogic provides a comprehensive set of built-in functions for data manipulation and transformation.',
      subTopics: [
        {
          id: 'string-functions',
          title: '2.1 - String Functions',
          content: `String functions in SnapLogic provide powerful capabilities for manipulating and transforming text data. These functions help you modify, search, and extract information from strings.

Available String Functions:
• toUpperCase()
• toLowerCase()
• length()
• trim()
• camelCase()
• kebabCase()()
• upperFirst()
• lowerFirst()
• charAt()
• charCodeAt()


`,
          subTopics: [
            {
              id: 'toUpperCase',
              title: '2.1.1 - toUpperCase()',
              content: `Converts all characters in a string to uppercase. Useful for standardizing text like "Mulecraft" to "MULECRAFT".`,
              codeExample: {
                input: `
{
  "text": "mulecraft"
}`,
                script: `$text.toUpperCase()`,
                output: `"MULECRAFT"`
              },
              exercise: {
                description: `Convert the input string to uppercase to get "MULECRAFT".`,
                expectedOutput: `"MULECRAFT"`,
                input: `
{
"text": "mulecraft"
}`
              }
            },
            {
              id: 'toLowerCase',
              title: '2.1.2 - toLowerCase()',
              content: `Converts all characters in a string to lowercase. Transforms "MULECRAFT" to "mulecraft" for consistent formatting.`,
              codeExample: {
                input: `
{
  "text": "MULECRAFT"
}`,
                script: `$text.toLowerCase()`,
                output: `"mulecraft"`
              },
              exercise: {
                description: `Convert the input string to lowercase to get "mulecraft".`,
                expectedOutput: `"mulecraft"`,
                input: `
{
"text": "MULECRAFT"
}`
              }
            },
            {
              id: 'length',
              title: '2.1.3 - length()',
              content: `Returns the length of the string. For example, "Mulecraft" has 9 characters.`,
              codeExample: {
                input: `
{
  "text": "Mulecraft"
}`,
                script: `$text.length()`,
                output: `9`
              },
              exercise: {
                description: `Get the length of the "Mulecraft" string.`,
                expectedOutput: `9`,
                input: `
{
  "text": "Mulecraft"
}`
              }
            },
            {
              id: 'trim',
              title: '2.1.4 - trim()',
              content: `Removes whitespace from both ends of a string. Cleans up "  Mulecraft  " to "Mulecraft".`,
              codeExample: {
                input: `
{
  "text": "  Mulecraft  "
}`,
                script: `$text.trim()`,
                output: `"Mulecraft"`
              },
              exercise: {
                description: `Trim spaces from around "Mulecraft" to get "Mulecraft".`,
                expectedOutput: `"Mulecraft"`,
                input: `
{
  "text": "  Mulecraft  "
}`
              }
            },
            {
              id: 'camelCase',
              title: '2.1.5 - camelCase()',
              content: `Converts string to camelCase format. Transforms "mule craft" or "Mule Craft" to "muleCraft".`,
              codeExample: {
                input: `
{
  "text": "mule craft"
}`,
                script: `$text.camelCase()`,
                output: `"muleCraft"`
              },
              exercise: {
                description: `Convert the phrase "Mule Craft" to camelCase.`,
                expectedOutput: `"muleCraft"`,
                input: `
{
  "text": "Mule Craft"
}`
              }
            },
            {
              id: 'kebabCase',
              title: '2.1.6 - kebabCase()',
              content: `Converts string to kebab-case format. Changes "MuleCraft" to "mule-craft".`,
              codeExample: {
                input: `
{
  "text": "MuleCraft"
}`,
                script: `$text.kebabCase()`,
                output: `"mule-craft"`
              },
              exercise: {
                description: `Convert "MuleCraft" to kebab-case.`,
                expectedOutput: `"mule-craft"`,
                input: `
{
  "text": "MuleCraft"
}`
              }
            },
            {
              id: 'upperFirst',
              title: '2.1.7 - upperFirst()',
              content: `Converts the first character of a string to uppercase. Turns "mulecraft" into "Mulecraft".`,
              codeExample: {
                input: `
{
  "text": "mulecraft"
}`,
                script: `$text.upperFirst()`,
                output: `"Mulecraft"`
              },
              exercise: {
                description: `Capitalize only the first letter of "mulecraft" to get "Mulecraft".`,
                expectedOutput: `"Mulecraft"`,
                input: `
{
  "text": "mulecraft"
}`
              }
            },
            {
              id: 'lowerFirst',
              title: '2.1.8 - lowerFirst()',
              content: `Converts the first character of a string to lowercase. Changes "Mulecraft" to "mulecraft".`,
              codeExample: {
                input: `
{
  "text": "Mulecraft"
}`,
                script: `$text.lowerFirst()`,
                output: `"mulecraft"`
              },
              exercise: {
                description: `Convert only the first character of "Mulecraft" to lowercase to get "mulecraft".`,
                expectedOutput: `"mulecraft"`,
                input: `
{
  "text": "Mulecraft"
}`
              }
            },
            {
              id: 'charAt',
              title: '2.1.9 - charAt()',
              content: `Returns the character at the specified index. For "Mulecraft", index 4 returns "c".`,
              codeExample: {
                input: `
{
  "text": "Mulecraft"
}`,
                script: `$text.charAt(4)`,
                output: `"c"`
              },
              exercise: {
                description: `Find the character at index 4 in "Mulecraft" (zero-based index).`,
                expectedOutput: `"c"`,
                input: `
{
  "text": "Mulecraft"
}`
              }
            },
            {
              id: 'charCodeAt',
              title: '2.1.10 - charCodeAt()',
              content: `Returns the Unicode value of the character at the specified index. For "Mulecraft", index 0 ("M") returns 77.`,
              codeExample: {
                input: `
{
  "text": "Mulecraft"
}`,
                script: `$text.charCodeAt(0)`,
                output: `77`
              },
              exercise: {
                description: `Get the Unicode value of the first character in "Mulecraft".`,
                expectedOutput: `77`,
                input: `
{
  "text": "Mulecraft"
}`
              }
            }
          ]
        },
        {
          id: 'array-functions',
          title: '2.2 - Array Functions',
          content: `Array functions in SnapLogic provide powerful capabilities for manipulating and transforming arrays. These functions help you modify, search, and process collections of data.

Available Array Functions:
• length()
• indexOf()
• findIndex()
• find()
• map()
• filter()
• sort()
• concat()
• join()
• slice()`,
          subTopics: [
            {
              "id": "length",
              "title": "2.2.1 - length()",
              "content": "Returns the number of elements in an array.",
              "codeExample": {
                "input": `
{
  "numbers": [1, 2, 3, 4, 5]
}`,
                "script": `$numbers.length()`,
                "output": `5`
              },
              "exercise": {
                "description": "Get the number of elements in the array [10, 20, 30, 40].",
                "expectedOutput": "4",
                "input": `
{
  "numbers": [10, 20, 30, 40]
}`
              }
            },
            {
              "id": "indexOf",
              "title": "2.2.2 - indexOf()",
              "content": "Returns the first index at which a given element can be found in the array.",
              "codeExample": {
                "input": `
{
  "numbers": [1, 2, 3, 4, 5]
}`,
                "script": `$numbers.indexOf(3)`,
                "output": `2`
              },
              "exercise": {
                "description": "Find the index of 50 in the array [10, 20, 50, 40].",
                "expectedOutput": "2",
                "input": `
{
  "numbers": [10, 20, 50, 40]
}`
              }
            },
            {
              "id": "findIndex",
              "title": "2.2.3 - findIndex()",
              "content": "Returns the index of the first element in the array that satisfies the provided testing function.",
              "codeExample": {
                "input": `
{
  "numbers": [1, 2, 3, 4, 5]
}`,
                "script": `$numbers.findIndex((item) => item > 3)`,
                "output": `3`
              },
              "exercise": {
                "description": "Find the index of the first number greater than 25 in the array [10, 20, 30, 40].",
                "expectedOutput": "2",
                "input": `
{
  "numbers": [10, 20, 30, 40]
}`
              }
            },
            {
              "id": "find",
              "title": "2.2.4 - find()",
              "content": "Returns the first element in the array that satisfies the provided testing function.",
              "codeExample": {
                "input": `
{
  "numbers": [1, 2, 3, 4, 5]
}`,
                "script": `$numbers.find((item) => item > 3)`,
                "output": `4`
              },
              "exercise": {
                "description": "Find the first number greater than 25 in the array [10, 20, 30, 40].",
                "expectedOutput": "30",
                "input": `
{
  "numbers": [10, 20, 30, 40]
}`
              }
            },
            {
              "id": "map",
              "title": "2.2.5 - map()",
              "content": "Creates a new array with the results of calling a provided function on every element.",
              "codeExample": {
                "input": `
{
  "numbers": [1, 2, 3, 4, 5],
  "words": ["Hello", "World", "!"]
}`,
                "script": `$numbers.map((item) => item * 2)
$words.map((word) => word.toUpperCase())`,
                "output": `[2, 4, 6, 8, 10]
["HELLO", "WORLD", "!"]`
              },
              "exercise": {
                "description": "Multiply each number in the array [1, 2, 3] by 3.",
                "expectedOutput": "[3, 6, 9]",
                "input": `
{
  "numbers": [1, 2, 3]
}`
              }
            },
            {
              "id": "filter",
              "title": "2.2.6 - filter()",
              "content": "Creates a new array with all elements that pass the test implemented by the provided function.",
              "codeExample": {
                "input": `
{
  "numbers": [1, 2, 3, 4, 5],
  "words": ["Hello", "World", "!"]
}`,
                "script": `$numbers.filter((num) => num > 2)
$words.filter((word) => word.length > 3)`,
                "output": `[3, 4, 5]
["Hello", "World"]`
              },
              "exercise": {
                "description": "Filter the array [10, 15, 20, 25] to keep only numbers greater than 15.",
                "expectedOutput": "[20, 25]",
                "input": `
{
  "numbers": [10, 15, 20, 25]
}`
              }
            },
            {
              "id": "sort",
              "title": "2.2.7 - sort()",
              "content": "Sorts the elements of an array in place and returns the sorted array.",
              "codeExample": {
                "input": `
{
  "numbers": [5, 2, 4, 1, 3],
  "words": ["World", "Hello", "!"]
}`,
                "script": `$numbers.sort()
$words.sort()`,
                "output": `[1, 2, 3, 4, 5]
["!", "Hello", "World"]`
              },
              "exercise": {
                "description": "Sort the array [30, 10, 50, 20] in ascending order.",
                "expectedOutput": "[10, 20, 30, 50]",
                "input": `
{
  "numbers": [30, 10, 50, 20]
}`
              }
            },
            {
              "id": "concat",
              "title": "2.2.8 - concat()",
              "content": "Merges two or more arrays and returns a new array.",
              "codeExample": {
                "input": `
{
  "array1": [1, 2, 3],
  "array2": [4, 5, 6]
}`,
                "script": `$array1.concat($array2)`,
                "output": `[1, 2, 3, 4, 5, 6]`
              },
              "exercise": {
                "description": "Concatenate the arrays [1, 2] and [3, 4].",
                "expectedOutput": "[1, 2, 3, 4]",
                "input": `
{
  "array1": [1, 2],
  "array2": [3, 4]
}`
              }
            },
            {
              "id": "join",
              "title": "2.2.9 - join()",
              "content": "Joins all elements of an array into a string.",
              "codeExample": {
                "input": `
{
  "words": ["Hello", "World", "!"]
}`,
                "script": `$words.join(" ")`,
                "output": `"Hello World !"`
              },
              "exercise": {
                "description": "Join the array [\"I\", \"am\", \"here\"] with a space separator.",
                "expectedOutput": "\"I am here\"",
                "input": `
{
"words": ["I", "am", "here"]
}`
              }
            },
            {
              "id": "slice",
              "title": "2.2.10 - slice()",
              "content": "Returns a shallow copy of a portion of an array.",
              "codeExample": {
                "input": `
{
  "numbers": [1, 2, 3, 4, 5]
}`,
                "script": `$numbers.slice(1, 3)`,
                "output": `[2, 3]`
              },
              "exercise": {
                "description": "Extract elements from index 1 to 3 (exclusive) from the array [10, 20, 30, 40, 50].",
                "expectedOutput": "[20, 30]",
                "input": `
{
  "numbers": [10, 20, 30, 40, 50]
}`
              }
            }
          ]
        },
        {
          id: 'object-functions',
          title: '3.3 - Object Functions',
          content: `Object functions in SnapLogic provide powerful capabilities for manipulating and transforming JavaScript objects. These functions help you access, modify, and process object data efficiently.

Available Object Functions:
• keys()
• values()
• entries()
• filter()
• mapValues()
• isEmpty()
• merge()
• has()`,
          subTopics:[
            {
              "id": "keys",
              "title": "2.3.1 - keys()",
              "content": "Returns an array of a given object's own enumerable property names.",
              "codeExample": {
                "input": `
{
  "user": {
    "name": "John",
     "age": 30,
     "address": {
      "city": "New York",
      "zip": "10001"
          },
      "tags": ["admin", "active"]
      }
}`,
                "script": `$user.keys()`,
                "output": `["name", "age", "address", "tags"]`
              },
              "exercise": {
                "description": "Get the property names of the object with properties 'id', 'title', and 'status'.",
                "expectedOutput": `["id", "title", "status"]`,
                "input": `
{
  "data": {
    "id": 1,
    "title": "Test",
    "status": "active"
      }
}`
              }
            },
            {
              "id": "values",
              "title": "2.3.2 - values()",
              "content": "Returns an array of a given object's own enumerable property values.",
              "codeExample": {
                "input": `
{
  "user": {
    "name": "John",
    "age": 30,
    "address": {
    "city": "New York",
    "zip": "10001"
          },
    "tags": ["admin", "active"]
      }
}`,
                "script": `$user.values()`,
                "output": `
[
  "John",
  30,
  {"city": "New York", "zip": "10001"},
  ["admin", "active"]
]`
              },
              "exercise": {
                "description": "Get the property values of the object with properties 'id', 'title', and 'status'.",
                "expectedOutput": `
[
  1,
  "Test",
  "active"
]`,
                "input": `
{
  "data": {
      "id": 1,
      "title": "Test",
      "status": "active"
      }
}`
              }
            },
            {
              "id": "entries",
              "title": "2.3.3 - entries()",
              "content": "Returns an array of a given object's own enumerable string-keyed property key-value pairs.",
              "codeExample": {
                "input": `
{
  "user": {
   "name": "John",
    "age": 30
    }
}`,
                "script": `$user.entries()`,
                "output": `
[
  ["name", "John"],
  ["age", 30]
]`
              },
              "exercise": {
                "description": "Get the key-value pairs of the object with properties 'color' and 'size'.",
                "expectedOutput": `
[
  ["color", "blue"],
  ["size", 10]
]`,
                "input": `
{
  "item": {
    "color": "blue",
    "size": 10
      }
}`
              }
            },
            {
              "id": "filter",
              "title": "2.3.4 - filter()",
              "content": "Creates a new object with all elements that pass the test implemented by the provided function.",
              "codeExample": {
                "input": `
{
  "products": {
  "item1": { "price": 100, "inStock": true },
  "item2": { "price": 200, "inStock": false },
  "item3": { "price": 300, "inStock": true }
      }
}`,
                "script": `$products.filter((value) => value.price > 150)`,
                "output": `
{
  "item2": { "price": 200, "inStock": false },
  "item3": { "price": 300, "inStock": true }
}`
              },
              "exercise": {
                "description": "Filter the object to keep only items with a price greater than 50.",
                "expectedOutput": `
{
  "item1": { "price": 75, "inStock": true },
  "item2": { "price": 100, "inStock": false }
}`,
                "input": `
{
  "products": {
  "item1": { "price": 75, "inStock": true },
  "item2": { "price": 100, "inStock": false },
  "item3": { "price": 25, "inStock": true }
      }
}`
              }
            },
            {
              "id": "mapValues",
              "title": "2.3.5 - mapValues()",
              "content": "Creates a new object with the results of calling a provided function on every value.",
              "codeExample": {
                "input": `
{
  "products": {
  "item1": { "price": 100, "inStock": true },
  "item2": { "price": 200, "inStock": false }
      }
}`,
                "script": `$products.mapValues((value) => value.price * 2)`,
                "output": `
{
  "item1": { "price": 200, "inStock": true },
  "item2": { "price": 400, "inStock": false }
}`
              },
              "exercise": {
                "description": "Double the price of each item in the object.",
                "expectedOutput": `
{
  "item1": { "price": 50, "inStock": true },
  "item2": { "price": 150, "inStock": false }
}`,
                "input": `
{
  "products": {
    "item1": { "price": 25, "inStock": true },
    "item2": { "price": 75, "inStock": false }
    }
}`
              }
            },
            {
              "id": "isEmpty",
              "title": "2.3.6 - isEmpty()",
              "content": "Checks if an object is empty (has no enumerable string-keyed properties).",
              "codeExample": {
                "input": `
{
  "user": {
   "name": "John",
   "age": 30
      },
    "empty": {}
}`,
                "script": `$user.isEmpty()
$empty.isEmpty()`,
                "output": `false
true`
              },
              "exercise": {
                "description": "Check if the object with no properties is empty.",
                "expectedOutput": "true",
                "input": `
{
  "data": {}
}`
              }
            },
            {
              "id": "merge",
              "title": "2.3.7 - merge()",
              "content": "Merges two or more objects recursively.",
              "codeExample": {
                "input": `
{
  "user": {
     "name": "John",
      "address": {
        "city": "New York"
          }
     }
}`,
                "script": `
$user.merge({
  "role": "admin",
  "address": {
    "country": "USA"
      }
})`,
                "output": `
{
  "name": "John",
  "role": "admin",
  "address": {
  "city": "New York",
  "country": "USA"
    }
}`
              },
              "exercise": {
                "description": "Merge an object with 'name' and 'age' with another object adding 'role'.",
                "expectedOutput": `
{
  "name": "Alice",
  "age": 25,
  "role": "user"
}`,
                "input": `
{
  "user": {
    "name": "Alice",
    "age": 25
      }
}`,
                "script": `
$user.merge({
  "role": "user"
})`
              }
            },
            {
              "id": "has",
              "title": "2.3.8 - has()",
              "content": "Checks if path is a direct property of object.",
              "codeExample": {
                "input": `
{
  "user": {
    "name": "John",
    "address": {
      "city": "New York"
          }
      }
}`,
                "script": `$user.has("address.city")
$user.has("address.country")`,
                "output": `true
false`
              },
              "exercise": {
                "description": "Check if the object has the property 'details.status'.",
                "expectedOutput": "true",
                "input": `
{
  "user": {
    "name": "Bob",
    "details": {
      "status": "active"
          }
        }
}`
              }
            }
          ]
        },
        {
          id: 'number-functions',
          title: '2.4 - Number Functions',
          content: `Number functions in SnapLogic provide precise control over number formatting and mathematical operations. These functions help you format numbers for display and perform accurate calculations.

Available Number Functions:
• toExponential()
• toFixed()
• toPrecision()`,
          subTopics:[
            {
              "id": "toExponential",
              "title": "2.4.1 - toExponential()",
              "content": "Returns a string representing the number in exponential notation.",
              "codeExample": {
                "input": `
{
  "price": 123.456789
}`,
                "script": `$price.toExponential()
$price.toExponential(2)`,
                "output": `"1.23456789e+2"
"1.23e+2"`
              },
              "exercise": {
                "description": "Convert the number 987.654 to exponential notation with 3 decimal places.",
                "expectedOutput": `"9.877e+2"`,
                "input": `
{
  "value": 987.654
}`
              }
            },
            {
              "id": "toFixed",
              "title": "2.4.2 - toFixed()",
              "content": "Returns a string representing the number with a specified number of decimals.",
              "codeExample": {
                "input": `
{
  "percentage": 0.89473,
  "amount": 1234.5678
}`,
                "script": `$percentage.toFixed(2)
$amount.toFixed(2)`,
                "output": `"0.89"
"1234.57"`
              },
              "exercise": {
                "description": "Format the number 45.6789 to 2 decimal places.",
                "expectedOutput": `"45.68"`,
                "input": `
{
  "number": 45.6789
}`
              }
            },
            {
              "id": "toPrecision",
              "title": "2.4.3 - toPrecision()",
              "content": "Returns a string representing the number with a specified length.",
              "codeExample": {
                "input": `
{
  "quantity": 4.2103,
  "amount": 1234.5678
}`,
                "script": `$quantity.toPrecision(2)
$amount.toPrecision(4)`,
                "output": `"4.2"
"1235"`
              },
              "exercise": {
                "description": "Format the number 78.9123 to a precision of 3 digits.",
                "expectedOutput": `"78.9"`,
                "input": `
{
  "value": 78.9123
}`
              }
            }
          ]
        },
        {
          id: 'math-functions',
          title: '2.5 - Math Functions',
          content: `Math functions in SnapLogic provide essential mathematical operations and constants. These functions help you perform calculations and mathematical transformations.

Available Math Functions:
• abs()
• ceil()
• floor()
• round()
• max()
• min()
• pow()
• sqrt()
• random()`,
          subTopics: [
            {
              "id": "abs",
              "title": "2.5.1 - abs()",
              "content": "Returns the absolute value of a number.",
              "codeExample": {
                "input": `
{
  "value": -7.25
}`,
                "script": `$Math.abs($value)`,
                "output": `"7.25"`
              },
              "exercise": {
                "description": "Find the absolute value of -15.9.",
                "expectedOutput": `"15.9"`,
                "input": `
{
  "number": -15.9
}`
              }
            },
            {
              "id": "ceil",
              "title": "2.5.2 - ceil()",
              "content": "Returns the smallest integer greater than or equal to a number.",
              "codeExample": {
                "input": `
{
  "value": 3.7
}`,
                "script": `$Math.ceil($value)`,
                "output": `4`
              },
              "exercise": {
                "description": "Round 12.1 up to the nearest integer.",
                "expectedOutput": `13`,
                "input": `
{
  "number": 12.1
}`
              }
            },
            {
              "id": "floor",
              "title": "2.5.3 - floor()",
              "content": "Returns the largest integer less than or equal to a number.",
              "codeExample": {
                "input": `
{
  "value": 5.9
}`,
                "script": `$Math.floor($value)`,
                "output": `5`
              },
              "exercise": {
                "description": "Round 19.8 down to the nearest integer.",
                "expectedOutput": `19`,
                "input": `
{
  "number": 19.8
}`
              }
            },
            {
              "id": "round",
              "title": "2.5.4 - round()",
              "content": "Rounds a number to the nearest integer.",
              "codeExample": {
                "input": `
{
  "value": 4.5
}`,
                "script": `$Math.round($value)`,
                "output": `5`
              },
              "exercise": {
                "description": "Round 7.3 to the nearest integer.",
                "expectedOutput": `7`,
                "input": `
{
  "number": 7.3
}`
              }
            },
            {
              "id": "max",
              "title": "2.5.5 - max()",
              "content": "Returns the largest of zero or more numbers.",
              "codeExample": {
                "input": `
{
  "numbers": [3, 8, 1, 10, 5]
}`,
                "script": `$Math.max(...$numbers)`,
                "output": `10`
              },
              "exercise": {
                "description": "Find the maximum value in the array [4, 9, 2, 15, 7].",
                "expectedOutput": `15`,
                "input": `
{
  "values": [4, 9, 2, 15, 7]
}`
              }
            },
            {
              "id": "min",
              "title": "2.5.6 - min()",
              "content": "Returns the smallest of zero or more numbers.",
              "codeExample": {
                "input": `
{
  "numbers": [3, 8, 1, 10, 5]
}`,
                "script": `$Math.min(...$numbers)`,
                "output": `1`
              },
              "exercise": {
                "description": "Find the minimum value in the array [4, 9, 2, 15, 7].",
                "expectedOutput": `2`,
                "input": `
{
  "values": [4, 9, 2, 15, 7]
}`
              }
            },
            {
              "id": "pow",
              "title": "2.5.7 - pow()",
              "content": "Returns the base to the exponent power.",
              "codeExample": {
                "input": `
{
  "base": 2,
  "exponent": 3
}`,
                "script": `$Math.pow($base, $exponent)`,
                "output": `8`
              },
              "exercise": {
                "description": "Calculate 5 raised to the power of 2.",
                "expectedOutput": `25`,
                "input": `
{
  "base": 5,
  "exponent": 2
}`
              }
            },
            {
              "id": "sqrt",
              "title": "2.5.8 - sqrt()",
              "content": "Returns the square root of a number.",
              "codeExample": {
                "input": `
{
  "value": 16
}`,
                "script": `$Math.sqrt($value)`,
                "output": `4`
              },
              "exercise": {
                "description": "Find the square root of 25.",
                "expectedOutput": `5`,
                "input": `
{
  "number": 25
}`
              }
            },
            {
              "id": "random",
              "title": "2.5.9 - random()",
              "content": "Returns a random number between 0 (inclusive) and 1 (exclusive).",
              "codeExample": {
                "input": `
{}`,
                "script": `$Math.random()`,
                "output": `"[a random number between 0 and 1, e.g., 0.723]"`
              },
              "exercise": {
                "description": "Generate a random number between 0 and 1 (note: output will vary).",
                "expectedOutput": `"[a random number between 0 and 1]"`,
                "input": `
{}`
              }
            }
          ]
        },
        {
          id: 'date-functions',
          title: '2.6 - Date Functions',
          content: `Date functions in SnapLogic provide comprehensive capabilities for working with dates and times. These functions help you parse, format, manipulate, and compare dates.

Available Date Functions:
• Static Methods
• Local Parsing
• Getters
• UTC Getters
• Formatting
• Plus Methods
• Minus Methods
• With Methods`,
          subTopics:[
            {
              "id": "static-methods",
              "title": "2.6.1 - Static Date Methods",
              "content": "Static methods available on the Date object for creating and parsing dates.\n\nMethods:\n- Date.now(): Current timestamp\n- Date.parse(): Parse date string\n- Date.UTC(): Create UTC date",
              "codeExample": {
                "input": `
none
          `,
                "script": `$Date.now()
$Date.parse("2024-03-28T14:30:00.000Z")
$Date.UTC(2024, 2, 28, 14, 30, 0)`,
                "output": `1711633800000
1711633800000
1711633800000`
              },
              "exercise": {
                "description": "Parse the date string '2025-01-15T10:00:00.000Z' to a timestamp.",
                "expectedOutput": `1736935200000`,
                "input": `
{
  "dateString": "2025-01-15T10:00:00.000Z"
}`
              }
            },
            {
              "id": "local-parsing",
              "title": "2.6.2 - Local Date/Time Parsing",
              "content": "Methods for parsing local date and time strings.\n\nMethods:\n- LocalDateTime.parse(): Parse local date and time\n- LocalTime.parse(): Parse local time",
              "codeExample": {
                "input": `
{
  "dateTime": "2024-03-28T14:30:00",
  "time": "14:30:00"
}`,
                "script": `$LocalDateTime.parse($dateTime)
$LocalTime.parse($time)`,
                "output": `undetermined`
              },
              "exercise": {
                "description": "Parse the local date and time string '2025-06-10T09:15:00'.",
                "expectedOutput": `undetermined`,
                "input": `
{
  "dateTime": "2025-06-10T09:15:00"
}`
              }
            },
            {
              "id": "getters",
              "title": "2.6.3 - Date Getters",
              "content": "Methods for getting various components of a date.\n\nMethods:\n- getDate(): Day of month (1-31)\n- getDay(): Day of week (0-6)\n- getMonth(): Month (0-11)\n- getFullYear(): Year\n- getHours(): Hours\n- getMinutes(): Minutes\n- getSeconds(): Seconds",
              "codeExample": {
                "input": `
{
  "date": "2024-03-28T14:30:00.000Z"
}`,
                "script": `$date.getDate()
$date.getDay()
$date.getMonth()
$date.getFullYear()
$date.getHours()
$date.getMinutes()
$date.getSeconds()`,
                "output": `28
4
2
2024
14
30
0`
              },
              "exercise": {
                "description": "Get the day of the month and year from the date '2025-07-15T08:45:00.000Z'.",
                "expectedOutput": `15
2025`,
                "input": `
{
  "date": "2025-07-15T08:45:00.000Z"
}`
              }
            },
            {
              "id": "utc-getters",
              "title": "2.6.4 - UTC Date Getters",
              "content": "Methods for getting UTC components of a date.\n\nMethods:\n- getUTCDate(): UTC day of month\n- getUTCDay(): UTC day of week\n- getUTCMonth(): UTC month\n- getUTCFullYear(): UTC year\n- getUTCHours(): UTC hours",
              "codeExample": {
                "input": `
{
  "date": "2024-03-28T14:30:00.000Z"
}`,
                "script": `$date.getUTCDate()
$date.getUTCDay()
$date.getUTCMonth()
$date.getUTCFullYear()
$date.getUTCHours()`,
                "output": `28
4
2
2024
14`
              },
              "exercise": {
                "description": "Get the UTC month and hours from the date '2025-08-20T16:00:00.000Z'.",
                "expectedOutput": `7
16`,
                "input": `
{
  "date": "2025-08-20T16:00:00.000Z"
}`
              }
            },
            {
              "id": "formatting",
              "title": "2.6.5 - Date Formatting",
              "content": "Methods for converting dates to strings in various formats.\n\nMethods:\n- toString(): Convert to string\n- toLocaleDateString(): Format as local date\n- toLocaleTimeString(): Format as local time\n- toLocaleDateTimeString(): Format as local date and time",
              "codeExample": {
                "input": `
{
  "date": "2024-03-28T14:30:00.000Z"
}`,
                "script": `$date.toString()
$date.toLocaleDateString({"format": "YYYY-MM-DD"})
$date.toLocaleTimeString({"locale": "en-US"})
$date.toLocaleDateTimeString({"format": "YYYY-MM-DD HH:mm:ss"})`,
                "output": `"Thu Mar 28 2024 14:30:00 GMT+0000 (Coordinated Universal Time)"
"2024-03-28"
"2:30:00 PM"
"2024-03-28 14:30:00"`
              },
              "exercise": {
                "description": "Format the date '2025-09-10T13:15:00.000Z' as a local date string in 'YYYY-MM-DD' format.",
                "expectedOutput": `"2025-09-10"`,
                "input": `
{
  "date": "2025-09-10T13:15:00.000Z"
}`
              }
            },
            {
              "id": "plus-methods",
              "title": "2.6.6 - Date Addition Methods",
              "content": "Methods for adding time units to a date.\n\nMethods:\n- plusYears(): Add years\n- plusMonths(): Add months\n- plusDays(): Add days\n- plusHours(): Add hours\n- plusMinutes(): Add minutes\n- plusSeconds(): Add seconds",
              "codeExample": {
                "input": `
{
  "date": "2024-03-28T14:30:00.000Z"
}`,
                "script": `$date.plusYears(1)
$date.plusMonths(2)
$date.plusDays(5)
$date.plusHours(3)
$date.plusMinutes(45)`,
                "output": `2025-03-28T14:30:00.000Z
2024-05-28T14:30:00.000Z
2024-04-02T14:30:00.000Z
2024-03-28T17:30:00.000Z
2024-03-28T15:15:00.000Z`
              },
              "exercise": {
                "description": "Add 3 days and 2 hours to the date '2025-10-01T09:00:00.000Z'.",
                "expectedOutput": `2025-10-04T11:00:00.000Z`,
                "input": `
{
  "date": "2025-10-01T09:00:00.000Z"
}`
              }
            },
            {
              "id": "minus-methods",
              "title": "2.6.7 - Date Subtraction Methods",
              "content": "Methods for subtracting time units from a date.\n\nMethods:\n- minusYears(): Subtract years\n- minusMonths(): Subtract months\n- minusDays(): Subtract days\n- minusHours(): Subtract hours\n- minusMinutes(): Subtract minutes",
              "codeExample": {
                "input": `
{
  "date": "2024-03-28T14:30:00.000Z"
}`,
                "script": `$date.minusYears(1)
$date.minusMonths(2)
$date.minusDays(5)
$date.minusHours(3)
$date.minusMinutes(45)`,
                "output": `2023-03-28T14:30:00.000Z
2024-01-28T14:30:00.000Z
2024-03-23T14:30:00.000Z
2024-03-28T11:30:00.000Z
2024-03-28T13:45:00.000Z`
              },
              "exercise": {
                "description": "Subtract 1 month and 4 hours from the date '2025-11-15T12:00:00.000Z'.",
                "expectedOutput": `2025-10-15T08:00:00.000Z`,
                "input": `
{
  "date": "2025-11-15T12:00:00.000Z"
}`
              }
            },
            {
              "id": "with-methods",
              "title": "2.6.8 - Date Setting Methods",
              "content": "Methods for setting specific components of a date.\n\nMethods:\n- withYear(): Set year\n- withMonth(): Set month\n- withDayOfMonth(): Set day of month\n- withHourOfDay(): Set hour\n- withMinuteOfHour(): Set minute\n- withSecondOfMinute(): Set second",
              "codeExample": {
                "input": `
{
  "date": "2024-03-28T14:30:00.000Z"
}`,
                "script": `$date.withYear(2025)
$date.withMonth(6)
$date.withDayOfMonth(15)
$date.withHourOfDay(10)
$date.withMinuteOfHour(45)
$date.withSecondOfMinute(30)`,
                "output": `2025-03-28T14:30:00.000Z
2024-07-28T14:30:00.000Z
2024-03-15T14:30:00.000Z
2024-03-28T10:30:00.000Z
2024-03-28T14:45:00.000Z
2024-03-28T14:30:30.000Z`
              },
              "exercise": {
                "description": "Set the year to 2026 and the hour to 16 for the date '2025-12-01T09:15:00.000Z'.",
                "expectedOutput": `2026-12-01T16:15:00.000Z`,
                "input": `
{
  "date": "2025-12-01T09:15:00.000Z"
}`
              }
            }
          ]
        },
        {
          id: 'json-functions',
          title: '2.7 - JSON Functions',
          content: `JSON functions in SnapLogic provide methods for parsing and stringifying JSON data. These functions help you convert between JSON strings and JavaScript objects.

          Available JSON Functions:
          • JSON.parse()
          • JSON.stringify()`,
          subTopics: [
            {
              "id": "parse",
              "title": "2.7.1 - JSON.parse()",
              "content": "Parses a JSON string and returns a JavaScript object.",
              "codeExample": {
                "input": `
{
  "jsonString": "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}",
  "arrayString": "[1, 2, 3, \"four\", true, null]",
  "nestedString": "{\"users\": [{\"id\": 1, \"name\": \"Alice\"}, {\"id\": 2, \"name\": \"Bob\"}]}"
}`,
                "script": `$JSON.parse($jsonString)
$JSON.parse($arrayString)
$JSON.parse($nestedString)`,
                "output": `{ "name": "John", "age": 30, "city": "New York" }
[1, 2, 3, "four", true, null]
{ "users": [{ "id": 1, "name": "Alice" }, { "id": 2, "name": "Bob" }] }`
              },
              "exercise": {
                "description": "Parse the JSON string '{\"product\": \"Laptop\", \"price\": 999.99, \"inStock\": true}' into a JavaScript object.",
                "expectedOutput": `{ "product": "Laptop", "price": 999.99, "inStock": true }`,
                "input": `
{
  "jsonString": \"{\"product\": \"Laptop\", \"price\": 999.99, \"inStock\": true}\"
}`
              }
            },
            {
              "id": "stringify",
              "title": "2.7.2 - JSON.stringify()",
              "content": "Converts a JavaScript value to a JSON string.",
              "codeExample": {
                "input": `
{
  "object": {
    "id": 123,
    "status": "active",
    "tags": ["important", "urgent"]
        },
  "nested": {
    "department": "IT",
    "employees": [
      { "id": 1, "name": "Alice", "role": "Developer" },
      { "id": 2, "name": "Bob", "role": "Designer" }
            ]
    }
}`,
                "script": `$JSON.stringify($object)
$JSON.stringify($nested)`,
                "output": `{"id":123,"status":"active","tags":["important","urgent"]}
{"department":"IT","employees":[{"id":1,"name":"Alice","role":"Developer"},{"id":2,"name":"Bob","role":"Designer"}]}`
              },
              "exercise": {
                "description": "Convert the object { \"title\": \"Book\", \"pages\": 250, \"authors\": [\"Jane\", \"Doe\"] } to a JSON string.",
                "expectedOutput": `{"title":"Book","pages":250,"authors":["Jane","Doe"]}`,
                "input": `
{
  "data": {
    "title": "Book",
    "pages": 250,
    "authors": ["Jane", "Doe"]
      }
}`
              }
            }
          ]
        },
        {
          id: 'Other Functions',
          title: '2.8 - Other Functions',
          content: `This section covers additional functions in SnapLogic that enhance data processing, transformation, and pattern matching capabilities.

Available Other Functions:
• Match Operator
• Mapper
• JSONPath Expressions`,
          subTopics: [
            {
              "id": "match-operator",
              "title": "2.8.1 - Match Operator",
              "content": "The match operator in SnapLogic provides pattern matching capabilities for evaluating conditions and transforming data based on patterns. It supports object matching, string patterns, and value comparisons.",
              "codeExample": {
                "input": `
{
  "user": {
    "type": "admin",
    "active": true,
    "level": 4
          },
    "items": [
      {"status": "completed", "price": 0},
      {"status": "in-progress", "price": 100},
      {"status": "pending", "price": 0}
            ],
    "transaction": {
      "amount": 6000,
      "status": "pending"
          },
      message": "ERROR: Database connection failed"
}`,
            "script": `
match $.user {
  { "type": "admin", "active": true } => "Active Administrator",
  { "type": "user", "level": 3..5 } => "Advanced User",
  { "type": "guest" } => "Guest Access",
  _ => "Unknown User Type"
}
          
match $.message {
  /^ERROR:/ => "Error Message",
  /^WARN:/ => "Warning Message",
  /^INFO:/ => "Info Message",
  /^DEBUG:/ => "Debug Message",
   _ => "Unknown Message Type"
}`,
                "output": `"Active Administrator"
"Error Message"`
              },
              "exercise": {
                "description": "Use the match operator to categorize a user with type 'guest' and check a message starting with 'INFO:'.",
                "expectedOutput": `"Guest Access"
"Info Message"`,
                "input": `
{
  "user": {
    "type": "guest",
    "active": false
      },
  "message": "INFO: System started successfully"
}`
              }
            },
            {
              "id": "mapper",
              "title": "2.8.2 - Mapper",
              "content": "The Mapper in SnapLogic provides powerful data transformation capabilities to map source data to target structures. It supports direct mapping, JSON path expressions, and nested field mapping.",
              "codeExample": {
                "input": `
[
  {
    "ACTION": "C",
    "MAST_UPL": [
      {
        "PERNR": 50060976,
        "NACHN": "Williams",
        "VORNA": "Jo-Anne",
        "USRID_LONG": "jo-anne.williams@global.ntt"
          }
        ]
    }
]`,
                "script": `
{
  "name": "John",
  "employeeinfo.employeename": "jsonPath($, '$ACTION')",
  "employeeinfo.employeeid": "$MAST_UPL[0].PERNR",
  "Action": "$ACTION",
  "jsonPath($, '$detail[*].name')": "Jo-Anne Modified"
}`,
                "output": `
{
  "name": "John",
  "employeeinfo": {
    "employeename": "C",
    "employeeid": 50060976
        },
  "Action": "C",
  "detail": [
      {
        "name": "Jo-Anne Modified"
      }
    ]
}`
              },
              "exercise": {
                "description": "Map the input to create an object with a nested 'person' structure containing 'id' and 'email' from the input data.",
                "expectedOutput": `
{
  "person": {
    "id": 12345,
    "email": "jane.doe@example.com"
        },
  "operation": "U"
}`,
             "input": `
[
  {
    "OPERATION": "U",
    "DATA": [
      {
        "ID": 12345,
        "EMAIL": "jane.doe@example.com"
      }
    ]
  }
]`
              }
            },
            {
              "id": "jsonpath-expressions",
              "title": "2.8.3 - JSONPath Expressions",
              "content": "JSONPath expressions in SnapLogic provide a way to query and extract data from JSON structures. They support various operators for navigating through JSON objects and performing string operations.",
              "codeExample": {
                "input": `
{
  "TYPE": "",
  "CODE": "",
  "MESSAGE": "RP 060  personnel number(s) could not be locked by TANYAWEBER",
  "LOG_NO": "",
  "LOG_MSG_NO": 0,
  "MESSAGE_V1": "",
  "MESSAGE_V2": "",
  "MESSAGE_V3": "",
  "MESSAGE_V4": ""
}`,
                "script": `jsonPath($, "$MESSAGE")[0].contains('personnel number(s) could not be locked')`,
                "output": `true`
              },
              "exercise": {
                "description": "Use a JSONPath expression to check if the 'status' field contains 'success'.",
                "expectedOutput": `true`,
                "input": `
{
  "status": "Operation completed with success",
  "code": 200
}`
              }
            }
          ]
        },
        
      ]
    },
    {
      id: 'advanced-features',
      title: '3 - Advanced Features',
      content: `SnapMapper offers advanced features for complex integration scenarios:
  
  1. Custom Functions
     • Function definition
     • Parameter handling
     • Error management
     • Recursion support
  
  2. Advanced Expressions
     • Complex conditions
     • Pattern matching
     • Regular expressions`,
      subTopics:[
        {
          id: 'benefits-for-users',
          title: '3.1 - Benefits for Users',
          content: `SnapMapper provides numerous benefits for users:
      
      1. Development Efficiency
         • Rapid prototyping
         • Immediate feedback
         • Code reusability
         • Built-in best practices
      
      2. Learning and Growth
         • Interactive tutorials
         • Comprehensive documentation
         • Example library
         • Community support
      
      3. Collaboration
         • Share expressions
         • Team development
         • Version control
         • Knowledge sharing
    `,
          
        },
        {
          id: 'future-enhancements',
          title: '3.2 - Future Enhancements',
          content: `Upcoming features and improvements planned for SnapLogicMapper:
      
      1. Enhanced UI/UX
         • Dark mode support
         • Customizable themes
         • Improved navigation
         • Enhanced accessibility
      
      2. Advanced Features
         • AI-powered suggestions
         • Advanced debugging tools
         • Complex function and script Handling
         
      3. Collaboration Features
         • Real-time collaboration
         • Team workspaces
        `,
          
        }
      ]
    }
    
  ];


  



  const [selectedTopic, setSelectedTopic] = useState(tutorialData[0]);
  
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
    if(!showTutorial){
    setActualOutput(newValue);
  }
  else{
    setTutorialOutput(newValue)
  }
  };

  const handleTutorialActualOutputChange = (newValue) => {
    setTutorialOutput(newValue);
    
    // Check if the new output matches expected output
    try {
      const expectedOutput = selectedSubTopic?.exercise?.expectedOutput || selectedTopic?.exercise?.expectedOutput;
      if (expectedOutput) {
        const normalizedActual = JSON.stringify(JSON.parse(newValue));
        const normalizedExpected = JSON.stringify(JSON.parse(expectedOutput));
        setTutorialExerciseSuccess(normalizedActual === normalizedExpected);
      }
    } catch (error) {
      setTutorialExerciseSuccess(false);
    }
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
  
  const handleTutorialScriptContentChange = (e) => {
    if (!e?.target) {
      setTutorialOutput(JSON.stringify({ error: "Invalid event" }, null, 2));
      return;
    }
  
    const newContent = e.target.value || '';
    setTutorialScriptContent(newContent);
  
    try {
      const handler = new SnapLogicFunctionsHandler();
  
      // Get the exercise input
      const exerciseInput = selectedSubTopic?.exercise?.input || selectedTopic?.exercise?.input;
      console.log('Raw exercise input:', exerciseInput); // Debug log
  
      let inputData;
      try {
        // Ensure input is properly formatted as JSON
        const cleanedInput = exerciseInput
          ?.trim()
          ?.replace(/,\s*}/g, "}")  // Remove trailing commas in objects
          ?.replace(/,\s*\]/g, "]")  // Remove trailing commas in arrays
          ?.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Ensure keys are quoted
          ?.replace(/:\s*([^"{\[\d].*?)\s*([,}])/g, ':"$1"$2') // Ensure string values are quoted
          ?.replace(/\s+/g, ' ') || '{}';
  
        console.log('Cleaned input:', cleanedInput); // Debug log
  
        // Validate JSON before parsing
        if (!cleanedInput.startsWith('{') || !cleanedInput.endsWith('}')) {
          throw new Error('Invalid JSON format: Must be a valid object');
        }
  
        inputData = JSON.parse(cleanedInput);
        console.log('Parsed input data:', inputData); // Debug log
      } catch (err) {
        console.error('Input parsing error:', err);
        setTutorialOutput(JSON.stringify({
          error: "Invalid exercise input format",
          rawInput: exerciseInput,
          message: err.message
        }, null, 2));
        return;
      }
  
      // Execute script
      const result = handler.executeScript(newContent, inputData);
      console.log('Execution result:', result); // Debug log
  
      // Format and set output
      const resultStr = JSON.stringify(result, null, 2);
      setTutorialOutput(resultStr);
  
      // Check against expected output
      const expectedOutput = selectedSubTopic?.exercise?.expectedOutput || selectedTopic?.exercise?.expectedOutput;
      const normalizedResult = resultStr.trim();
      const normalizedExpected = expectedOutput.trim();
      setTutorialExerciseSuccess(normalizedResult === normalizedExpected);
  
    } catch (error) {
      console.error('Script execution error:', error);
      setTutorialOutput(JSON.stringify({
        error: "Script execution failed",
        message: error.message
      }, null, 2));
      setTutorialExerciseSuccess(false);
    }
  };
  
  useEffect(() => {
    if (showTutorial) {
        try {
            // Ensure expected output is retrieved correctly
            const expectedOutput = (selectedSubTopic?.exercise?.expectedOutput || selectedTopic?.exercise?.expectedOutput || "").trim();
            const actualOutput1 = (tutorialOutput || "").trim();

            // Debugging: Log before comparison
            console.log("🛠 Expected Output (Raw):", expectedOutput);
            console.log("🛠 Actual Output (Raw):", actualOutput1);

            if (!expectedOutput || !actualOutput1) {
                console.warn("⚠️ Skipping comparison: expectedOutput or tutorialOutput is empty.");
                return;
            }

            // Normalize outputs (remove extra quotes, trim spaces)
            const normalizeOutput = (output) => {
                try {
                    const parsed = JSON.parse(output);
                    return typeof parsed === 'string' 
                        ? parsed.normalize("NFC").trim()  // Normalize Unicode & trim spaces
                        : JSON.stringify(parsed).normalize("NFC").trim();
                } catch {
                    return output.toString().normalize("NFC").trim();
                }
            };

            const cleanExpected = normalizeOutput(expectedOutput).replace(/['"]/g, '');
            const cleanActual = normalizeOutput(actualOutput1).replace(/['"]/g, '');

            console.log("✅ Expected Output (Cleaned):", cleanExpected);
            console.log("✅ Actual Output (Cleaned):", cleanActual);
            console.log("✅ Is Match:", cleanExpected === cleanActual);

            // Force re-render by setting state in a timeout (ensures UI updates correctly)
            setTimeout(() => {
                setTutorialExerciseSuccess(cleanExpected === cleanActual);
            }, 0);

        } catch (error) {
            console.error("❌ Error comparing outputs:", error);
            setTutorialExerciseSuccess(false);
        }
    }
}, [showTutorial, tutorialOutput, selectedSubTopic, selectedTopic,scriptContent]);






  
  
  const parseExerciseInput = (inputString) => {
    try {
      // Clean the input string
      const cleanInput = inputString
        .trim()
        .replace(/^\n+|\n+$/g, ''); // Remove leading/trailing newlines
      return JSON.parse(cleanInput);
    } catch (error) {
      console.error('Failed to parse exercise input:', error);
      return null;
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
 

  const storeMatchingData = async () => {
    try {
        const dataToInsert = [{
            script_content: scriptContent || '',
            actual_output: actualOutput || '',
            active_payload: JSON.stringify(inputContents[activeInput] || '{}'),
            topic_id: selectedSubTopic?.id || selectedTopic?.id || 'default',
        }];

        // console.log('Attempting to insert:', dataToInsert);

        const { data, error } = await supabase
            .from('snap_output_matched_data')  // Updated table name
            .insert(dataToInsert)
            .select('*');

        if (error) {
            console.error('Supabase error details:', JSON.stringify(error, null, 2));
            // alert(`Insert Error: ${error.message}`);
            return;
        }

        // console.log('Successfully inserted data:', data);

    } catch (error) {
        // console.error('Error in storeMatchingData:', error.message);
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
  
  useEffect(() => {
    const testInsert = async () => {
      if (outputMatch) {
        // console.log('Testing insert...');
        await storeMatchingData();
      }
    };
    testInsert();
  }, [outputMatch]);
 




 
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


const handleNavigation = (page, e) => {
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


const getNavLink = (item) => ({
  blogs: 'https://blogs.mulecraft.in/',
  docs: 'https://docs-snaplogic.atlassian.net/wiki/spaces/SD/overview',  // <-- Internal Route
  tutorial: '#',
  Mapper: '/'
})[item];



// const handleNavClick = (item, e) => {
//   if (e) {
//     e.preventDefault();
//   }
  
//   const link = getNavLink(item);
//   if (link.startsWith('http')) {
//     window.open(link, '_blank');
//   } else if (item === 'docs') {
//     setShowDocumentation(true);
//     setActiveNavItem('docs');
//   } else {
//     setActiveNavItem(item);
//     setShowDocumentation(false);
//   }
// };
const handleNavClick = (item) => {
  if (item === 'tutorial') {
    setShowTutorial(true);
    setSelectedTopic(tutorialData[0]);
    setSelectedSubTopic(null);
    setActiveNavItem('tutorial');
  } else if (item === 'Mapper') {
    setShowTutorial(false);
    setActiveNavItem('Mapper');
  } else if (getNavLink(item).startsWith('http')) {
    window.open(getNavLink(item), '_blank');
    setActiveNavItem(item);
  }
};

const TopicItem = ({ 
  topic, 
  selectedTopic, 
  selectedSubTopic, 
  openSections, 
  setSelectedTopic, 
  setSelectedSubTopic, 
  setOpenSections,
  depth,
  tutorialExerciseSuccess // Add this prop
}) => {
  const hasSubTopics = topic.subTopics && topic.subTopics.length > 0;
  const isSelected = selectedSubTopic?.id === topic.id || 
                    (!selectedSubTopic && selectedTopic.id === topic.id);
  const marginLeft = `${depth * 1.75}rem`;

  return (
    <div className="mb-3">
      <div 
        className={`flex items-center justify-between cursor-pointer group px-2 hover:bg-[#e5e7eb] rounded-r-full mr-2 py-1.5
          ${isSelected ? 
            'bg-[#1B4E8D] text-white before:content-[""] before:absolute before:left-0 before:w-[2px] before:bg-[#0ea5e9]' : 
            'text-[#5C5C5C]'
          }`}
        style={{ marginLeft: depth > 0 ? marginLeft : '0' }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTopic(topic);
          setSelectedSubTopic(null);
          if (hasSubTopics) {
            setOpenSections(prev => 
              prev.includes(topic.id) 
                ? prev.filter(id => id !== topic.id)
                : [...prev, topic.id]
            );
          }
        }}
      >
        <div className="flex items-center">
          {hasSubTopics && (
            <img
            src="/chevron_down_small.svg"
            alt="SnapLogic Logo"
            className={`h-3.5 w-3.5 mr-1 transform transition-transform duration-200 ${
              openSections.includes(topic.id) ? '' : '-rotate-90'
            }`}
            color={isSelected ? "#ffffff" : "#5C5C5C"}
          />
            // <ChevronDown 
            //   className={`h-3.5 w-3.5 mr-1 transform transition-transform duration-200 ${
            //     openSections.includes(topic.id) ? '' : '-rotate-90'
            //   }`}
            //   color={isSelected ? "#ffffff" : "#5C5C5C"}
            // />
          )}
          <span className={`text-[13px] font-['system-ui']`}>
            {topic.title}
          </span>
        </div>

        {/* Add tick icon */}
        {tutorialExerciseSuccess && isSelected && (
          <svg 
            className={`w-3.5 h-3.5 ml-2 ${isSelected ? 'text-white' : 'text-white-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      
      {openSections.includes(topic.id) && hasSubTopics && (
        <div className="mt-2 space-y-2">
          {topic.subTopics.map(subTopic => (
            <TopicItem
              key={subTopic.id}
              topic={subTopic}
              selectedTopic={selectedTopic}
              selectedSubTopic={selectedSubTopic}
              openSections={openSections}
              setSelectedTopic={setSelectedTopic}
              setSelectedSubTopic={setSelectedSubTopic}
              setOpenSections={setOpenSections}
              depth={depth + 1}
              tutorialExerciseSuccess={tutorialExerciseSuccess} // Pass the prop
            />
          ))}
        </div>
      )}
    </div>
  );
};


const handlePrevNavigation = () => {
  try {
    if (!hasPrev || !selectedTopic) return;

    // Helper function to get the last subtopic of a topic
    const getLastSubtopic = (topic) => {
      return topic.subTopics && topic.subTopics.length > 0 
        ? topic.subTopics[topic.subTopics.length - 1] 
        : null;
    };

    // Find current indices
    const currentTopicIdx = tutorialData.findIndex(t => t.id === selectedTopic.id);
    const currentTopic = tutorialData[currentTopicIdx];

    if (selectedSubTopic) {
      // Currently in a subtopic
      const currentSubTopicIdx = currentTopic.subTopics?.findIndex(st => st.id === selectedSubTopic.id) ?? -1;

      if (currentSubTopicIdx > 0) {
        // Move to previous subtopic in current topic
        setSelectedSubTopic(currentTopic.subTopics[currentSubTopicIdx - 1]);
      } else if (currentTopicIdx > 0) {
        // Move to previous topic
        const prevTopic = tutorialData[currentTopicIdx - 1];
        setSelectedTopic(prevTopic);
        const lastSubtopic = getLastSubtopic(prevTopic);
        if (lastSubtopic) {
          setSelectedSubTopic(lastSubtopic);
          setOpenSections(prev => Array.from(new Set([...prev, prevTopic.id])));
        } else {
          setSelectedSubTopic(null);
        }
      }
    } else {
      // Currently in a main topic
      if (currentTopicIdx > 0) {
        const prevTopic = tutorialData[currentTopicIdx - 1];
        setSelectedTopic(prevTopic);
        const lastSubtopic = getLastSubtopic(prevTopic);
        if (lastSubtopic) {
          setSelectedSubTopic(lastSubtopic);
          setOpenSections(prev => Array.from(new Set([...prev, prevTopic.id])));
        } else {
          setSelectedSubTopic(null);
        }
      }
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

const handleNextNavigation = () => {
  try {
    if (!hasNext || !selectedTopic) return;

    // Helper function to get the first subtopic of a topic
    const getFirstSubtopic = (topic) => {
      return topic.subTopics && topic.subTopics.length > 0 
        ? topic.subTopics[0] 
        : null;
    };

    // Find current indices
    const currentTopicIdx = tutorialData.findIndex(t => t.id === selectedTopic.id);
    const currentTopic = tutorialData[currentTopicIdx];

    if (selectedSubTopic) {
      // Currently in a subtopic
      const currentSubTopicIdx = currentTopic.subTopics?.findIndex(st => st.id === selectedSubTopic.id) ?? -1;

      if (currentSubTopicIdx < (currentTopic.subTopics?.length ?? 0) - 1) {
        // Move to next subtopic in current topic
        setSelectedSubTopic(currentTopic.subTopics[currentSubTopicIdx + 1]);
      } else if (currentTopicIdx < tutorialData.length - 1) {
        // Move to next topic
        const nextTopic = tutorialData[currentTopicIdx + 1];
        setSelectedTopic(nextTopic);
        const firstSubtopic = getFirstSubtopic(nextTopic);
        if (firstSubtopic) {
          setSelectedSubTopic(firstSubtopic);
          setOpenSections(prev => Array.from(new Set([...prev, nextTopic.id])));
        } else {
          setSelectedSubTopic(null);
        }
      }
    } else {
      // Currently in a main topic
      const firstSubtopic = getFirstSubtopic(currentTopic);
      if (firstSubtopic) {
        // Move to first subtopic of current topic
        setSelectedSubTopic(firstSubtopic);
        setOpenSections(prev => Array.from(new Set([...prev, currentTopic.id])));
      } else if (currentTopicIdx < tutorialData.length - 1) {
        // Move to next topic
        const nextTopic = tutorialData[currentTopicIdx + 1];
        setSelectedTopic(nextTopic);
        const nextFirstSubtopic = getFirstSubtopic(nextTopic);
        if (nextFirstSubtopic) {
          setSelectedSubTopic(nextFirstSubtopic);
          setOpenSections(prev => Array.from(new Set([...prev, nextTopic.id])));
        } else {
          setSelectedSubTopic(null);
        }
      }
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

const hasPrev = useMemo(() => {
  try {
    if (!selectedTopic) return false;
    const currentTopicIdx = tutorialData.findIndex(t => t.id === selectedTopic.id);
    
    if (selectedSubTopic) {
      const currentTopic = tutorialData[currentTopicIdx];
      const currentSubTopicIdx = currentTopic.subTopics?.findIndex(st => st.id === selectedSubTopic.id) ?? -1;
      return currentSubTopicIdx > 0 || currentTopicIdx > 0;
    }
    
    return currentTopicIdx > 0;
  } catch (error) {
    console.error('hasPrev calculation error:', error);
    return false;
  }
}, [selectedTopic, selectedSubTopic, tutorialData]);

const hasNext = useMemo(() => {
  try {
    if (!selectedTopic) return false;
    const currentTopicIdx = tutorialData.findIndex(t => t.id === selectedTopic.id);
    const currentTopic = tutorialData[currentTopicIdx];
    
    if (selectedSubTopic) {
      const currentSubTopicIdx = currentTopic.subTopics?.findIndex(st => st.id === selectedSubTopic.id) ?? -1;
      return currentSubTopicIdx < (currentTopic.subTopics?.length ?? 0) - 1 || 
             currentTopicIdx < tutorialData.length - 1;
    }
    
    return Boolean(currentTopic.subTopics?.length) || 
           currentTopicIdx < tutorialData.length - 1;
  } catch (error) {
    console.error('hasNext calculation error:', error);
    return false;
  }
}, [selectedTopic, selectedSubTopic, tutorialData]);  




const styles = {
  tableOfContents: {
    borderRight: '1px solid #e5e7eb',
    width: '300px',
  },
  explanation: {
    flex: 1,
    borderLeft: '1px solid #e5e7eb',
  },
  header: {
    height: '48px',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
  },
  headerText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
  },
  topic: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  activeSection: {
    backgroundColor: '#0ea5e9',
    color: 'white',
  },
  subTopic: {
    padding: '8px 32px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#4a5568',
  },
  content: {
    padding: '24px 32px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  tutorialNav: {
    backgroundColor: '#f8f9fa',
    '& .section-item': {
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#e5e7eb'
      }
    }
  },
  activeSubTopic: {
    backgroundColor: '#0ea5e9',
    color: 'white',
    borderTopRightRadius: '9999px',
    borderBottomRightRadius: '9999px',
    marginRight: '8px',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '2px',
      backgroundColor: '#0ea5e9'
    }
  },
  pre: `
  white-space: pre-wrap;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  padding: 1rem;
`,
bullet: `
  margin-left: 1rem;
  position: relative;
`,
bulletPoint: `
  position: absolute;
  left: -1rem;
  content: "•";
`


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
 
  
 
  
  return (
    <>
  <Joyride
  steps={steps}
  run={isGuideActive}
  continuous={true}
  showSkipButton={true}
  showProgress={true}
  styles={{
    options: {
      arrowColor: '#1B4E8D', // Updated to match modern primary color
      backgroundColor: '#ffffff',
      overlayColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker for better contrast
      primaryColor: '#1B4E8D', // Stronger blue for UI consistency
      textColor: '#222', // Darker text for readability
      width: 320, // Slightly wider for better readability
      zIndex: 11000,
    },
    tooltip: {
      padding: '20px',
      borderRadius: '12px', // Rounded edges for modern look
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // Softer, deeper shadow
      border: '1px solid #ddd', // Subtle border for structure
      transition: 'all 0.3s ease-in-out', // Smooth fade-in effect
    },
    buttonNext: {
      backgroundColor: '#1B4E8D',
      color: '#fff',
      padding: '10px 18px', // Larger button for a more premium feel
      borderRadius: '6px',
      fontWeight: 'bold',
      boxShadow: '0 2px 5px rgba(27, 78, 141, 0.3)', // Light shadow for depth
      transition: 'background-color 0.2s ease-in-out',
      cursor: 'pointer',
      border: 'none',
    },
    buttonBack: {
      marginRight: '10px',
      color: '#555',
      fontSize: '14px',
      transition: 'color 0.2s ease-in-out',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: 'transparent'
    },
    buttonSkip: {
      color: '#555',
      fontSize: '14px',
      transition: 'color 0.2s ease-in-out',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: 'transparent',
      textDecoration: 'underline'
    }
  }}
  callback={handleJoyrideCallback}
/>


    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
      {showToast && (
        <div className="bg-[#E9EEF4] text-[#00044C] py-2 text-[12px] relative">
          {/* <div className="text-center px-12 font-bold font-system-default text-[12px] text-[#00044C] tracking-[0.09em] uppercase">
  Discover the Future of Integration. Explore MuleCraft Playground Highlights
</div> */}
<div className="text-center px-12 font-bold font-system-default text-[12px] text-[#00044C] tracking-[0.09em] uppercase">
  <a 
    href="https://discord.gg/cCGgeJVk" 
    target="_blank" 
    rel="noopener noreferrer"
    className="hover:text-blue-500 transition-colors duration-200 text-center px-12 font-bold font-system-default text-[12px] text-[#1B4E8D] tracking-[0.09em] uppercase"
  >
    Snap, Build, Deploy! | Join Our Developer Community on Discord! 🚀 
  </a>
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
{/* <img
  src="/LogoN.svg"
  alt="SnapLogic"
  className=" object-contain"
  style={{
    height: isTablet ? '20px' : '32px'
  }}
/> */}
<span className='text-[#444444] text-[20px] font-bold font-[OpenSans,sans-serif]'>
  SnapMapper
</span>
        </div>
        <div className="flex items-center">
        {!showTutorial && (
  <>
        <button
  onClick={() => {
    handleExport();
    // Show dialog if not checked in current session
    if (!wasChecked) {
      setShowExportDialog(true);
    }
  }}

  className="flex items-center px-4 py-1.5 bg-white rounded border-none focus:outline-none group hover:text-blue-500 -ml-3">
  
<img
  src="/oui--export.svg"
  alt="SnapLogic Logo"
 className="mr-2 text-gray-200 group-hover:text-blue-500  h-4 w-4"
/>
  {/* <Upload className="mr-2 group-hover:text-blue-500 text-gray-500 h-3 w-3" /> */}
  <span className="
  text-[14px] 
  font-['system-ui,_-apple-system,_Segoe_UI,_Roboto,_Ubuntu,_Cantarell,_Noto_Sans,_sans-serif'] 
  font-normal 
  text-[rgb(92, 92, 92)] 
  leading-[21px] 
  tracking-[0.04em] 
  group-hover:text-blue-500
  style-normal
">
  Export
</span>
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
  src="/oui--import.svg"
  alt="SnapLogic Logo"
 className="mr-2 group-hover:text-blue-500 text-gray-500 h-4 w-4"
/>
            {/* <Download className="mr-2 group-hover:text-blue-500 text-gray-500 h-3 w-3" /> */}
            <span className="
  text-[14px] 
  font-['system-ui,_-apple-system,_Segoe_UI,_Roboto,_Ubuntu,_Cantarell,_Noto_Sans,_sans-serif'] 
  font-normal 
  text-[rgb(92, 92, 92)] 
  leading-[21px] 
  tracking-[0.04em] 
  group-hover:text-blue-500
  style-normal
">
  Import
</span>
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
            <p className="text-[#FF0000] text-[0.8rem] ml-3">Upload functionality is only intended for playground exported projects</p>
            <p className="text-[#FF0000] text-[0.7rem] mt-1 ml-[3.9rem]">Importing modified files may yield an invalid project.</p>
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








          <div className="h-7 w-[0.5px] bg-gray-500 mx-4"></div>
</>
)}


          {/* <div className="space-x-8 text-[12px] font-bold text-[#444444] relative font-['system-ui'] flex items-center">
          {['blogs', 'docs', 'tutorial', 'playground'].map(item => (
              <Link
              key={item}
              to={getNavLink(item)}
              className={`text-black hover:text-blue-500 px-2 py-2 relative ${
                  activeNavItem === item
                    ? 'after:content-[""] after:absolute after:left-0 after:right-0 after:h-0.5 after:bg-[#1B4E8D] after:-bottom-[0.5rem] z-10'
                    : ''
                }`}
              target={"_blank"} 
              rel={getNavLink(item).startsWith('http') ? 'noopener noreferrer' : undefined}
              onClick={(e) => {
                if (getNavLink(item).startsWith('http')) {
                  e.preventDefault();  // Prevent React Router navigation for external links
                  window.open(getNavLink(item), '_blank');
                }
              }}
            >
              {item.toUpperCase()}
            </Link>
            
            
            ))}
          </div> */}
<div className="
  space-x-8 
  flex 
  items-center 
  relative
  text-[12px]
  font-['system-ui,_-apple-system,_Segoe_UI,_Roboto,_Ubuntu,_Cantarell,_Noto_Sans,_sans-serif,_BlinkMacSystemFont,_Helvetica_Neue,_Arial,_Liberation_Sans,_Apple_Color_Emoji,_Segoe_UI_Emoji,_Segoe_UI_Symbol,_Noto_Color_Emoji']
  font-extrabold
  text-[#444444]
  leading-[18px]
">
  {['blogs', 'docs', 'tutorial', 'Mapper'].map(item => (
    <a
      key={item}
      href="#"
      className={`
        text-[#444444] 
        hover:text-blue-500 
        px-2 
        py-2 
        relative 
        font-extrabold
        ${
          activeNavItem === item 
            ? 'after:content-[""] after:absolute after:left-0 after:right-0 after:h-0.5 after:bg-[#1B4E8D] after:-bottom-[0.5rem] z-10' 
            : ''
        }
      `}
      onClick={(e) => handleNavClick(item, e)}
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
          
        {showTutorial ? (
  <div className="flex flex-col h-full">
    <div className="border-b">
      <div className="flex justify-between items-center h-[30px] px-4">
      <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
  TABLE OF CONTENTS
</span>
      </div>
    </div>
    <div className="h-full overflow-y-auto bg-[#f8f9fa] mt-4">
  {tutorialData.map((topic) => (
    <TopicItem 
      key={topic.id}
      topic={topic}
      selectedTopic={selectedTopic}
      selectedSubTopic={selectedSubTopic}
      openSections={openSections}
      setSelectedTopic={setSelectedTopic}
      setSelectedSubTopic={setSelectedSubTopic}
      setOpenSections={setOpenSections}
      depth={0}
      tutorialExerciseSuccess={tutorialExerciseSuccess} // Add this prop
    />
  ))}
</div>
  </div>
) : isPayloadView ? (
            <div className="flex flex-col h-full overflow-auto"
            style={{...scrollbarStyle}}>
              <div className="border-b">
              <div className="flex justify-between items-center h-[30px] px-2 min-w-[200px]">
  {/* Left section with arrow and PAYLOAD text */}
  <div className="flex items-center">
    <button 
      onClick={handleBackClick} 
      className="text-gray-600 bg-white border-none outline-none h-[30px] flex items-center focus:outline-none focus:border-none mr-0"
    >
      <img
        src="/toolbarExpand-Active.svg"
        alt="SnapLogic Logo"
        className="w-3 h-3"
      />
    </button>
    <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
  PAYLOAD
</span>
  </div>

  {/* Right section with JSON dropdown */}
  <div className="ml-8">
    <FormatDropdown onFormatChange={handleFormatChange} />
  </div>
</div>
</div>

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
          ) :(
            <>
            <div className="h-1/2 border-b overflow-auto" style={responsiveStyles.panels}>
            <div className="input-explorer-section">

            <div className="border-b">
  <div className="flex justify-between items-center h-[30px]  px-4">
    {/* <span className="font-bold text-gray-600  font-['Manrope'] text-xs">INPUT EXPLORER</span> */}
    <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
  INPUT EXPLORER
</span>
    <button
      onClick={() => setShowInputContainer(true)}
      className="text-l bg-white  text-[rgb(107,108,109)] border-none focus:outline-none h-[30px] flex items-center border-r-2"
      style={{ borderRight: "0px" }}
    >
      {/* + */}
      <img
  src="/add-Hover.svg"
  alt="SnapLogic Logo"
 className="text-gray-500 h-3 w-3"
/>




    </button>
  </div>
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
      className={`flex items-center text-sm text-gray-600 p-1.5 cursor-pointer w-full group
        ${activeInput === input
          ? 'bg-gray-100 relative before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[2px] before:bg-blue-500 after:absolute after:top-0 after:bottom-0 after:right-0 after:w-[2px] after:bg-blue-500 after:rounded-r-full group-hover:rounded-r-full after:group-hover:rounded-r-full hover:bg-gray-200'
          : 'hover:bg-gray-200 hover:rounded-r-full'}`}
      onClick={() => handleInputClick(input, index)}
    >
      <span className="text-blue-500 px-4">json</span>
      <span>{input}</span>
    </div>
  ))}
</div>
              </div>
             
              <div className="h-1/2 overflow-auto" style={responsiveStyles.panels}>
              <div className="script-explorer-section">
              <div className="border-b">
  <div className="flex justify-between items-center h-[30px] px-4">
    {/* <span className="font-bold text-gray-600 font-['Manrope'] text-xs">SCRIPT EXPLORER</span>
     */}
     <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
  SCRIPT EXPLORER
</span>
    <button
      onClick={() => setShowScriptContainer(true)}
      className="text-l text-gray-500 bg-white text-[rgb(107,108,109)] border-none focus:outline-none h-[30px] flex items-center border-r-2"
      style={{ borderRight: "0px" }}
    >
      {/* + */}
      <img
  src="/add-Hover.svg"
  alt="SnapLogic Logo"
 className="text-gray-500 h-3 w-3"
/>
    </button>
  </div>
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
                {showTutorial ? (
  <>
    <div className="border-b">
      <div className="flex justify-between items-center h-[30px] px-4">
        {/* <span className="font-bold text-gray-600 font-['Manrope'] text-xs">EXPLANATION</span>
         */}
         <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
  EXPLANATION
</span>
      </div>
    </div>
    
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Title Section */}
        <h1 className="text-[31px] font-['system-ui'] text-[#444444] mb-4">
          {(selectedSubTopic || selectedTopic).title}
        </h1>
        
        {/* Blue Separator Line */}
        <div className="h-[0.5px] bg-[#1B4E8D] w-full mb-6"></div>

        {/* Content Section */}
        <div className="prose max-w-none mb-4 bg-white ">
                  <pre className="text-[14px] font-['system-ui'] text-[#5C5C5C] leading-6 whitespace-pre-wrap">
                    {(selectedSubTopic || selectedTopic).content}
                  </pre>
                </div>

        {/* Code Example Section */}
        {(selectedSubTopic || selectedTopic).codeExample && (
  <div className="flex flex-col space-y-6 mb-8 bg-white">
    {/* Input Section */}
    <div>
      <h3 className="text-[15px] font-semibold mb-2 text-[#1B4E8D]">Input:</h3>
      <div className="rounded-lg overflow-hidden bg-white border shadow-sm">
        
        <div className="p-4 bg-gray-100">
          <pre className="text-[14px] font-mono leading-6">
            <code className="text-gray-500">
              {(selectedSubTopic || selectedTopic).codeExample.input?.split('\n').map((line, i) => (
                <div key={i} className="whitespace-pre flex">
                  {/* <span className="select-none text-gray-400 mr-4 inline-block w-8 text-right">{i + 1}</span> */}
                  {line}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>

    {/* Script Section */}
    <div>
      <h3 className="text-[15px] font-semibold mb-2 text-[#1B4E8D]">Script:</h3>
      <div className="rounded-lg overflow-hidden bg-white border shadow-sm">
        
        <div className="p-4 bg-gray-100">
          <pre className="text-[14px] font-mono leading-6">
            <code className="text-gray-500">
              {(selectedSubTopic || selectedTopic).codeExample.script?.split('\n').map((line, i) => (
                <div key={i} className="whitespace-pre flex">
                  {/* <span className="select-none text-gray-400 mr-4 inline-block w-8 text-right">{i + 1}</span> */}
                  {line}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>

    {/* Output Section */}
    <div>
      <h3 className="text-[15px] font-semibold mb-2 text-[#1B4E8D]">Output:</h3>
      <div className="rounded-lg overflow-hidden bg-white border shadow-sm">
        
        <div className="p-4 bg-gray-100">
          <pre className="text-[14px] font-mono leading-6">
            <code className="text-gray-500">
              {(selectedSubTopic || selectedTopic).codeExample.output?.split('\n').map((line, i) => (
                <div key={i} className="whitespace-pre flex">
                  {/* <span className="select-none text-gray-400 mr-4 inline-block w-8 text-right">{i + 1}</span> */}
                  {line}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
    <div className="h-[0.5px] bg-[#1B4E8D] w-full mb-6"></div>

     {/* Exercise Section */}
     {(selectedSubTopic || selectedTopic).exercise && (
      <div className="mb-8">
        <h2 className="text-[24px] font-['system-ui'] text-[#444444] mb-4">Exercise</h2>
        
        {/* Exercise Description */}
        <div className="mb-6">
          <pre className="text-[14px] font-['system-ui'] text-[#5C5C5C] leading-6 whitespace-pre-wrap">
            {(selectedSubTopic || selectedTopic).exercise.description}
          </pre>
        </div>

        {/* Exercise Expected Output */}
        <div className="mb-6">
          <h3 className="text-[15px] font-semibold mb-2 text-[#1B4E8D]">Expected Output:</h3>
          <div className="rounded-lg overflow-hidden bg-white border shadow-sm">
            <div className="p-4 bg-gray-100">
              <pre className="text-[14px] font-mono leading-6">
                <code className="text-gray-500">
                  {(selectedSubTopic || selectedTopic).exercise.expectedOutput?.split('\n').map((line, i) => (
                    <div key={i} className="whitespace-pre flex">
                      {line}
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Exercise Input */}
        <div className="mb-6">
  <h3 className="text-[15px] font-semibold mb-2 text-[#1B4E8D]">Input:</h3>
  <div className="rounded-lg overflow-hidden bg-white border shadow-sm">
    <div className="p-4 bg-gray-100">
      <pre className="text-[14px] font-mono leading-6">
        <code className="text-gray-500">
          {(() => {
            const inputStr = (selectedSubTopic || selectedTopic).exercise.input;
            try {
              // Parse and re-stringify to ensure proper JSON formatting
              const parsedInput = parseExerciseInput(inputStr);
              return JSON.stringify(parsedInput, null, 2)
                .split('\n')
                .map((line, i) => (
                  <div key={i} className="whitespace-pre flex">
                    {line}
                  </div>
                ));
            } catch (error) {
              console.error('Error formatting input:', error);
              return inputStr.split('\n').map((line, i) => (
                <div key={i} className="whitespace-pre flex">
                  {line}
                </div>
              ));
            }
          })()}
        </code>
      </pre>
    </div>
  </div>
</div>



        
      </div>
    )}

    

  </div>
)}



        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-auto pt-4">
       {/* Prev Button */}
  <button
    onClick={() => handlePrevNavigation()}
    className={`
      min-w-[36px] h-[42px] px-6
      rounded-[22px] outline-none 
      cursor-pointer font-normal text-base
      border-2 border-transparent mt-2.5 mb-2.5
      flex items-center justify-center
      transition-all duration-200
      focus:outline-none focus:border-transparent
      ${hasPrev 
        ? 'text-[#1B4E8D] hover:border-[#1B4E8D] hover:bg-white-500' 
        : 'text-[#1B4E8D] hover:border-[#1B4E8D] hover:bg-white-500 cursor-not-allowed'
      }
    `}
  >
    Prev
  </button>

  {/* Next Button */}
  <button
    onClick={() => handleNextNavigation()}
    className={`
      min-w-[36px] h-[42px] px-6
      rounded-[22px] outline-none
      cursor-pointer font-normal text-base
      border-2 border-transparent mt-2.5 mb-2.5
      flex items-center justify-center
      transition-all duration-200
      focus:outline-none focus:border-transparent
      ${hasNext 
        ? 'bg-[#1B4E8D] text-white hover:bg-white hover:text-[#1B4E8D] hover:border-[#1B4E8D]' 
        : 'bg-[#1B4E8D] text-white opacity-50  hover:text-[#1B4E8D] hover:border-[#1B4E8D] cursor-not-allowed'
      }
    `}
  >
    Next
  </button>



        </div>
      </div>
    </div>
  </>
) :
          (
            <>
            <div className="script-section">
            <div className="border-b">
            <div className="flex items-center justify-between min-h-[30px] px-4">
              {/* <span className="font-bold text-gray-600 font-['Manrope'] text-xs">SCRIPT</span> */}
              <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
  SCRIPT
</span>
              <div className="flex items-center">
                {outputMatch ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    {/* <span className="text-gray-500  font-['Manrope'] text-[12px]">SUCCESS</span> */}
                    <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
  SUCCESS
</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    {/* <span className="text-gray-500 font-['Manrope'] text-xs">FAILURE</span> */}
                    <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
  FAILURE
</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>

          <div className="p-2 pl-2 pr-0 flex flex-1 font-mono text-sm h-full font-['Manrope'] relative "
          style={{ overflow: 'hidden' }}>
            <div className="flex flex-1 " style={scrollbarStyle}>
 
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
            backgroundColor: '#1e1e1e',
            zIndex: 11
          }}
        />




</div>

</>

)}






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
                  {showTutorial?(
                    <>
                     <div className="h-1/2 border-b overflow-hidden">
      <div className="border-b">
        <div className="flex items-center justify-between min-h-[30px] px-4">
          {/* <span className="font-bold text-gray-600 font-['Manrope'] text-xs">SCRIPT</span> */}
          <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
SCRIPT
</span>
          <div className="flex items-center">
          {tutorialExerciseSuccess ? (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-[12px] font-system-default font-bold text-[rgb(107,108,109)] leading-[18px]">
                    SUCCESS
                  </span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-[12px] font-system-default font-bold text-[rgb(107,108,109)] leading-[18px]">
                    FAILURE
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="p-2 pl-2 pr-0 flex flex-1 font-mono text-sm h-[calc(100%-30px)] font-['Manrope'] relative"
        style={{ overflow: 'hidden' }}>
        <div className="flex flex-1" style={scrollbarStyle}>
  {/* console.log("Passing payload to HighlightedScript:", getPayloadData()); */}

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
            backgroundColor: '#1e1e1e',
            zIndex: 11
          }}
        />
      </div>
    </div>

          <div className="h-1/2 ">
            <div className="border-b">
              <div className="flex justify-between items-center h-[30px] px-4">
                {/* <span className="font-bold text-gray-600 font-['Manrope'] text-xs">OUTPUT</span> */}
                <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
  OUTPUT
</span>
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
    
</div>




          </div>
                    </>
                  ):(<>
                  
          {/* Actual Output Section */}
          <div className="h-1/2 border-b overflow-hidden">
          <div className="actual-output-section">
            <div className="border-b">
              <div className="flex justify-between items-center h-[30px] px-4">
                {/* <span className="font-bold text-gray-600 font-['Manrope'] text-xs">ACTUAL OUTPUT</span> */}
                <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
  ACTUAL OUTPUT
</span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 font-['Manrope']">
                    <FormatDropdown />
                   
                  </div>
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
    
</div>




          </div>
          {/* Expected Output Section */}
          <div className="h-1/2">
          <div className="expected-output-section">
            <div className="border-b">
              <div className="flex justify-between items-center h-[30px] px-4">
                {/* <span className="font-bold text-gray-600 font-['Manrope'] text-xs">EXPECTED OUTPUT</span> */}
                <span className="
  text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px]
">
EXPECTED OUTPUT
</span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 font-['Manrope']">
                    <FormatDropdown />
                  </div>
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
              
            </div>
          </div>
          </>
                  )}
        </div>
     
        </div>




{/* Bottom Bar */}
<div
  className="border-t flex flex-col"
  style={{
    height: `${bottomHeight}px`,
    minHeight: '32px',
    maxHeight: '250px',
    transition: isDragging ? 'none' : 'height 0.2s ease-in-out',
    ...(showTutorial ? {
      position: 'sticky',
      bottom: 0,
      backgroundColor: 'white',
      zIndex: 50,
      width: '100%'
    } : {
      position: 'relative' // Default positioning when tutorial is off
    })
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
  {/* <TooltipProvider delayDuration={50}>
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
  </TooltipProvider> */}
</div>

    {/* <span className=" font-['Manrope'] text-sm text-gray-400 absolute left-[calc(45%+0px)] tracking-[0.03em] flex items-center h-full z-10"> */}
      {/* ©2023 Snaplogic LLC, a Salesforce company */}
      {/* SnapLogic Playground – Redefining Integration.
    </span> */}
   <div className="relative w-full h-full flex items-center justify-center px-4">
  {/* Left side - Made in India and Powered by */}
  <div className="font-system-default text-[0.69rem] flex items-center absolute">
    <div className="flex items-center">
      <span className="text-gray-500">Made</span>
      <span className="text-gray-500 mx-1">in</span>
      <span className="text-gray-500 font-semibold hover:text-blue-800 cursor-pointer transition-colors">
        Tamil Nadu, India
      </span>
      
      {/* Indian Flag */}
      <div className="ml-1 w-4 h-3 flex-shrink-0">
        <svg 
          viewBox="0 0 6 4" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="6" height="1.33333" fill="#FF9933"/>
          <rect y="1.33333" width="6" height="1.33333" fill="#FFFFFF"/>
          <rect y="2.66667" width="6" height="1.33333" fill="#138808"/>
          <circle cx="3" cy="2" r="0.4" fill="#000080"/>
          <path d="M3 1.7L3.2 2.3L2.8 2.3L3 1.7Z" fill="#000080"/>
        </svg>
      </div>

      {/* Separator */}
      <span className="text-gray-400 mx-3">|</span>

      {/* Powered by Section */}
      <span className="text-gray-500">Powered by</span>
      <a 
        href="https://www.mulecraft.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-500 font-semibold hover:text-blue-800 transition-colors ml-1"
      >
        MuleCraft
      </a>
    </div>
  </div>

  {/* Right side - Support Button */}
  <div className="flex items-center">
    <SupportButton />
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
    </>
  );
};




export default UpdatedCode;



































































