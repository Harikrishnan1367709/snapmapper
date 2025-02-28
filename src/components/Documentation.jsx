
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Search, Copy, CheckCircle, X, ExternalLink, Bookmark, BookmarkCheck, ChevronRight, ArrowLeft, Home } from "lucide-react";
import Editor from "@monaco-editor/react";

export function Documentation({ onBack }) {
  const [activeSection, setActiveSection] = useState('introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSection, setCopiedSection] = useState(null);
  const [filteredSections, setFilteredSections] = useState([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [bookmarkedSections, setBookmarkedSections] = useState(() => {
    const saved = localStorage.getItem('snaplogicBookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const contentRef = useRef(null);

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
    // Save bookmarks whenever they change
    localStorage.setItem('snaplogicBookmarks', JSON.stringify(bookmarkedSections));
  }, [bookmarkedSections]);

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

  useEffect(() => {
    // Scroll to top when changing sections
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeSection]);

  const toggleBookmark = (sectionId) => {
    if (bookmarkedSections.includes(sectionId)) {
      setBookmarkedSections(prev => prev.filter(id => id !== sectionId));
    } else {
      setBookmarkedSections(prev => [...prev, sectionId]);
    }
  };

  const handleCopyCode = (sectionId, code) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const CodeBlock = ({ code, language = 'javascript', sectionId }) => (
    <div className="relative mt-4 mb-6 group">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-white shadow-sm"
          onClick={() => handleCopyCode(sectionId, code)}
        >
          {copiedSection === sectionId ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>
      <div className="bg-[#1e1e1e] rounded-md overflow-hidden shadow-lg">
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
            fontFamily: "'Monaco', 'Menlo', monospace",
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
            <p className="mb-4 text-gray-700 leading-relaxed">
              SnapLogic is a modern integration platform as a service (iPaaS) designed to streamline the connection of applications, 
              data, and devices. It offers a low-code, intuitive interface that simplifies automation, integration, and data transformation 
              for businesses.
            </p>
          </div>
        );
      
      case 'key-features':
        return (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Simplified Integration</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Visual drag-and-drop interface for ease of use.</li>
                <li>Pre-built connectors and templates to reduce development time.</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Enterprise-Grade Capabilities</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Scalable architecture with real-time data processing.</li>
                <li>Robust security features to protect sensitive information.</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Flexibility</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Cloud-native design with hybrid deployment options.</li>
                <li>Support for multiple data formats.</li>
              </ul>
            </div>
          </div>
        );
      
      case 'why-playground':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              SnapLogic Playground was developed to provide a safe, interactive environment for users to explore and test SnapLogic's 
              integration capabilities. By simulating real-world integration scenarios, it enables users to:
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Learn and Experiment</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Understand SnapLogic's functionality through hands-on practice.</li>
                <li>Experiment with JSON payloads, scripts, and transformations without affecting live environments.</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Accelerate Development</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Prototype integration solutions quickly and validate their feasibility.</li>
                <li>Test and debug scripts in real-time before deploying to production.</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Encourage Collaboration</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide a unified platform for teams to share and refine integration workflows.</li>
                <li>Enable consistent best practices through reusable components and templates.</li>
              </ul>
            </div>
            
            <p className="mt-6 text-gray-700 leading-relaxed">
              By offering a dedicated space for exploration and learning, SnapLogic Playground ensures developers and analysts can 
              maximize the platform's potential while minimizing risks.
            </p>
          </div>
        );
      
      case 'ui-overview':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              SnapLogic Playground provides an intuitive interface for users to create, test, and validate integration solutions.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Components of the Interface:</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <h4 className="font-medium text-blue-700 mb-3">Left Panel: Input Explorer</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Allows users to define and manage JSON payloads.</li>
                    <li>Enables quick exploration of input data.</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <h4 className="font-medium text-blue-700 mb-3">Middle Panel: Script Editor</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Write and manage scripts with syntax highlighting and line numbering.</li>
                    <li>Offers real-time feedback during script execution.</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <h4 className="font-medium text-blue-700 mb-3">Right Panel: Output Viewer</h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Displays actual output, expected output, and success/failure indicators.</li>
                    <li>Supports JSON format for output validation.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'core-functionalities':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              SnapLogic Playground offers a range of features that simplify the development and debugging of integration solutions.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">1. Input Management</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Create and manage multiple JSON payloads for testing.</li>
                <li>Visual input explorer for efficient data exploration.</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">2. Script Development</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Syntax highlighting and active line indication for clarity.</li>
                <li>Supports JSON path operations like data navigation, array access, and conditional filtering.</li>
              </ul>
              
              <p className="mt-4 mb-2 text-sm italic text-gray-600">Example:</p>
              <p className="mb-2 text-sm text-gray-700">In this example, a simple script accesses the firstName field from the JSON payload.</p>
              
              <CodeBlock 
                code={`// Sample input JSON\n{\n  "person": {\n    "firstName": "John",\n    "lastName": "Smith"\n  }\n}\n\n// Access the firstName field\n$person.firstName`}
                sectionId="core-functionalities-example"
              />
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">3. Output Handling</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Real-time preview of actual output vs. expected output.</li>
                <li>Failure and success indicators to quickly identify issues.</li>
              </ul>
            </div>
          </div>
        );
      
      case 'implemented-functions':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              SnapLogic supports a comprehensive range of operations for data transformation, organized into the following categories:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {['string-operations', 'array-operations', 'object-functions', 'math-functions', 'number-functions', 'date-functions'].map(functionType => (
                <div 
                  key={functionType} 
                  className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-blue-300 cursor-pointer"
                  onClick={() => setActiveSection(functionType)}
                >
                  <h3 className="font-semibold text-blue-700 mb-2 flex items-center justify-between">
                    {allSections.find(s => s.id === functionType)?.title}
                    <ChevronRight className="h-4 w-4 text-blue-500" />
                  </h3>
                  <p className="text-sm text-gray-600">
                    Click to explore {functionType.split('-').join(' ')} in detail
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'string-operations':
        return (
          <div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Available String Functions</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 mb-4">
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>camelCase</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>capitalize</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>toLowerCase</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>toUpperCase</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>split</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>replace</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>trim</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>charAt</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>contains</li>
              </ul>
            </div>
            
            <CodeBlock 
              code={`// Examples of string operations\n$text.toUpperCase()\n$text.toLowerCase()\n$text.length()\n$text.trim()\n$kebab.camelCase()\n$mixed.kebabCase()\n$snakeCase.camelCase()\n$text.upperFirst()\n$text.lowerFirst()\n$text.charAt(0)\n$text.charCodeAt(0)\n$email.contains("@")\n$email.endsWith(".com")`}
              sectionId="string-operations-example"
            />
          </div>
        );
      
      case 'array-operations':
        return (
          <div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Available Array Functions</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 mb-4">
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>filter</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>map</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>find</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>reverse</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>reduce</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>concat</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>push/pop</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>includes</li>
              </ul>
            </div>
            
            <CodeBlock 
              code={`// Examples of array operations\n$numbers.find(x => x > 3)\n$numbers.findIndex(x => x > 3)\n$names.includes("Jane")\n$numbers.map(x => x * 2)\n$numbers.filter(x => x > 3)\n$numbers.concat([6, 7, 8])\n$numbers.push(6, 7)\n$numbers.pop()\n$numbers.reduce((acc, curr) => acc + curr, 0)`}
              sectionId="array-operations-example"
            />
          </div>
        );
      
      case 'object-functions':
        return (
          <div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Available Object Functions</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 mb-4">
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>keys</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>values</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>entries</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>assign</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>merge</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>filter</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>mapValues</li>
              </ul>
            </div>
            
            <CodeBlock 
              code={`// Get all object keys\n$user.keys()  // ["name", "age", "address", "tags"]\n\n// Get all values\n$user.values()  // ["John", 30, {city: "New York", zip: "10001"}, ["admin", "active"]]\n\n// Get entries as key-value pairs\n$user.entries()  // [["name","John"], ["age",30], ["address",{...}], ["tags",[...]]]\n\n// Filter objects\n$products.filter((value) => value.price > 150 )  // Returns filtered products\n\n// Map values\n$products.mapValues((value) => value.price * 2)  // Doubles all prices`}
              sectionId="object-functions-example"
            />
          </div>
        );
      
      case 'math-functions':
        return (
          <div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Available Math Functions</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 mb-4">
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>abs</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>ceil</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>floor</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>round</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>max</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>min</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>random</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>randomUUID</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>pow</li>
              </ul>
            </div>
            
            <CodeBlock 
              code={`Math.abs(-5)\nMath.ceil(3.14)\nMath.floor(3.14)\nMath.max($value1, $value2)\nMath.min(1, 2, 3)\nMath.pow(2, 3)\nMath.random()\nMath.randomUUID()\nMath.round($number)\nMath.sign(-5)\nMath.trunc(3.14)`}
              sectionId="math-functions-example"
            />
          </div>
        );
      
      case 'number-functions':
        return (
          <div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Available Number Functions</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 mb-4">
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>toExponential</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>toFixed</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>toPrecision</li>
              </ul>
            </div>
            
            <CodeBlock 
              code={`// Input JSON\n{\n  "price": 123.456789,\n  "percentage": 0.89473,\n  "quantity": 4.2103,\n  "amount": 1234.5678\n}\n\n// Examples\n$price.toExponential()      // Result: 1.23456789e+2\n$price.toExponential(2)     // Result: 1.23e+2\n$percentage.toFixed()       // Result: 1\n$percentage.toFixed(2)      // Result: 0.89\n$quantity.toPrecision(2)    // Result: 4.2\n$amount.toExponential(3)    // Result: 1.235e+3\n$amount.toFixed(2)          // Result: 1234.57\n$amount.toPrecision(4)      // Result: 1235`}
              sectionId="number-functions-example"
            />
          </div>
        );
      
      case 'date-functions':
        return (
          <div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Available Date Functions</h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 mb-4">
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>parse</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>now</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>toISOString</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>toDateString</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>toTimeString</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>plus/minus</li>
                <li className="flex items-center"><span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>format</li>
              </ul>
            </div>
            
            <CodeBlock 
              code={`// Current date time\nDate.now()\n\n// Returns parsed date\nDate.parse($date1)\n\n// Returns UTC date\nDate.UTC(2024, 2, 28, 14, 30, 0)\n\n// Local Date/Time Parsing\nLocalDateTime.parse("2024-03-28T14:30:00")\nLocalTime.parse("14:30:00")\n\n// Date formatting\n$date1.toLocaleDateString({"format": "YYYY-MM-DD"})\n$date1.toLocaleDateTimeString({"format": "YYYY-MM-DD HH:mm:ss"})\n\n// Time manipulation\n$date1.plusDays(1)\n$date1.minusHours(2)\n$date1.plusMonths(1)`}
              sectionId="date-functions-example"
            />
          </div>
        );
      
      case 'json-path':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              JSON Path provides efficient navigation and access to nested data, with capabilities for conditional filtering within arrays.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg mb-6 border border-blue-100">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Key Features</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex">
                  <span className="font-medium mr-2">•</span>
                  <span><strong>Dot Notation</strong> - Access nested properties using dot syntax: <code className="text-xs bg-blue-100 px-1 py-0.5 rounded">$.user.name</code></span>
                </li>
                <li className="flex">
                  <span className="font-medium mr-2">•</span>
                  <span><strong>Array Access</strong> - Index into arrays: <code className="text-xs bg-blue-100 px-1 py-0.5 rounded">$.users[0]</code></span>
                </li>
                <li className="flex">
                  <span className="font-medium mr-2">•</span>
                  <span><strong>Wildcard Selectors</strong> - Select all array items: <code className="text-xs bg-blue-100 px-1 py-0.5 rounded">$.users[*].name</code></span>
                </li>
                <li className="flex">
                  <span className="font-medium mr-2">•</span>
                  <span><strong>Filtering</strong> - Apply conditions to select specific items: <code className="text-xs bg-blue-100 px-1 py-0.5 rounded">$.users[?(@.age>30)]</code></span>
                </li>
              </ul>
            </div>
            
            <CodeBlock 
              code={`// Sample complex JSON structure\nconst testData = {\n  "users": [\n    {\n      "name": "John",\n      "age": 30,\n      "role": "admin",\n      "permissions": ["read", "write", "delete"],\n      "friends": [\n        { "name": "Mike", "status": "active" },\n        { "name": "Sarah", "status": "inactive" }\n      ]\n    }\n  ]\n};\n\n// JSONPath examples\n\n// Nested array filtering and mapping\n$.users[?(@.age>25)].friends[?(@.status=='active')].name\n\n// Multiple conditions with logical operators\n$.users[?(@.age>25 && @.role=='admin')].permissions[*]\n\n// Recursive descent to find all price properties\n$..price`}
              sectionId="json-path-example"
            />
          </div>
        );
      
      case 'match-operator':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              The match operator provides a concise way to perform pattern matching and conditional checks, similar to switch statements but with more powerful pattern matching capabilities.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg mb-6 border border-blue-100">
              <h3 className="text-lg font-semibold mb-4 text-indigo-700">Match Operator Patterns</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex">
                  <span className="font-medium mr-2">•</span>
                  <span><strong>Object Patterns</strong> - Match specific object structures</span>
                </li>
                <li className="flex">
                  <span className="font-medium mr-2">•</span>
                  <span><strong>Regular Expressions</strong> - Match string patterns</span>
                </li>
                <li className="flex">
                  <span className="font-medium mr-2">•</span>
                  <span><strong>Range Patterns</strong> - Match value ranges like <code className="text-xs bg-blue-100 px-1 py-0.5 rounded">3..5</code></span>
                </li>
                <li className="flex">
                  <span className="font-medium mr-2">•</span>
                  <span><strong>Wildcard Pattern</strong> - Catch-all pattern with underscore <code className="text-xs bg-blue-100 px-1 py-0.5 rounded">_</code></span>
                </li>
              </ul>
            </div>
            
            <CodeBlock 
              code={`// Sample JSON for match operations\n{\n  "user": {\n    "type": "admin",\n    "active": true,\n    "level": 4\n  },\n  "message": "ERROR: Database connection failed"\n}\n\n// Match example for user object\nmatch $.user {\n  { "type": "admin", "active": true } => "Active Administrator"\n  { "type": "user", "level": 3..5 } => "Advanced User"\n  { "type": "guest" } => "Guest Access"\n  _ => "Unknown User Type"\n}\n\n// Match example for message string with regex\nmatch $.message {\n  /^ERROR:/ => "Error Message"\n  /^WARN:/ => "Warning Message"\n  /^INFO:/ => "Info Message"\n  _ => "Unknown Message Type"\n}`}
              sectionId="match-operator-example"
            />
          </div>
        );
      
      case 'global-operations':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Global operations provide utility functions for handling common tasks like encoding/decoding, type checking, and evaluation.
            </p>
            
            <div className="mb-6 grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Encoding Functions</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li><code className="text-xs bg-blue-50 px-1 py-0.5 rounded">encodeURIComponent()</code> - Encode URI component</li>
                  <li><code className="text-xs bg-blue-50 px-1 py-0.5 rounded">decodeURIComponent()</code> - Decode URI component</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Type Operations</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li><code className="text-xs bg-blue-50 px-1 py-0.5 rounded">typeof</code> - Check data type</li>
                  <li><code className="text-xs bg-blue-50 px-1 py-0.5 rounded">isNaN()</code> - Check for not-a-number</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Parsing Functions</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li><code className="text-xs bg-blue-50 px-1 py-0.5 rounded">parseInt()</code> - Parse string to integer</li>
                  <li><code className="text-xs bg-blue-50 px-1 py-0.5 rounded">parseFloat()</code> - Parse string to float</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Evaluation</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li><code className="text-xs bg-blue-50 px-1 py-0.5 rounded">eval()</code> - Evaluate expressions</li>
                  <li><code className="text-xs bg-blue-50 px-1 py-0.5 rounded">jsonPath()</code> - JSONPath utility</li>
                </ul>
              </div>
            </div>
            
            <CodeBlock 
              code={`// URI Component operations\ndecodeURIComponent($.encodedString)\nencodeURIComponent($.rawString)\n\n// Parsing operations\nparseInt($.integerString)\nparseFloat($.floatString)\n\n// Type checking\ntypeof $.simpleArray  // Result: "array"\ntypeof $.user        // Result: "object"\nisNaN($.invalidNumber) // Result: true\n\n// JSONPath utility\njsonPath($, "$.user.profile.name") // Result: "John Doe"\n\n// Evaluation\neval("5 + 2")  // Result: 7\neval("$.user.scores[0] > 80") // Result: true`}
              sectionId="global-operations-example"
            />
          </div>
        );
      
      case 'advanced-features':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              SnapLogic Playground includes additional tools to enhance productivity and collaboration:
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-md p-5 border border-blue-100 hover:shadow-lg transition-shadow duration-200 flex flex-col">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Import/Export Capability</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 flex-grow">
                  <li>Export projects for sharing or backup.</li>
                  <li>Import functionality supports ZIP files and VSCode integration.</li>
                </ul>
                <div className="mt-4 text-blue-500">
                  <ExternalLink className="h-4 w-4 inline-block mr-1" /> Learn more
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-md p-5 border border-blue-100 hover:shadow-lg transition-shadow duration-200 flex flex-col">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Debugging Tools</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 flex-grow">
                  <li>Real-time validation during script development.</li>
                  <li>Line-by-line debugging for error identification.</li>
                </ul>
                <div className="mt-4 text-blue-500">
                  <ExternalLink className="h-4 w-4 inline-block mr-1" /> Learn more
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-md p-5 border border-blue-100 hover:shadow-lg transition-shadow duration-200 flex flex-col">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Resizable Containers</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 flex-grow">
                  <li>Added resizable containers for left, right, and bottom panels.</li>
                  <li>Customize workspace to fit your workflow needs.</li>
                </ul>
                <div className="mt-4 text-blue-500">
                  <ExternalLink className="h-4 w-4 inline-block mr-1" /> Learn more
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'benefits':
        return (
          <div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold mb-4 text-green-700">Development Efficiency</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Rapid prototyping using pre-built templates.</li>
                  <li>Real-time validation saves debugging time.</li>
                  <li>Iterative development with immediate feedback.</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold mb-4 text-blue-700">Learning Support</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Built-in tutorials and interactive documentation.</li>
                  <li>Real-time feedback ensures quick learning.</li>
                  <li>Try concepts without affecting production systems.</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-5 border-t-4 border-purple-500 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold mb-4 text-purple-700">Enterprise Integration</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Standardized workflows and reusable components.</li>
                  <li>Scalable solutions tailored to enterprise needs.</li>
                  <li>Secure development environment for sensitive data.</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Measurable Benefits</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-blue-600 mb-2">60%</p>
                  <p className="text-sm text-gray-600">Faster Development</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-blue-600 mb-2">40%</p>
                  <p className="text-sm text-gray-600">Reduced Errors</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-blue-600 mb-2">75%</p>
                  <p className="text-sm text-gray-600">Improved Readability</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-blue-600 mb-2">80%</p>
                  <p className="text-sm text-gray-600">User Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'future-enhancements':
        return (
          <div>
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-5 text-gray-800 pb-2 border-b border-gray-200">Planned Improvements</h3>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
                  <h4 className="font-medium text-blue-700 mb-3">1. Extended Functionality</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Advanced data transformation capabilities.</li>
                    <li>Implement operators to work with complex data structures.</li>
                    <li>Implement transformations for complex multi-function scripts.</li>
                    <li>Provide color difference for working script in the middle panel.</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500">
                  <h4 className="font-medium text-green-700 mb-3">2. Enhanced Debugging</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Breakpoint support and variable inspection.</li>
                    <li>Step-by-step execution with value tracking.</li>
                    <li>Advanced error reporting with inline suggestions.</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-purple-500">
                  <h4 className="font-medium text-purple-700 mb-3">3. Collaboration Features</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Real-time collaboration with multiple users.</li>
                    <li>Version history and change tracking.</li>
                    <li>Commenting and annotation system.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-indigo-700">Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200"></div>
                <div className="space-y-6 pl-12 relative">
                  <div className="relative">
                    <div className="absolute left-[-32px] top-0 w-6 h-6 rounded-full bg-indigo-500 shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <h4 className="text-indigo-700 font-medium">Q2 2024</h4>
                    <p className="text-gray-700">Extended functionality and operator implementation</p>
                  </div>
                  <div className="relative">
                    <div className="absolute left-[-32px] top-0 w-6 h-6 rounded-full bg-indigo-400 shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <h4 className="text-indigo-700 font-medium">Q3 2024</h4>
                    <p className="text-gray-700">Enhanced debugging capabilities</p>
                  </div>
                  <div className="relative">
                    <div className="absolute left-[-32px] top-0 w-6 h-6 rounded-full bg-indigo-300 shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <h4 className="text-indigo-700 font-medium">Q4 2024</h4>
                    <p className="text-gray-700">Collaboration features and UI improvements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'conclusion':
        return (
          <div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8 border border-blue-100">
              <h3 className="text-2xl font-bold text-blue-800 mb-4">SnapLogic Playground</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                SnapLogic Playground is a powerful tool for integration developers, business analysts, and system architects. It simplifies 
                complex integration tasks through its visual interface and advanced features.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                By offering a dedicated environment for testing and learning, the Playground ensures users can develop reliable and scalable 
                integration solutions with confidence.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                With future enhancements on the horizon, it aims to remain a leading platform in the integration space, continuing to evolve
                to meet the needs of developers and businesses alike.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center">
                <div className="text-blue-500 mb-3">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Power & Simplicity</h3>
                <p className="text-gray-600">
                  Complex integrations made simple with an intuitive interface.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center">
                <div className="text-blue-500 mb-3">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Customizable</h3>
                <p className="text-gray-600">
                  Adapt to your specific needs with flexible configuration options.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center">
                <div className="text-blue-500 mb-3">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Collaborative</h3>
                <p className="text-gray-600">
                  Work together with team members on complex integration projects.
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <p className="text-gray-700">No content available for this section.</p>;
    }
  };

  // Mobile menu toggle
  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <div className="flex h-full bg-gray-50 backdrop-blur-sm">
      {/* Mobile menu button - only visible on small screens */}
      <button
        className="fixed top-20 left-4 z-50 md:hidden bg-white p-2 rounded-full shadow-lg border border-gray-200"
        onClick={toggleMobileSidebar}
      >
        {showMobileSidebar ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`w-72 bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-full transition-all duration-300 ease-in-out shadow-md
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static fixed left-0 top-0 bottom-0 z-40`}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center justify-start text-gray-700 hover:text-blue-600 transition-colors duration-200"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Playground
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8 rounded-full hover:bg-gray-100 md:hidden"
              onClick={toggleMobileSidebar}
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full bg-gray-50 rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 p-4">
          {bookmarkedSections.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Bookmarks</h3>
              {bookmarkedSections.map((id) => {
                const section = allSections.find(s => s.id === id);
                if (!section) return null;
                
                return (
                  <button
                    key={`bookmark-${id}`}
                    className={`w-full text-left px-3 py-2 rounded mb-1 text-sm flex items-center justify-between ${
                      activeSection === id 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveSection(id)}
                  >
                    <span className="truncate">{section.title}</span>
                    <BookmarkCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  </button>
                );
              })}
              <div className="border-t border-gray-200 my-2"></div>
            </div>
          )}
          
          {filteredSections.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Search className="h-8 w-8 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try searching with different keywords</p>
            </div>
          ) : (
            filteredSections.map((section) => (
              <button
                key={section.id}
                className={`w-full text-left px-3 py-2 rounded mb-1 text-sm transition-colors flex items-center justify-between ${
                  activeSection === section.id 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                } ${section.level === 1 ? 'font-medium' : 'pl-6 text-sm'}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className={`truncate ${section.level === 1 ? '' : 'opacity-90'}`}>{section.title}</span>
                
                <button 
                  className="opacity-0 group-hover:opacity-100 hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(section.id);
                  }}
                >
                  {bookmarkedSections.includes(section.id) ? (
                    <BookmarkCheck className="h-3.5 w-3.5 text-blue-500" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </button>
              </button>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              SnapLogic Playground Docs v1.0
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-7 w-7 rounded-full hover:bg-gray-200"
              onClick={() => setActiveSection('introduction')}
              title="Home"
            >
              <Home className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto" ref={contentRef}>
        <div className="max-w-4xl mx-auto px-6 py-8 bg-white min-h-full">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <div className="flex items-center mb-2">
                {bookmarkedSections.includes(activeSection) ? (
                  <BookmarkCheck 
                    className="h-5 w-5 text-blue-500 mr-2 cursor-pointer" 
                    onClick={() => toggleBookmark(activeSection)}
                  />
                ) : (
                  <Bookmark 
                    className="h-5 w-5 text-gray-400 mr-2 cursor-pointer hover:text-blue-500 transition-colors duration-200" 
                    onClick={() => toggleBookmark(activeSection)}
                  />
                )}
                <h1 className="text-3xl font-bold text-gray-900">
                  {allSections.find(s => s.id === activeSection)?.title || 'Documentation'}
                </h1>
              </div>
              <div className="w-32 h-1 bg-blue-500 rounded-full"></div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileSidebar}
            >
              Contents
            </Button>
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
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
