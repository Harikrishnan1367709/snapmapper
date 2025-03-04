
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronRight, ChevronDown, Edit, FileCode } from "lucide-react";

const Tutorial = ({ onBack }) => {
  return (
    <div className="flex flex-1 h-full overflow-hidden bg-white">
      {/* Left sidebar - Table of Contents */}
      <div className="w-[280px] border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">TABLE OF CONTENTS</h2>
        </div>
        
        <div className="py-2">
          {/* Chapter 1 */}
          <div className="px-4 py-2 flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-100">
            <ChevronDown className="h-4 w-4 mr-2" />
            <span className="font-medium">1 - Introduction</span>
          </div>
          
          {/* Subchapters with indentation */}
          <div className="pl-8 py-1.5 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">
            1.1 - What is SnapLogic?
          </div>
          <div className="pl-8 py-1.5 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer">
            1.2 - Getting Started
          </div>
          <div className="pl-8 py-1.5 text-sm text-blue-600 bg-blue-50 cursor-pointer font-medium">
            1.3 - Script Anatomy
          </div>
          
          {/* Chapter 2 */}
          <div className="px-4 py-2 flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-100">
            <ChevronRight className="h-4 w-4 mr-2" />
            <span className="font-medium">2 - Creating Data</span>
          </div>
          
          {/* Chapter 3 */}
          <div className="px-4 py-2 flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-100">
            <ChevronRight className="h-4 w-4 mr-2" />
            <span className="font-medium">3 - Reading Data</span>
          </div>
        </div>
      </div>
      
      {/* Middle section - Explanation */}
      <div className="flex-1 overflow-y-auto border-r border-gray-200">
        <div className="p-4 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">EXPLANATION</h2>
          <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
            <Edit className="h-4 w-4 mr-1" />
            <span>Edit on GitHub</span>
          </button>
        </div>
        
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">1.3 - Script Anatomy</h1>
          
          <p className="text-gray-700 mb-6">
            Let's go over the anatomy of a SnapLogic script using the code from the last example:
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">SL Script:</h2>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6 font-mono text-sm">
            <pre className="whitespace-pre-wrap">
              %sl 2.0
              input payload json
              output csv header=false
              ---
              payload
            </pre>
          </div>
          
          <p className="text-gray-700 mb-4">
            Notice in the script that there are three lines, a line with three dashes, 
            then one more line. The first three lines of the script contain <strong>directives</strong>.
          </p>
          
          <p className="text-gray-700 mb-4">
            The first directive, which is in every SnapLogic file, defines which 
            version the script is using. You can think of this more as a necessary 
            preamble that tells the SnapLogic interpreter how to read the rest of the script.
          </p>
          
          <p className="text-gray-700 mb-4">
            The second directive defines the inputs to the script. In this case, we're saying that 
            we expect an input named "payload" and it should be interpreted as JSON data.
          </p>
          
          <p className="text-gray-700 mb-4">
            The third directive defines the expected output of the script. Here, we're saying that 
            the output should be in CSV format and it should not include a header row.
          </p>
        </div>
      </div>
      
      {/* Right section - Script and Output */}
      <div className="w-[450px] overflow-y-auto">
        <Tabs defaultValue="script" className="w-full h-full">
          <div className="border-b border-gray-200">
            <TabsList className="px-4 h-[54px] bg-white">
              <TabsTrigger 
                value="script" 
                className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
              >
                SCRIPT
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="script" className="m-0 p-0 outline-none h-full">
            <div className="h-1/2 overflow-y-auto border-b border-gray-200">
              <div className="flex items-center pl-2 pr-4 bg-gray-50">
                <div className="flex-1 flex items-center overflow-auto whitespace-nowrap py-1">
                  <div className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 mr-2">1</div>
                  <code className="text-sm font-mono text-gray-800">
                    <span className="text-blue-600">%sl</span> 2.0
                  </code>
                </div>
              </div>
              <div className="flex items-center pl-2 pr-4">
                <div className="flex-1 flex items-center overflow-auto whitespace-nowrap py-1">
                  <div className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 mr-2">2</div>
                  <code className="text-sm font-mono text-gray-800">
                    <span className="text-blue-600">input</span> payload json
                  </code>
                </div>
              </div>
              <div className="flex items-center pl-2 pr-4 bg-gray-50">
                <div className="flex-1 flex items-center overflow-auto whitespace-nowrap py-1">
                  <div className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 mr-2">3</div>
                  <code className="text-sm font-mono text-gray-800">
                    <span className="text-blue-600">output</span> csv header=<span className="text-red-600">false</span>
                  </code>
                </div>
              </div>
              <div className="flex items-center pl-2 pr-4">
                <div className="flex-1 flex items-center overflow-auto whitespace-nowrap py-1">
                  <div className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 mr-2">4</div>
                  <code className="text-sm font-mono text-gray-800">
                    ---
                  </code>
                </div>
              </div>
              <div className="flex items-center pl-2 pr-4 bg-gray-50">
                <div className="flex-1 flex items-center overflow-auto whitespace-nowrap py-1">
                  <div className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 mr-2">5</div>
                  <code className="text-sm font-mono text-gray-800">
                    payload
                  </code>
                </div>
              </div>
            </div>
            
            <div className="h-1/2 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">OUTPUT</h2>
                <div className="text-sm text-gray-600">JSON</div>
              </div>
              
              <div className="flex items-center pl-2 pr-4 bg-gray-50">
                <div className="flex-1 flex items-center overflow-auto whitespace-nowrap py-1">
                  <div className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 mr-2">1</div>
                  <code className="text-sm font-mono text-gray-800">
                    John,Smith,<span className="text-green-600">45</span>
                  </code>
                </div>
              </div>
              <div className="flex items-center pl-2 pr-4">
                <div className="flex-1 flex items-center overflow-auto whitespace-nowrap py-1">
                  <div className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 mr-2">2</div>
                  <code className="text-sm font-mono text-gray-800">
                    Jane,Doe,<span className="text-green-600">34</span>
                  </code>
                </div>
              </div>
              <div className="flex items-center pl-2 pr-4 bg-gray-50">
                <div className="flex-1 flex items-center overflow-auto whitespace-nowrap py-1">
                  <div className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 mr-2">3</div>
                  <code className="text-sm font-mono text-gray-800"></code>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Tutorial;
