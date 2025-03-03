
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Documentation = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gradient-docs">
      <Button 
        variant="outline" 
        className="mb-6 bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-400 text-gray-700 transition-all duration-200 rounded shadow-sm px-4 py-2 h-9 flex items-center justify-center"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Playground
      </Button>
      
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 rounded-lg">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">
            SnapLogic Playground Documentation
          </h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Getting Started
            </h2>
            <p className="text-gray-700 mb-4">
              Welcome to SnapLogic Playground! This interactive environment allows you to experiment with SnapLogic's data transformation capabilities right in your browser.
            </p>
            <p className="text-gray-700 mb-4">
              The playground is split into three main sections:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Inputs</strong> - Where you define your source data</li>
              <li><strong>Script</strong> - Where you write transformation logic</li>
              <li><strong>Output</strong> - Where you see the results of your transformations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Working with Inputs
            </h2>
            <p className="text-gray-700 mb-4">
              Input data can be provided in various formats:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>JSON</li>
              <li>XML</li>
              <li>CSV</li>
              <li>Plain text</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To add a new input, click the "Add" button in the Inputs panel and specify a name and format.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Writing Transformation Scripts
            </h2>
            <p className="text-gray-700 mb-4">
              SnapLogic Playground supports multiple scripting languages:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>JavaScript</strong> - For familiar programming logic</li>
              <li><strong>Expression Language</strong> - SnapLogic's powerful data mapping syntax</li>
              <li><strong>JSONata</strong> - A lightweight query and transformation language</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Switch between formats using the dropdown in the Script panel header.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Exporting and Importing Projects
            </h2>
            <p className="text-gray-700 mb-4">
              You can save your work by exporting the entire project, which includes all inputs, scripts, and expected outputs.
            </p>
            <p className="text-gray-700 mb-4">
              To share your project or continue working later, use the Export and Import buttons in the header.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
