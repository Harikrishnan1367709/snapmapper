import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export const Documentation = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-screen bg-white p-6 overflow-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={20} />
          <span className="ml-2">Back to Playground</span>
        </button>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">SnapLogic Documentation</h1>
        
        <div className="prose prose-blue max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="mb-4">
            Welcome to the SnapLogic Playground documentation. This interactive environment 
            allows you to experiment with SnapLogic's powerful integration capabilities.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Key Features</h2>
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Script Playground: Write and test transformation scripts</li>
            <li className="mb-2">Multiple Input Support: Test with various data sources</li>
            <li className="mb-2">Import/Export: Save and share your work</li>
            <li className="mb-2">Real-time Validation: See results immediately</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">How to Use</h2>
          <p className="mb-4">
            The playground is divided into three main sections:
          </p>
          <ol className="list-decimal pl-6 mb-6">
            <li className="mb-2">
              <strong>Input Panel:</strong> Define your input data in JSON format
            </li>
            <li className="mb-2">
              <strong>Script Panel:</strong> Write your transformation script
            </li>
            <li className="mb-2">
              <strong>Output Panel:</strong> View the results of your script
            </li>
          </ol>
          
          <h2 className="text-2xl font-semibold mb-4 mt-8">Script Examples</h2>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="font-mono text-sm">$.myarray</p>
            <p className="text-gray-600 mt-2">Returns the entire array</p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="font-mono text-sm">$.myarray[0]</p>
            <p className="text-gray-600 mt-2">Returns the first element of the array</p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="font-mono text-sm">$.names[?(@ == 'Fred')]</p>
            <p className="text-gray-600 mt-2">Returns all elements with value 'Fred'</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
