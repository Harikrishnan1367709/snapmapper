
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Search, Copy, CheckCircle } from "lucide-react";
import Editor from "@monaco-editor/react";

export function Documentation({ onBack }) {
  const [activeSection, setActiveSection] = useState('introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSection, setCopiedSection] = useState(null);
  const [filteredSections, setFilteredSections] = useState([]);

  const allSections = [
    { id: 'introduction', title: 'Introduction to SnapLogic', level: 1 },
    { id: 'key-features', title: 'Key Features', level: 2 },
    { id: 'why-playground', title: 'Why Create SnapLogic Playground?', level: 2 },
    { id: 'ui-overview', title: 'User Interface Overview', level: 1 },
    { id: 'core-functionalities', title: 'Core Functionalities', level: 1 },
    { id: 'implemented-functions', title: 'Implemented Functions', level: 1 },
    { id: 'string-operations', title: 'String Operations', level: 2 },
    { id: 'array-operations', title: 'Array Operations', level: 2 },
    { id: 'object-functions', title: 'Object Functions', level: 2 },
    { id: 'math-functions', title: 'Math Functions', level: 2 },
    { id: 'number-functions', title: 'Number Functions', level: 2 },
    { id: 'date-functions', title: 'Date Functions', level: 2 },
    { id: 'json-path', title: 'JSON Path Operations', level: 2 },
    { id: 'match-operator', title: 'Match Operator', level: 2 },
    { id: 'global-operations', title: 'Global Operations', level: 2 },
    { id: 'advanced-features', title: 'Advanced Features', level: 1 },
    { id: 'benefits', title: 'Benefits for Users', level: 1 },
    { id: 'future-enhancements', title: 'Future Enhancements', level: 1 },
    { id: 'conclusion', title: 'Conclusion', level: 1 },
  ];

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSections(allSections);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSections(
        allSections.filter(section => 
          section.title.toLowerCase().includes(query) || 
          getContentForSection(section.id).toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery]);

  const handleCopyCode = (sectionId, code) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const CodeBlock = ({ code, language = 'javascript', sectionId }) => (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10">
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-white"
          onClick={() => handleCopyCode(sectionId, code)}
        >
          {copiedSection === sectionId ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>
      <div className="bg-gray-800 rounded-md overflow-hidden">
        <Editor
          height="150px"
          language={language}
          theme="vs-dark"
          value={code}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: "'Monaco', monospace",
            padding: { top: 12, bottom: 12 },
            lineNumbers: 'on',
            scrollbar: {
              vertical: 'visible',
              horizontalScrollbarSize: 8,
              verticalScrollbarSize: 8
            }
          }}
        />
      </div>
    </div>
  );

  const getContentForSection = (sectionId) => {
    switch(sectionId) {
      case 'introduction':
        return (
          <div>
            <p className="mb-4">
              SnapLogic is a modern integration platform as a service (iPaaS) designed to streamline the connection of applications, 
              data, and devices. It offers a low-code, intuitive interface that simplifies automation, integration, and data transformation 
              for businesses.
            </p>
          </div>
        );
      
      case 'key-features':
        return (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Simplified Integration</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Visual drag-and-drop interface for ease of use.</li>
                <li>Pre-built connectors and templates to reduce development time.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Enterprise-Grade Capabilities</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Scalable architecture with real-time data processing.</li>
                <li>Robust security features to protect sensitive information.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Flexibility</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Cloud-native design with hybrid deployment options.</li>
                <li>Support for multiple data formats.</li>
              </ul>
            </div>
          </div>
        );
      
      case 'why-playground':
        return (
          <div>
            <p className="mb-4">
              SnapLogic Playground was developed to provide a safe, interactive environment for users to explore and test SnapLogic's 
              integration capabilities. By simulating real-world integration scenarios, it enables users to:
            </p>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Learn and Experiment</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Understand SnapLogic's functionality through hands-on practice.</li>
                <li>Experiment with JSON payloads, scripts, and transformations without affecting live environments.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Accelerate Development</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Prototype integration solutions quickly and validate their feasibility.</li>
                <li>Test and debug scripts in real-time before deploying to production.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Encourage Collaboration</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide a unified platform for teams to share and refine integration workflows.</li>
                <li>Enable consistent best practices through reusable components and templates.</li>
              </ul>
            </div>
            
            <p className="mt-4">
              By offering a dedicated space for exploration and learning, SnapLogic Playground ensures developers and analysts can 
              maximize the platform's potential while minimizing risks.
            </p>
          </div>
        );
      
      case 'ui-overview':
        return (
          <div>
            <p className="mb-4">
              SnapLogic Playground provides an intuitive interface for users to create, test, and validate integration solutions.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Components of the Interface:</h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-blue-700">Left Panel: Input Explorer</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Allows users to define and manage JSON payloads.</li>
                  <li>Enables quick exploration of input data.</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-blue-700">Middle Panel: Script Editor</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Write and manage scripts with syntax highlighting and line numbering.</li>
                  <li>Offers real-time feedback during script execution.</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-blue-700">Right Panel: Output Viewer</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Displays actual output, expected output, and success/failure indicators.</li>
                  <li>Supports JSON format for output validation.</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 'core-functionalities':
        return (
          <div>
            <p className="mb-4">
              SnapLogic Playground offers a range of features that simplify the development and debugging of integration solutions.
            </p>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">1. Input Management</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Create and manage multiple JSON payloads for testing.</li>
                <li>Visual input explorer for efficient data exploration.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">2. Script Development</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Syntax highlighting and active line indication for clarity.</li>
                <li>Supports JSON path operations like data navigation, array access, and conditional filtering.</li>
              </ul>
              
              <p className="mt-2 mb-2 text-sm italic">Example:</p>
              <p className="mb-2 text-sm">In this example, a simple script accesses the firstName field from the JSON payload.</p>
              
              <CodeBlock 
                code={`// Sample input JSON\n{\n  "person": {\n    "firstName": "John",\n    "lastName": "Smith"\n  }\n}\n\n// Access the firstName field\n$person.firstName`}
                sectionId="core-functionalities-example"
              />
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">3. Output Handling</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Real-time preview of actual output vs. expected output.</li>
                <li>Failure and success indicators to quickly identify issues.</li>
              </ul>
            </div>
          </div>
        );
      
      case 'implemented-functions':
        return (
          <div>
            <p className="mb-4">
              SnapLogic supports a range of operations for data transformation:
            </p>
          </div>
        );
      
      case 'string-operations':
        return (
          <div>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>camelCase</li>
              <li>capitalize</li>
              <li>toLowerCase / toUpperCase</li>
              <li>split</li>
              <li>replace</li>
            </ul>
            
            <CodeBlock 
              code={`// Examples of string operations\n$text.toUpperCase()\n$text.toLowerCase()\n$text.length()\n$text.trim()\n$kebab.camelCase()\n$mixed.kebabCase()\n$snakeCase.camelCase()\n$text.upperFirst()\n$text.lowerFirst()\n$text.charAt(0)\n$text.charCodeAt(0)\n$email.contains("@")\n$email.endsWith(".com")`}
              sectionId="string-operations-example"
            />
          </div>
        );
      
      case 'array-operations':
        return (
          <div>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>filter</li>
              <li>map</li>
              <li>find</li>
              <li>reverse</li>
              <li>reduce</li>
            </ul>
            
            <CodeBlock 
              code={`// Examples of array operations\n$numbers.find(x => x > 3)\n$numbers.findIndex(x => x > 3)\n$names.includes("Jane")\n$numbers.map(x => x * 2)\n$numbers.filter(x => x > 3)\n$numbers.concat([6, 7, 8])\n$numbers.push(6, 7)\n$numbers.pop()\n$numbers.reduce((acc, curr) => acc + curr, 0)`}
              sectionId="array-operations-example"
            />
          </div>
        );
      
      case 'object-functions':
        return (
          <div>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>keys</li>
              <li>values</li>
              <li>entries</li>
              <li>assign</li>
              <li>merge</li>
            </ul>
            
            <CodeBlock 
              code={`// Get all object keys\n$user.keys()  // ["name", "age", "address", "tags"]\n\n// Get all values\n$user.values()  // ["John", 30, {city: "New York", zip: "10001"}, ["admin", "active"]]\n\n// Get entries as key-value pairs\n$user.entries()  // [["name","John"], ["age",30], ["address",{...}], ["tags",[...]]]\n\n// Filter objects\n$products.filter((value) => value.price > 150 )  // Returns filtered products\n\n// Map values\n$products.mapValues((value) => value.price * 2)  // Doubles all prices`}
              sectionId="object-functions-example"
            />
          </div>
        );
      
      case 'math-functions':
        return (
          <div>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>abs</li>
              <li>ceil</li>
              <li>floor</li>
              <li>round</li>
              <li>max</li>
              <li>min</li>
              <li>random</li>
              <li>randomUUID</li>
            </ul>
            
            <CodeBlock 
              code={`Math.abs(-5)\nMath.ceil(3.14)\nMath.floor(3.14)\nMath.max($value1, $value2)\nMath.min(1, 2, 3)\nMath.pow(2, 3)\nMath.random()\nMath.randomUUID()\nMath.round($number)\nMath.sign(-5)\nMath.trunc(3.14)`}
              sectionId="math-functions-example"
            />
          </div>
        );
      
      case 'number-functions':
        return (
          <div>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>toExponential</li>
              <li>toFixed</li>
              <li>toPrecision</li>
            </ul>
            
            <CodeBlock 
              code={`// Input JSON\n{\n  "price": 123.456789,\n  "percentage": 0.89473,\n  "quantity": 4.2103,\n  "amount": 1234.5678\n}\n\n// Examples\n$price.toExponential()      // Result: 1.23456789e+2\n$price.toExponential(2)     // Result: 1.23e+2\n$percentage.toFixed()       // Result: 1\n$percentage.toFixed(2)      // Result: 0.89\n$quantity.toPrecision(2)    // Result: 4.2\n$amount.toExponential(3)    // Result: 1.235e+3\n$amount.toFixed(2)          // Result: 1234.57\n$amount.toPrecision(4)      // Result: 1235`}
              sectionId="number-functions-example"
            />
          </div>
        );
      
      case 'date-functions':
        return (
          <div>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>parse</li>
              <li>now</li>
              <li>toISOString</li>
              <li>toDateString</li>
              <li>toTimeString</li>
              <li>plus/minus methods for time manipulation</li>
            </ul>
            
            <CodeBlock 
              code={`// Current date time\nDate.now()\n\n// Returns parsed date\nDate.parse($date1)\n\n// Returns UTC date\nDate.UTC(2024, 2, 28, 14, 30, 0)\n\n// Local Date/Time Parsing\nLocalDateTime.parse("2024-03-28T14:30:00")\nLocalTime.parse("14:30:00")\n\n// Date formatting\n$date1.toLocaleDateString({"format": "YYYY-MM-DD"})\n$date1.toLocaleDateTimeString({"format": "YYYY-MM-DD HH:mm:ss"})\n\n// Time manipulation\n$date1.plusDays(1)\n$date1.minusHours(2)\n$date1.plusMonths(1)`}
              sectionId="date-functions-example"
            />
          </div>
        );
      
      case 'json-path':
        return (
          <div>
            <p className="mb-4">
              JSON Path provides efficient navigation and access to nested data, with capabilities for conditional filtering within arrays.
            </p>
            
            <CodeBlock 
              code={`// Sample complex JSON structure\nconst testData = {\n  "users": [\n    {\n      "name": "John",\n      "age": 30,\n      "role": "admin",\n      "permissions": ["read", "write", "delete"],\n      "friends": [\n        { "name": "Mike", "status": "active" },\n        { "name": "Sarah", "status": "inactive" }\n      ]\n    }\n  ]\n};\n\n// JSONPath examples\n\n// Nested array filtering and mapping\n$.users[?(@.age>25)].friends[?(@.status=='active')].name\n\n// Multiple conditions with logical operators\n$.users[?(@.age>25 && @.role=='admin')].permissions[*]\n\n// Recursive descent to find all price properties\n$..price`}
              sectionId="json-path-example"
            />
          </div>
        );
      
      case 'match-operator':
        return (
          <div>
            <p className="mb-4">
              The match operator provides a concise way to perform pattern matching and conditional checks.
            </p>
            
            <CodeBlock 
              code={`// Sample JSON for match operations\n{\n  "user": {\n    "type": "admin",\n    "active": true,\n    "level": 4\n  },\n  "message": "ERROR: Database connection failed"\n}\n\n// Match example for user object\nmatch $.user {\n  { "type": "admin", "active": true } => "Active Administrator"\n  { "type": "user", "level": 3..5 } => "Advanced User"\n  { "type": "guest" } => "Guest Access"\n  _ => "Unknown User Type"\n}\n\n// Match example for message string with regex\nmatch $.message {\n  /^ERROR:/ => "Error Message"\n  /^WARN:/ => "Warning Message"\n  /^INFO:/ => "Info Message"\n  _ => "Unknown Message Type"\n}`}
              sectionId="match-operator-example"
            />
          </div>
        );
      
      case 'global-operations':
        return (
          <div>
            <p className="mb-4">
              Global operations provide utility functions for handling common tasks like encoding/decoding, type checking, and evaluation.
            </p>
            
            <CodeBlock 
              code={`// URI Component operations\ndecodeURIComponent($.encodedString)\nencodeURIComponent($.rawString)\n\n// Parsing operations\nparseInt($.integerString)\nparseFloat($.floatString)\n\n// Type checking\ntypeof $.simpleArray  // Result: "array"\ntypeof $.user        // Result: "object"\nisNaN($.invalidNumber) // Result: true\n\n// JSONPath utility\njsonPath($, "$.user.profile.name") // Result: "John Doe"\n\n// Evaluation\neval("5 + 2")  // Result: 7\neval("$.user.scores[0] > 80") // Result: true`}
              sectionId="global-operations-example"
            />
          </div>
        );
      
      case 'advanced-features':
        return (
          <div>
            <p className="mb-4">
              SnapLogic Playground includes additional tools to enhance productivity and collaboration:
            </p>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">1. Import/Export Capability</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Export projects for sharing or backup.</li>
                <li>Import functionality supports ZIP files and VSCode integration.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">2. Debugging Tools</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Real-time validation during script development.</li>
                <li>Line-by-line debugging for error identification.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">3. Resizable Containers</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Added resizable containers for left, right, and bottom panels.</li>
              </ul>
            </div>
          </div>
        );
      
      case 'benefits':
        return (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">1. Development Efficiency</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Rapid prototyping using pre-built templates.</li>
                <li>Real-time validation saves debugging time.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">2. Learning Support</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Built-in tutorials and interactive documentation.</li>
                <li>Real-time feedback ensures quick learning.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">3. Enterprise Integration</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Standardized workflows and reusable components.</li>
                <li>Scalable solutions tailored to enterprise needs.</li>
              </ul>
            </div>
          </div>
        );
      
      case 'future-enhancements':
        return (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">1. Extended Functionality</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Advanced data transformation capabilities.</li>
                <li>Implement operators to work.</li>
                <li>Implement transformations for complex multi-function scripts.</li>
                <li>Need to provide color difference for working script in the middle panel.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">2. Enhanced Debugging</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Breakpoint support and variable inspection.</li>
              </ul>
            </div>
          </div>
        );
      
      case 'conclusion':
        return (
          <div>
            <p className="mb-4">
              SnapLogic Playground is a powerful tool for integration developers, business analysts, and system architects. It simplifies 
              complex integration tasks through its visual interface and advanced features. By offering a dedicated environment for 
              testing and learning, the Playground ensures users can develop reliable and scalable integration solutions. With future 
              enhancements on the horizon, it aims to remain a leading platform in the integration space.
            </p>
          </div>
        );
      
      default:
        return <p>No content available for this section.</p>;
    }
  };

  return (
    <div className="flex h-full bg-white/95 backdrop-blur-sm">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-start text-gray-700 mb-4"
            onClick={onBack}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Playground
          </Button>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full bg-white rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 p-3">
          {filteredSections.map((section) => (
            <button
              key={section.id}
              className={`w-full text-left px-2 py-1.5 rounded mb-1 text-sm transition-colors ${
                activeSection === section.id 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              } ${section.level === 1 ? 'font-medium' : 'pl-4 text-xs'}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.title}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-500">
            SnapLogic Playground Documentation v1.0
          </p>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try searching with different keywords</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {allSections.find(s => s.id === activeSection)?.title || 'Documentation'}
                </h1>
                <div className="w-16 h-1 bg-blue-500 rounded"></div>
              </div>
              
              <div className="prose prose-blue max-w-none">
                {getContentForSection(activeSection)}
              </div>
              
              <div className="mt-12 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button 
                    className={`text-sm flex items-center text-blue-600 hover:text-blue-800 transition-colors ${
                      allSections.findIndex(s => s.id === activeSection) === 0 ? 'invisible' : ''
                    }`}
                    onClick={() => {
                      const currentIndex = allSections.findIndex(s => s.id === activeSection);
                      if (currentIndex > 0) {
                        setActiveSection(allSections[currentIndex - 1].id);
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  
                  <button 
                    className={`text-sm flex items-center text-blue-600 hover:text-blue-800 transition-colors ${
                      allSections.findIndex(s => s.id === activeSection) === allSections.length - 1 ? 'invisible' : ''
                    }`}
                    onClick={() => {
                      const currentIndex = allSections.findIndex(s => s.id === activeSection);
                      if (currentIndex < allSections.length - 1) {
                        setActiveSection(allSections[currentIndex + 1].id);
                      }
                    }}
                  >
                    Next
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
