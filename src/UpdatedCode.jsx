import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HighlightedJson from './utils/HighLightedJson';
import HighlightedScript from './utils/HighlightedScript';
import HighlightedActualOutput from './utils/HighlightedActualOutput';
import HighlightedExpectedOutput from './utils/HighlightedExpectedOutput';
import SnaplogicTutorial from './components/ui/snaplogicTutorial';
import { evaluateScriptExpression } from './utils/scriptHandler';

const UpdatedCode = () => {
  const [jsonContent, setJsonContent] = useState('{}');
  const [scriptContent, setScriptContent] = useState('$');
  const [actualOutput, setActualOutput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState({});
  const [currentExercise, setCurrentExercise] = useState({
    input: '{\n  "text": "mulecraft"\n}',
    expectedOutput: '"MULECRAFT"',
    description: 'Convert the input string to uppercase to get "MULECRAFT".'
  });

  // Toggle tutorial view
  const handleTutorialClick = () => {
    setShowTutorial(true);
  };

  // Handle script content changes for both regular and tutorial modes
  const handleScriptContentChange = (newContent) => {
    setScriptContent(newContent);
    
    try {
      // For regular mode (non-tutorial)
      if (!showTutorial) {
        const parsedJsonContent = jsonContent ? JSON.parse(jsonContent) : {};
        const result = evaluateScriptExpression(newContent, parsedJsonContent);
        setActualOutput(JSON.stringify(result, null, 2));
      } 
      // For tutorial mode
      else {
        // Get input from the current exercise
        const tutorialInput = currentExercise.input ? JSON.parse(currentExercise.input) : {};
        const result = evaluateScriptExpression(newContent, tutorialInput);
        setActualOutput(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setActualOutput(JSON.stringify({ error: error.message }, null, 2));
    }
  };

  // Handle JSON content changes (for regular mode)
  const handleJsonContentChange = (newContent) => {
    setJsonContent(newContent);
    
    try {
      if (newContent && scriptContent) {
        const parsedJsonContent = JSON.parse(newContent);
        const result = evaluateScriptExpression(scriptContent, parsedJsonContent);
        setActualOutput(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setActualOutput(JSON.stringify({ error: error.message }, null, 2));
    }
  };

  // Handle tutorial exercise input changes
  const handleTutorialInputChange = (newInput) => {
    setCurrentExercise({
      ...currentExercise,
      input: newInput
    });
    
    try {
      if (newInput && scriptContent) {
        const parsedInput = JSON.parse(newInput);
        const result = evaluateScriptExpression(scriptContent, parsedInput);
        setActualOutput(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      setActualOutput(JSON.stringify({ error: error.message }, null, 2));
    }
  };

  // Handle expected output changes for tutorials
  const handleExpectedOutputChange = (newOutput) => {
    setCurrentExercise({
      ...currentExercise,
      expectedOutput: newOutput
    });
  };

  // Handle clicks on navigation
  const handleNavClick = (navItem) => {
    if (navItem === 'tutorial') {
      setShowTutorial(true);
    } else {
      setShowTutorial(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/sl-logo.svg" alt="SnapLogic Logo" className="h-8 w-8" />
          <span className="text-lg font-semibold text-gray-800">SnapMapper</span>
        </div>
        
        <div className="flex space-x-6">
          <button 
            className={`px-3 py-1 ${!showTutorial ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => handleNavClick('mapper')}
          >
            MAPPER
          </button>
          <button 
            className={`px-3 py-1 ${showTutorial ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => handleNavClick('tutorial')}
          >
            TUTORIAL
          </button>
          <Link to="/docs" className="px-3 py-1 text-gray-600 hover:text-gray-800">
            DOCS
          </Link>
          <button className="px-3 py-1 text-gray-600 hover:text-gray-800">
            BLOGS
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {showTutorial ? (
          // Tutorial Layout with three panels
          <div className="flex h-full">
            {/* Left sidebar - Table of Contents */}
            <div className="w-1/4 border-r border-gray-200 p-4 bg-gray-50 overflow-y-auto">
              <h2 className="font-semibold mb-4 text-gray-800">TABLE OF CONTENTS</h2>
              <SnaplogicTutorial />
            </div>
            
            {/* Middle panel - Explanation */}
            <div className="w-5/12 border-r border-gray-200 p-6 overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-6">Exercise</h2>
              <p className="mb-6">{currentExercise.description}</p>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-blue-600 mb-2">Expected Output:</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <HighlightedExpectedOutput
                    expectedOutput={currentExercise.expectedOutput}
                    onExpectedOutputChange={handleExpectedOutputChange}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-blue-600 mb-2">Input:</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <HighlightedJson
                    content={currentExercise.input}
                    onChange={handleTutorialInputChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Right panel - Script and Output */}
            <div className="w-1/3 flex flex-col">
              <div className="h-1/2 border-b border-gray-200 p-4">
                <h3 className="text-lg font-medium mb-2">SCRIPT</h3>
                <HighlightedScript 
                  content={scriptContent} 
                  onChange={handleScriptContentChange}
                  payload={currentExercise.input ? JSON.parse(currentExercise.input) : {}}
                />
              </div>
              <div className="h-1/2 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">OUTPUT</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">JSON</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <HighlightedActualOutput actualOutput={actualOutput} />
              </div>
            </div>
          </div>
        ) : (
          // Regular Mapper Layout with two panels
          <div className="flex flex-1">
            {/* Left panel */}
            <div className="w-1/2 flex flex-col border-r border-gray-200">
              <div className="h-1/2 border-b border-gray-200 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">INPUT</h3>
                  <div className="flex items-center space-x-2">
                    <img src="/oui--import.svg" alt="Import" className="h-4 w-4" />
                    <img src="/oui--export.svg" alt="Export" className="h-4 w-4" />
                  </div>
                </div>
                <HighlightedJson 
                  content={jsonContent} 
                  onChange={handleJsonContentChange} 
                />
              </div>
              <div className="h-1/2 p-4">
                <h3 className="text-lg font-medium mb-2">EXPECTED OUTPUT</h3>
                <HighlightedExpectedOutput 
                  expectedOutput={expectedOutput} 
                  onExpectedOutputChange={setExpectedOutput} 
                />
              </div>
            </div>
            
            {/* Right panel */}
            <div className="w-1/2 flex flex-col">
              <div className="h-1/2 border-b border-gray-200 p-4">
                <h3 className="text-lg font-medium mb-2">SCRIPT</h3>
                <HighlightedScript 
                  content={scriptContent} 
                  onChange={handleScriptContentChange}
                  payload={jsonContent ? JSON.parse(jsonContent || '{}') : {}}
                />
              </div>
              <div className="h-1/2 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">ACTUAL OUTPUT</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">JSON</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <HighlightedActualOutput actualOutput={actualOutput} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatedCode;
