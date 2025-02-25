import React, { useState } from 'react';
import { ChevronDown, Upload, Download } from "lucide-react";
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




const Sample = () => {
  const [inputs, setInputs] = useState([]); // State to store created inputs
  const [newInput, setNewInput] = useState(""); // State to store current input
  const [scriptContent, setScriptContent] = useState('$.phoneNumbers[:1].type');
  const [expectedOutput, setExpectedOutput] = useState('[\n  "Phone"\n]');
  const [actualOutput, setActualOutput] = useState('[\n  "Phone"\n]');

  // Convert content to array of lines
  const scriptLines = scriptContent.split('\n');
  const expectedLines = expectedOutput.split('\n');
  const actualLines = actualOutput.split('\n');

  const isCreateDisabled = newInput.trim() === ""; // Disable create button if input is empty


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
  };

  const handleCreateInput = () => {
    if (newInput.trim() !== "") {
      setInputs([...inputs, newInput]); // Add new input to the list
      setNewInput(""); // Clear the dialog input field
    }
  };

  const handleScriptChange = (e) => {
    setScriptContent(e.target.value);
  };

  const handleExpectedOutputChange = (e) => {
    setExpectedOutput(e.target.value);
  };

  // Common styles for textareas
  const textAreaStyles = {
    minHeight: '100px',
    lineHeight: '1.5rem',
    padding: '0',
    border: 'none'
  };
  const [showComponent, setShowComponent] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center space-x-3">
          <svg
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
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="flex items-center px-4 py-2 bg-white rounded border-none focus:outline-none group hover:text-blue-500">
            <Upload className="mr-2 group-hover:text-blue-500 text-gray-500 h-3 w-3" />
            <span className="text-gray-700 group-hover:text-blue-500 text-[0.9rem] font-normal">Export</span>
          </button>
          
          <button className="flex items-center px-4 py-2 bg-white rounded border-none focus:outline-none group hover:text-blue-500 ml-1">
            <Download className="mr-2 group-hover:text-blue-500 text-gray-500 h-3 w-3" />
            <span className="text-gray-700 group-hover:text-blue-500 text-[0.9rem] font-normal">Import</span>
          </button>
          
          <div className="space-x-6 ml-8 text-[0.82rem] font-bold text-[#333333]">
            <a className="text-black hover:text-blue-500">BLOGS</a>
            <a className="text-black hover:text-blue-500">DOCS</a>
            <a className="text-black hover:text-blue-500">TUTORIAL</a>
            <a className="text-black hover:text-blue-500">PLAYGROUND</a>
          </div>
        </div>
        
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
         {/* Left Panel */}
         <div className="w-72 border-r flex flex-col">
          <div className="h-1/2 border-b">
            <div className="border-b">
              <div className="flex justify-between items-center min-h-[30px] px-4">
                <span className="font-bold text-gray-600 text-xs">
                  INPUT EXPLORER
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-xl bg-white border-none focus:outline-none flex items-center justify-center h-6 w-6">
                      +
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="sm:max-w-[425px] bg-gray-100 p-6 shadow-md border-none"
                    style={{ borderRadius: "0" }}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-[31px] font-semibold text-gray mb-6">
                        Create new input
                      </DialogTitle>
                      <div className="border-b border-gray-300 mt-5"></div>
                    </DialogHeader>
                    <div className="py-4">
                      <Label
                        htmlFor="identifier"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Identifier
                      </Label>
                      <Input
                        id="identifier"
                        value={newInput}
                        onChange={handleInputChange}
                        placeholder=""
                        className="w-full h-12 px-3 text-lg border-b border-l border-black focus:outline-none focus:border-l-black focus:border-r-black focus:border-t-white focus:border-b-white hover:border-l-black hover:border-r-black"
                        style={{
                          borderTop: "0",
                          borderBottom: "0",
                          borderRadius: "0",
                        }}
                      />
                    </div>
                    <DialogFooter className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="h-10 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-200"
                        style={{ borderRadius: "0", borderColor: "rgb(209 213 219)" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        disabled={isCreateDisabled}
                        onClick={handleCreateInput}
                        className={`h-10 px-4 text-sm font-medium ${
                          isCreateDisabled
                            ? "text-white bg-gray-300 cursor-not-allowed"
                            : "text-white bg-blue-500 hover:bg-blue-600 cursor-pointer"
                        }`}
                        style={{ borderRadius: "0" }}
                      >
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="p-4">
              {inputs.map((input, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-gray-600"
                >
                  <span className="text-blue-500">json</span>
                  <span>{input}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-1/2">
            <div className="border-b">
              <div className="flex justify-between items-center min-h-[30px] px-4">
                <span className="font-bold text-gray-600 text-xs">SCRIPT EXPLORER</span>
                <button className="text-xl bg-white border-none focus:outline-none flex items-center justify-center h-6 w-6">
                  +
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-blue-500">main.dwl</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Panel */}
        <div className="flex-1 border-r">
          <div className="border-b">
            <div className="flex items-center min-h-[30px] px-4">
              <span className="font-bold text-gray-600 text-xs">SCRIPT</span>
            </div>
          </div>
          <div className="p-4 font-mono text-sm">
            <div className="flex relative">
              {renderLineNumbers(scriptLines)}
              <textarea
                value={scriptContent}
                onChange={handleScriptChange}
                className="flex-1 bg-transparent outline-none resize-none overflow-hidden text-gray-800 font-mono"
                style={textAreaStyles}
              />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-96 flex flex-col">
          {/* Actual Output Section */}
          <div className="h-1/2 border-b">
            <div className="border-b">
              <div className="flex justify-between items-center min-h-[30px] px-4">
                <span className="font-bold text-gray-600 text-xs">ACTUAL OUTPUT</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-600 text-xs">JSON</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex">
                {renderLineNumbers(actualLines)}
                <pre className="text-red-500">
                  {actualLines.map((line, index) => (
                    <div key={index} className="h-6">{line}</div>
                  ))}
                </pre>
              </div>
            </div>
          </div>

          {/* Expected Output Section */}
          <div className="h-1/2">
            <div className="border-b">
              <div className="flex justify-between items-center min-h-[30px] px-4">
                <span className="font-bold text-gray-600 text-xs">EXPECTED OUTPUT</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-600 text-xs">JSON</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex">
                {renderLineNumbers(expectedLines)}
                <textarea
                  value={expectedOutput}
                  onChange={handleExpectedOutputChange}
                  className="flex-1 bg-transparent outline-none resize-none overflow-hidden text-red-500 font-mono"
                  style={textAreaStyles}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t p-2 text-sm text-gray-500 flex justify-between items-center">
        <div className="flex space-x-4">
          <span>LOG VIEWER</span>
          <span>API REFERENCE</span>
        </div>
        <span>©2023 Snaplogic LLC, a Salesforce company</span>
      </div>
    </div>
  );
};

export default Sample;







