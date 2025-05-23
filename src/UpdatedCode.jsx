import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FormatDropdown } from './FormatDropdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Coffee, Beer, UploadCloud, DownloadCloud, Settings } from "lucide-react";
import { Documentation } from './Documentation';
import { executeScript } from '@/utils/apiService';
import HighlightedScript from '@/utils/HighlightedScript';
import OpenAIKeyModal from './OpenAIKeyModal';
import axios from 'axios';

export default function UpdatedCode() {
  const resizeTimeoutRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    leftWidth: 300,
    middleWidth: 400,
    rightWidth: 300
  });
  
  const [state, setState] = useState({
    isResizingLeft: false,
    isResizingMiddle: false,
    isInputDialogOpen: false,
    isScriptDialogOpen: false,
    showToast: true,
    scriptFormat: 'javascript',
    actualOutput: '',
    importDialogOpen: false,
    activePage: 'playground',
    showDocumentation: false,
    inputData: '{\n  "Message": "Hello World!"\n}',
    scriptContent: '',
    isLoading: false,
    actualOutput: '',
    showDocumentation: false,
    openAIKeyModalOpen: false,
  });

  const executionTimeoutRef = useRef(null);
  
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

  useEffect(() => {
    if (executionTimeoutRef.current) {
      clearTimeout(executionTimeoutRef.current);
    }

    if (!state.scriptContent.trim()) {
      return;
    }

    executionTimeoutRef.current = setTimeout(async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        let inputDataObj;
        try {
          inputDataObj = JSON.parse(state.inputData);
        } catch (error) {
          console.error('Invalid input JSON:', error);
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            actualOutput: JSON.stringify({ error: 'Invalid input JSON' }, null, 2)
          }));
          return;
        }
        
        const hasOpenAIKey = localStorage.getItem('OPENAI_API_KEY');
        if (!hasOpenAIKey) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            actualOutput: JSON.stringify({ 
              warning: "No OpenAI API key found. Script validation is disabled.",
              message: "Please add your OpenAI API key in settings to enable script validation."
            }, null, 2)
          }));
          
          setState(prev => ({ ...prev, openAIKeyModalOpen: true }));
          return;
        }
        
        const result = await executeScript(inputDataObj, state.scriptContent);
        
        if (result.success) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            actualOutput: JSON.stringify(result.data, null, 2)
          }));
        } else {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            actualOutput: JSON.stringify({ error: result.error }, null, 2)
          }));
        }
      } catch (error) {
        console.error('Execution error:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          actualOutput: JSON.stringify({ error: 'Execution failed' }, null, 2)
        }));
      }
    }, 1000);

    return () => {
      if (executionTimeoutRef.current) {
        clearTimeout(executionTimeoutRef.current);
      }
    };
  }, [state.scriptContent, state.inputData]);

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
      setState(prev => ({ ...prev, showDocumentation: true, activePage: 'docs' }));
    } else {
      setState(prev => ({ ...prev, activePage: page, showDocumentation: false }));
    }
  };

  const handleInputChange = (value) => {
    setState(prev => ({ ...prev, inputData: value }));
  };

  const validateScriptWithGPT = async (script) => {
    try {
      const apiKey = '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';
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a script validator for SnapLogic expressions. Analyze the script for syntax errors or logical issues. Return a JSON response with "valid" (boolean) and "error" (string or null) properties.'
          },
          {
            role: 'user',
            content: `Validate this script: \n\n${script}`
          }
        ],
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      try {
        const responseContent = response.data.choices[0].message.content;
        const validationResult = JSON.parse(responseContent);
        
        if (!validationResult.valid && validationResult.error) {
          return {
            success: false,
            data: null,
            error: validationResult.error
          };
        }
        
        return {
          success: true,
          data: { message: "Script validation passed" },
          error: null
        };
      } catch (parseError) {
        const responseText = response.data.choices[0].message.content;
        if (responseText.toLowerCase().includes('error') || responseText.toLowerCase().includes('invalid')) {
          return {
            success: false,
            data: null,
            error: responseText
          };
        }
        return {
          success: true,
          data: { message: "Script validation passed" },
          error: null
        };
      }
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Error validating script with GPT'
      };
    }
  };

  const handleScriptChange = async (value) => {
    setState(prev => ({ ...prev, scriptContent: value, isLoading: true }));

    if (executionTimeoutRef.current) {
      clearTimeout(executionTimeoutRef.current);
    }

    executionTimeoutRef.current = setTimeout(async () => {
      if (!value.trim()) {
        setState(prev => ({ ...prev, isLoading: false, actualOutput: '' }));
        return;
      }

      try {
        let inputDataObj;
        try {
          inputDataObj = JSON.parse(state.inputData);
        } catch (error) {
          console.error('Invalid input JSON:', error);
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            actualOutput: JSON.stringify({ error: 'Invalid input JSON' }, null, 2)
          }));
          return;
        }

        const validationResult = await validateScriptWithGPT(value);
        
        if (!validationResult.success) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            actualOutput: JSON.stringify({ error: validationResult.error }, null, 2)
          }));
          return;
        }
        
        const result = await executeScript(inputDataObj, value);
        
        if (result.success) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            actualOutput: JSON.stringify(result.data, null, 2)
          }));
        } else {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            actualOutput: JSON.stringify({ error: result.error }, null, 2)
          }));
        }
      } catch (error) {
        console.error('Execution error:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          actualOutput: JSON.stringify({ error: 'Execution failed: ' + error.message }, null, 2)
        }));
      }
    }, 1000);
  };

  const openApiKeyModal = () => {
    setState(prev => ({ ...prev, openAIKeyModalOpen: true }));
  };

  const closeApiKeyModal = () => {
    setState(prev => ({ ...prev, openAIKeyModalOpen: false }));
  };

  if (state.showDocumentation) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden font-['Manrope']">
        <div 
          className="fixed inset-0 z-[-1]" 
          style={{
            backgroundImage: 'url("/lovable-uploads/e097fd02-e653-4b86-95e5-09646c987272.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }} 
        />
        
        {state.showToast && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 relative">
            <div className="text-center px-12 font-bold font-['Manrope'] text-[1rem] tracking-[0.09em]">
              Discover the Future of Integration. Explore SnapLogic Playground Highlights
            </div>
            <button
              onClick={() => setState(prev => ({ ...prev, showToast: false }))}
              className="absolute right-4 top-0 h-full bg-transparent text-white border-none outline-none focus:outline-none font-bold text-[18px] flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <img src="/sl-logo.svg" alt="SnapLogic Logo" className="h-8 w-8" />
            <span className="text-lg font-semibold text-gray-800">SnapLogic Playground</span>
          </div>
          
          <div className="flex items-center space-x-8">
            <button 
              onClick={(e) => handleNavigation('blogs', e)}
              className={`px-2 py-1 text-sm font-medium transition-colors ${state.activePage === 'blogs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              BLOGS
            </button>
            <button 
              onClick={(e) => handleNavigation('docs', e)}
              className={`px-2 py-1 text-sm font-medium transition-colors ${state.showDocumentation ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              DOCS
            </button>
            <button 
              onClick={(e) => handleNavigation('tutorial', e)}
              className={`px-2 py-1 text-sm font-medium transition-colors ${state.activePage === 'tutorial' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              TUTORIAL
            </button>
            <button 
              onClick={(e) => handleNavigation('playground', e)}
              className={`px-2 py-1 text-sm font-medium transition-colors ${state.activePage === 'playground' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              PLAYGROUND
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700 transition-all duration-200 rounded shadow-sm px-4 py-2 h-9 flex items-center justify-center"
            >
              <span className="mr-2">Export</span>
              <DownloadCloud className="h-4 w-4 text-blue-600" />
            </Button>
            <Button 
              variant="outline" 
              onClick={openImportDialog}
              className="bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700 transition-all duration-200 rounded shadow-sm px-4 py-2 h-9 flex items-center justify-center"
            >
              <span className="mr-2">Import</span>
              <UploadCloud className="h-4 w-4 text-blue-600" />
            </Button>
            <Button 
              variant="outline" 
              onClick={openApiKeyModal}
              className="bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700 transition-all duration-200 rounded shadow-sm px-4 py-2 h-9 flex items-center justify-center"
            >
              <span className="mr-2">Settings</span>
              <Settings className="h-4 w-4 text-blue-600" />
            </Button>
          </div>
        </div>

        <Documentation onBack={() => setState(prev => ({ ...prev, showDocumentation: false, activePage: 'playground' }))} />

        <div className="border-t border-gray-200 py-3 px-6 text-sm text-gray-700 bg-white/90 shadow-sm relative backdrop-blur-sm">
          <div className="flex justify-center items-center">
            <img 
              src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7" 
              alt="Code background" 
              className="h-6 mx-auto"
            />
          </div>
          
          <div className="font-['Manrope'] text-[0.69rem] text-gray-300 absolute left-[calc(45%+0px)] tracking-[0.04em] flex items-center h-full z-10 gap-2.5 font-medium">
            <span className="text-gray-500">Made with</span>
            <div className="inline-flex items-center gap-2.5">
              <div className="relative w-[18px] h-[18px] animate-pulse transition-transform hover:scale-110">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 19h18v2H2v-2zm2-8v5c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2zm15 0v5H5v-5h14zm-6.75-7L15 8H9l2.75-4z" fill="#374151"/>
                  <path d="M19 10h2c0-2.21-1.79-4-4-4h-2l2 4z" fill="#374151"/>
                </svg>
              </div>
              <span className="text-gray-500 font-semibold">&</span>
              <div className="relative w-[18px] h-[18px] animate-bounce transition-transform hover:scale-110">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3h10v2h-10z" fill="#D97706"/>
                  <path d="M18 8c-0.4-2.3-2.4-4-4.8-4h-2.4c-2.4 0-4.4 1.7-4.8 4h-1v12h14v-12h-1zM8 18v-8h8v8h-8z" fill="#D97706"/>
                  <path d="M10 11h4v3h-4z" fill="#ffffff"/>
                </svg>
              </div>
            </div>
            <span className="text-gray-500">in</span>
            <span className="text-gray-500 font-semibold hover:text-blue-800 cursor-pointer transition-colors">
              Tamil Nadu, India
            </span>
            <span className="mx-2.5 text-gray-400">|</span>
            <span className="text-gray-500">Powered by</span>
            <a 
              href="https://www.mulecraft.in/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 font-semibold hover:text-blue-800 transition-colors relative group"
            >
              Mulecraft
            </a>
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-['Manrope']">
      <div 
        className="fixed inset-0 z-[-1]" 
        style={{
          backgroundImage: 'url("/lovable-uploads/e097fd02-e653-4b86-95e5-09646c987272.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }} 
      />
      
      {state.showToast && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 relative">
          <div className="text-center px-12 font-bold font-['Manrope'] text-[1rem] tracking-[0.09em]">
            Discover the Future of Integration. Explore SnapLogic Playground Highlights
          </div>
          <button
            onClick={() => setState(prev => ({ ...prev, showToast: false }))}
            className="absolute right-4 top-0 h-full bg-transparent text-white border-none outline-none focus:outline-none font-bold text-[18px] flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <img src="/sl-logo.svg" alt="SnapLogic Logo" className="h-8 w-8" />
          <span className="text-lg font-semibold text-gray-800">SnapLogic Playground</span>
        </div>
        
        <div className="flex items-center space-x-8">
          <button 
            onClick={(e) => handleNavigation('blogs', e)}
            className={`px-2 py-1 text-sm font-medium transition-colors ${state.activePage === 'blogs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            BLOGS
          </button>
          <button 
            onClick={(e) => handleNavigation('docs', e)}
            className={`px-2 py-1 text-sm font-medium transition-colors ${state.showDocumentation ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            DOCS
          </button>
          <button 
            onClick={(e) => handleNavigation('tutorial', e)}
            className={`px-2 py-1 text-sm font-medium transition-colors ${state.activePage === 'tutorial' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            TUTORIAL
          </button>
          <button 
            onClick={(e) => handleNavigation('playground', e)}
            className={`px-2 py-1 text-sm font-medium transition-colors ${state.activePage === 'playground' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            PLAYGROUND
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700 transition-all duration-200 rounded shadow-sm px-4 py-2 h-9 flex items-center justify-center"
          >
            <span className="mr-2">Export</span>
            <DownloadCloud className="h-4 w-4 text-blue-600" />
          </Button>
          <Button 
            variant="outline" 
            onClick={openImportDialog}
            className="bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700 transition-all duration-200 rounded shadow-sm px-4 py-2 h-9 flex items-center justify-center"
          >
            <span className="mr-2">Import</span>
            <UploadCloud className="h-4 w-4 text-blue-600" />
          </Button>
          <Button 
            variant="outline" 
            onClick={openApiKeyModal}
            className="bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700 transition-all duration-200 rounded shadow-sm px-4 py-2 h-9 flex items-center justify-center"
          >
            <span className="mr-2">Settings</span>
            <Settings className="h-4 w-4 text-blue-600" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex mx-4 my-4 rounded-md overflow-hidden shadow-xl">
        <div
          style={{
            width: `${dimensions.leftWidth}px`,
            minWidth: '250px',
            borderRight: '1px solid #e5e7eb'
          }}
          className="overflow-y-auto bg-white/95 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Inputs</h2>
            <Button 
              variant="outline" 
              onClick={handleInputDialogOpen}
              className="bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-sm h-8 px-3 py-1 text-xs"
            >
              Add
            </Button>
          </div>
          
          <div className="p-4">
            <Label htmlFor="inputData" className="block text-sm font-medium text-gray-700 mb-2">
              Input JSON
            </Label>
            <div className="rounded-sm border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
              <Editor
                height="30vh"
                width="100%"
                language="json"
                theme="light"
                value={state.inputData}
                onChange={handleInputChange}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  wrappingIndent: 'indent',
                  automaticLayout: true,
                  fontSize: 13,
                  fontFamily: "'Manrope', 'Monaco', monospace",
                  padding: { top: 12, bottom: 12 }
                }}
              />
            </div>
          </div>
          
          {state.isInputDialogOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
              <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full mx-4 transform transition-all duration-200 opacity-100 scale-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Input</h2>
                <div className="mb-4">
                  <Label htmlFor="inputName" className="block text-sm font-medium text-gray-700 mb-1">Input Name</Label>
                  <input
                    id="inputName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            width: `${dimensions.middleWidth}px`,
            minWidth: '250px',
            borderRight: '1px solid #e5e7eb'
          }}
          className="flex flex-col bg-white/95 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Script</h2>
            <div className="flex items-center space-x-4">
              <FormatDropdown onFormatChange={handleFormatChange} />
              <Button 
                variant="outline" 
                onClick={handleScriptDialogOpen}
                className="bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-sm h-8 px-3 py-1 text-xs"
              >
                Add
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <div className="bg-white border border-gray-200 rounded-sm h-full shadow-sm hover:shadow-md transition-shadow duration-300">
              <HighlightedScript
                content={state.scriptContent}
                onChange={handleScriptChange}
                payload={state.inputData}
              />
            </div>
          </div>
          
          {state.isScriptDialogOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
              <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full mx-4 transform transition-all duration-200 opacity-100 scale-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add Script</h2>
                <div className="mb-4">
                  <Label htmlFor="scriptName" className="block text-sm font-medium text-gray-700 mb-1">Script Name</Label>
                  <input
                    id="scriptName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 py-3 px-6 text-sm text-gray-700 bg-white/90 shadow-sm relative backdrop-blur-sm">
        <div className="flex justify-center items-center">
          <img 
            src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7" 
            alt="Code background" 
            className="h-6 mx-auto"
          />
        </div>
        
        <div className="font-['Manrope'] text-[0.69rem] text-gray-300 absolute left-[calc(45%+0px)] tracking-[0.04em] flex items-center h-full z-10 gap-2.5 font-medium">
          <span className="text-gray-500">Made with</span>
          <div className="inline-flex items-center gap-2.5">
            <div className="relative w-[18px] h-[18px] animate-pulse transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 19h18v2H2v-2zm2-8v5c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2zm15 0v5H5v-5h14zm-6.75-7L15 8H9l2.75-4z" fill="#374151"/>
                <path d="M19 10h2c0-2.21-1.79-4-4-4h-2l2 4z" fill="#374151"/>
              </svg>
            </div>
            <span className="text-gray-500 font-semibold">&</span>
            <div className="relative w-[18px] h-[18px] animate-bounce transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3h10v2h-10z" fill="#D97706"/>
                <path d="M18 8c-0.4-2.3-2.4-4-4.8-4h-2.4c-2.4 0-4.4 1.7-4.8 4h-1v12h14v-12h-1zM8 18v-8h8v8h-8z" fill="#D97706"/>
                <path d="M10 11h4v3h-4z" fill="#ffffff"/>
              </svg>
            </div>
          </div>
          <span className="text-gray-500">in</span>
          <span className="text-gray-500 font-semibold hover:text-blue-800 cursor-pointer transition-colors">
            Tamil Nadu, India
          </span>
          <span className="mx-2.5 text-gray-400">|</span>
          <span className="text-gray-500">Powered by</span>
          <a 
            href="https://www.mulecraft.in/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 font-semibold hover:text-blue-800 transition-colors relative group"
          >
            Mulecraft
          </a>
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
      
      <OpenAIKeyModal 
        isOpen={state.openAIKeyModalOpen} 
        onClose={closeApiKeyModal} 
      />
    </div>
  );
}
