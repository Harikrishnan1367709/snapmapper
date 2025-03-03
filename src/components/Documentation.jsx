
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Documentation = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with back button */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-700 hover:text-blue-600 mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Playground
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Documentation</h1>
      </div>
      
      {/* Documentation content */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="prose prose-blue max-w-none">
          <h2>SnapLogic Function Documentation</h2>
          
          <div className="mt-6">
            <h3>Introduction</h3>
            <p>
              SnapLogic is a powerful integration platform that allows you to connect various systems, applications, 
              and data sources. The SnapLogic Function feature enables you to write custom scripts to transform and 
              manipulate data as it flows through your pipeline.
            </p>
          </div>
          
          <div className="mt-6">
            <h3>Function Syntax</h3>
            <p>
              SnapLogic Functions use JavaScript as their scripting language. You can use standard JavaScript 
              syntax, methods, and libraries to manipulate your data.
            </p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              <code>{`// Example function
function transform(input) {
  // Your transformation logic
  return transformedOutput;
}`}</code>
            </pre>
          </div>
          
          <div className="mt-6">
            <h3>Common Functions</h3>
            <ul className="list-disc pl-6">
              <li className="mb-2">
                <strong>evaluateOperatorExpression</strong> - Evaluates logical expressions using SnapLogic's expression syntax
              </li>
              <li className="mb-2">
                <strong>formatDate</strong> - Formats date strings according to specified patterns
              </li>
              <li className="mb-2">
                <strong>validateJson</strong> - Validates JSON structures against schemas
              </li>
              <li className="mb-2">
                <strong>transformJson</strong> - Transforms JSON data from one structure to another
              </li>
            </ul>
          </div>
          
          <div className="mt-6">
            <h3>Working with Expressions</h3>
            <p>
              SnapLogic's expression language allows you to create complex logical expressions that can be evaluated 
              at runtime. Expressions can reference variables, properties, and use various operators.
            </p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              <code>{`// Example of evaluateOperatorExpression
const result = evaluateOperatorExpression(
  "$Status == 'ACTIVE' && $CreatedDate > '2023-01-01'", 
  documentContext
);`}</code>
            </pre>
          </div>
          
          <div className="mt-6">
            <h3>Date Handling</h3>
            <p>
              Working with dates is a common requirement. SnapLogic provides several utilities for parsing, 
              formatting, and manipulating dates.
            </p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              <code>{`// Parse a date string
const date = Date.parse("2023-05-15T14:30:00Z");

// Format a date
const formattedDate = formatDate(date, "yyyy-MM-dd");`}</code>
            </pre>
          </div>
          
          <div className="mt-6">
            <h3>Best Practices</h3>
            <ul className="list-disc pl-6">
              <li className="mb-2">Always validate input data before processing</li>
              <li className="mb-2">Use error handling with try/catch blocks for robust scripts</li>
              <li className="mb-2">Comment your code for better maintainability</li>
              <li className="mb-2">Break complex operations into smaller, reusable functions</li>
              <li className="mb-2">Test your functions with various input data samples</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Footer */}
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
            {/* Tea Icon */}
            <div className="relative w-[18px] h-[18px] animate-pulse transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 19h18v2H2v-2zm2-8v5c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2zm15 0v5H5v-5h14zm-6.75-7L15 8H9l2.75-4z" fill="#374151"/>
                <path d="M19 10h2c0-2.21-1.79-4-4-4h-2l2 4z" fill="#374151"/>
              </svg>
            </div>
            <span className="text-gray-500 font-semibold">&</span>
            {/* Beer Icon */}
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
};
