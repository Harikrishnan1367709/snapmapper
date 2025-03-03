
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Documentation({ onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white/95 backdrop-blur-sm">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Playground
        </Button>
      </div>

      <div className="prose max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">SnapLogic Playground Documentation</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Getting Started</h2>
          <p className="mb-4">
            Welcome to SnapLogic Playground, a powerful tool for testing and debugging SnapLogic expressions
            and transformations without having to deploy them to your SnapLogic instance.
          </p>
          <p className="mb-4">
            This playground allows you to write and test custom scripts against sample data to ensure
            your logic is correct before implementing it in your production pipelines.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Working with Inputs</h2>
          <p className="mb-4">
            The left panel allows you to define input data that your scripts will process.
            Click the "Add" button to create a new input file. You can add multiple input files
            to test different scenarios.
          </p>
          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700">Supported Input Formats</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>JSON</li>
            <li>XML</li>
            <li>CSV</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Writing Scripts</h2>
          <p className="mb-4">
            The middle panel is where you write your transformation scripts. Select your preferred
            script format from the dropdown menu (JavaScript, Python, or SnapLogic Expression Language).
          </p>
          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700">Script Examples</h3>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <h4 className="font-semibold mb-2">JavaScript Example:</h4>
            <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
              {`// Example JavaScript transformation
function transform(input) {
  return input.map(item => {
    return {
      id: item.id,
      fullName: item.firstName + ' ' + item.lastName,
      isActive: item.status === 'active'
    };
  });
}`}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Viewing Output</h2>
          <p className="mb-4">
            The right panel displays the result of your transformation. The "Actual Output" section
            shows the actual result of running your script against the input data, while the "Expected
            Output" section allows you to define the expected result for validation purposes.
          </p>
          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700">Comparing Results</h3>
          <p className="mb-4">
            The playground automatically compares the actual and expected outputs, helping you
            identify any discrepancies in your transformation logic.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Importing and Exporting</h2>
          <p className="mb-4">
            You can export your project (including inputs, scripts, and expected outputs) for sharing
            or saving. Similarly, you can import previously exported projects to continue your work.
          </p>
          <p className="mb-4">
            Use the Import and Export buttons in the top navigation bar to access these features.
          </p>
        </div>
      </div>
    </div>
  );
}
