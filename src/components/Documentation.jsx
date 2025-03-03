
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
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bookmarkedSections, setBookmarkedSections] = useState(() => {
    const saved = localStorage.getItem('snaplogicBookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const contentRef = useRef(null);
  const searchInputRef = useRef(null);

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
    // Initialize filteredSections with all sections
    setFilteredSections(allSections);
  }, []);

  useEffect(() => {
    // Save bookmarks whenever they change
    localStorage.setItem('snaplogicBookmarks', JSON.stringify(bookmarkedSections));
  }, [bookmarkedSections]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSections(allSections);
      setIsSearching(false);
      setSearchResults([]);
    } else {
      const query = searchQuery.toLowerCase();
      
      // First filter the sections based on title
      const titleMatches = allSections.filter(section => 
        section.title.toLowerCase().includes(query)
      );
      
      // For content matches, instead of using getContentForSection directly
      // Which could trigger rendering issues, use a safer approach
      const contentMatches = [];
      allSections.forEach(section => {
        if (!titleMatches.includes(section)) {
          try {
            const sectionId = section.id;
            // Simple check for keywords in section content without rendering
            // This is a simplified version - actual search is done in searchResults
            if (sectionId.includes(query)) {
              contentMatches.push(section);
            }
          } catch (error) {
            console.error("Error searching in section:", section.id, error);
          }
        }
      });
      
      setFilteredSections([...titleMatches, ...contentMatches]);
      setIsSearching(true);
      
      // Create search results with context - only for title matches for now
      // To prevent issues with content rendering
      const results = [];
      titleMatches.forEach(section => {
        results.push({
          section,
          snippet: `<span>Found in title: <mark class="bg-yellow-200 px-0.5 rounded">${section.title}</mark></span>`
        });
      });
      
      setSearchResults(results);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Scroll to top when changing sections
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeSection]);

  // Add custom scrollbar styles
  useEffect(() => {
    // Add scrollbar styles to head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Custom scrollbar for documentation */
      .doc-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .doc-scrollbar::-webkit-scrollbar-track {
        background: #222;
        border-radius: 4px;
      }
      
      .doc-scrollbar::-webkit-scrollbar-thumb {
        background: #3b82f6; /* Blue scrollbar thumb */
        border-radius: 4px;
        border: 2px solid #222;
      }
      
      .doc-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #2563eb;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      // Clean up on unmount
      document.head.removeChild(styleElement);
    };
  }, []);

  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

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
              code={`// Sample complex JSON structure
const testData = {
  "users": [
    {
      "name": "John",
      "age": 30,
      "role": "admin",
      "permissions": ["read", "write", "delete"],
      "friends": [
        {"name": "Sarah", "age": 28},
        {"name": "Mike", "age": 32}
      ]
    },
    {
      "name": "Lisa",
      "age": 25,
      "role": "user",
      "permissions": ["read"],
      "friends": [
        {"name": "John", "age": 30},
        {"name": "David", "age": 27}
      ]
    }
  ]
}

// Different JSONPath expressions to access data
$.users[0].name                   // Result: "John"
$.users[*].name                   // Result: ["John", "Lisa"]
$.users[?(@.age > 25)].name       // Result: ["John"]
$.users[0].friends[*].name        // Result: ["Sarah", "Mike"]
$..name                           // Result: ["John", "Sarah", "Mike", "Lisa", "John", "David"]`}
              sectionId="json-path-example"
            />
          </div>
        );
      
      case 'match-operator':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              The match operator provides powerful pattern matching capabilities for string data, allowing for flexible text filtering and extraction.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Key Match Operator Features</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Support for basic string equality checks</li>
                <li>Regular expression pattern matching</li>
                <li>Case-insensitive matching options</li>
                <li>Extraction of matched groups</li>
              </ul>
            </div>
            
            <CodeBlock 
              code={`// Sample input
const text = "Hello World 123";
const emails = ["user@example.com", "admin@company.org", "test123@test.co.uk"];

// Basic string matching
$text == "Hello World 123"           // true
$text.match("World")                 // ["World"]
$text.match(/\\d+/)                   // ["123"]

// Case insensitive matching
$text.match(/hello/i)                // ["Hello"]

// Extract all email domains
emails.map(email => {
  const matches = email.match(/@([\\w.-]+)/);
  return matches ? matches[1] : null;
})                                   // ["example.com", "company.org", "test.co.uk"]

// Replace patterns
$text.replace(/\\d+/, "456")          // "Hello World 456"
$text.replace(/world/i, "Universe")  // "Hello Universe 123"`}
              sectionId="match-operator-example"
            />
          </div>
        );
      
      case 'global-operations':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              Global operations provide system-wide functions that can be used across different contexts within SnapLogic scripts.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Available Global Functions</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>UUID generation for creating unique identifiers</li>
                <li>Environment variable access for configuration</li>
                <li>Logging functions for debugging and monitoring</li>
                <li>Type conversion utilities for data transformation</li>
              </ul>
            </div>
            
            <CodeBlock 
              code={`// Generate a UUID
const newId = generateUUID();  // e.g. "550e8400-e29b-41d4-a716-446655440000"

// Access environment variables
const apiKey = env.get("API_KEY");
const debugMode = env.get("DEBUG_MODE", "false") === "true";

// Logging at different levels
log.debug("Debug information");
log.info("Process started");
log.warn("Warning: resource usage high");
log.error("Failed to connect to external API");

// Type conversions
const stringValue = toString(42);                 // "42"
const numberValue = toNumber("42.5");             // 42.5
const booleanValue = toBoolean("true");           // true
const dateValue = toDate("2024-03-28");           // Date object
const jsonValue = parseJson('{"name":"John"}');   // {name: "John"}`}
              sectionId="global-operations-example"
            />
          </div>
        );
      
      case 'advanced-features':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              SnapLogic Playground includes several advanced features that cater to complex integration scenarios and specialized requirements.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Error Handling</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Try-catch mechanisms for graceful error recovery</li>
                  <li>Detailed error reporting with context information</li>
                  <li>Custom error types for specific scenarios</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Performance Optimization</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Lazy evaluation for improved processing efficiency</li>
                  <li>Parallel processing for high-volume data operations</li>
                  <li>Memory usage optimization techniques</li>
                </ul>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Custom Functions</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Define reusable functions for common operations</li>
                  <li>Import external libraries and modules</li>
                  <li>Create domain-specific function collections</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Advanced Data Mapping</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Complex data structure transformation utilities</li>
                  <li>Advanced pattern matching and validation</li>
                  <li>Schema-based data mapping and validation</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 'benefits':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              SnapLogic Playground offers significant advantages for different types of users involved in integration projects.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">For Developers</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Rapid prototyping without deployment overhead</li>
                  <li>Real-time feedback during script development</li>
                  <li>No risk of affecting production environments</li>
                  <li>Learning platform for SnapLogic capabilities</li>
                  <li>Simplified debugging and troubleshooting</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">For Business Analysts</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Low barrier to entry for non-technical users</li>
                  <li>Visualization of data transformations</li>
                  <li>Ability to validate business rules without IT</li>
                  <li>Data exploration without coding complexity</li>
                  <li>Greater independence in integration projects</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">For Organizations</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Accelerated integration development cycles</li>
                  <li>Reduced training costs for new team members</li>
                  <li>Standardized approaches to common challenges</li>
                  <li>Knowledge sharing across different projects</li>
                  <li>Improved collaboration between IT and business</li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 'future-enhancements':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              The SnapLogic Playground roadmap includes several planned improvements to enhance user experience and expand functionality.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-5 mb-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Upcoming Features</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Enhanced User Interface</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Dark mode and customizable themes</li>
                    <li>Split-pane view for input and output comparison</li>
                    <li>Expandable panels for larger screens</li>
                    <li>Improved keyboard shortcuts</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Collaborative Features</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Shared workspaces for team collaboration</li>
                    <li>Real-time co-editing capabilities</li>
                    <li>Version control integration</li>
                    <li>Comments and annotations</li>
                  </ul>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Advanced Integration</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Sample API connectors library</li>
                    <li>Expanded transformation templates</li>
                    <li>Direct deployment to SnapLogic platform</li>
                    <li>Integration with other development tools</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Developer Experience</h4>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Advanced code completion suggestions</li>
                    <li>Integrated debugging tools</li>
                    <li>Performance profiling capabilities</li>
                    <li>Custom function libraries and sharing</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              These enhancements will continue to make SnapLogic Playground an even more powerful tool for integration development, 
              learning, and collaboration across organizations.
            </p>
          </div>
        );
      
      case 'conclusion':
        return (
          <div>
            <p className="mb-6 text-gray-700 leading-relaxed">
              SnapLogic Playground represents a significant advancement in making integration development more accessible, efficient, and 
              collaborative for organizations of all sizes.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Key Takeaways</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provides a safe, dedicated environment for learning and experimentation</li>
                <li>Supports a comprehensive range of data transformation and integration operations</li>
                <li>Offers benefits for developers, business analysts, and organizations as a whole</li>
                <li>Continues to evolve with new features and capabilities</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Getting Started</h3>
              <p className="mb-4 text-gray-700 leading-relaxed">
                Experience SnapLogic Playground today by:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Exploring the documentation and tutorials</li>
                <li>Trying the provided examples and sample transformations</li>
                <li>Creating your own integration scenarios</li>
                <li>Sharing feedback and suggestions for future improvements</li>
              </ul>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
                  onClick={() => setActiveSection('introduction')}
                >
                  <Home className="h-4 w-4" />
                  <span>Start Exploring</span>
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 border rounded-md bg-blue-50">
            <p className="text-gray-700">Select a section from the navigation menu to view its content.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Mobile sidebar toggle for smaller screens */}
      <div className="md:hidden fixed top-16 left-4 z-50">
        <Button 
          variant="outline" 
          className="bg-white shadow-md"
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        >
          {showMobileSidebar ? <X className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Documentation sidebar - with mobile responsive behavior */}
      <div 
        className={`fixed md:relative md:block bg-white shadow-lg md:shadow-none h-full overflow-y-auto doc-scrollbar transition-all duration-300 z-40 w-72 
                   ${showMobileSidebar ? 'left-0' : '-left-72'} md:left-0 md:w-72`}
      >
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 z-10">
          <Button
            variant="outline"
            className="mb-4 w-full justify-start text-gray-600 hover:text-blue-600"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to Playground</span>
          </Button>
          
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search documentation..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchQuery && (
              <Button
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {isSearching && (
            <div className="mt-2 text-xs text-gray-500">
              {filteredSections.length === 0 ? 
                "No results found" : 
                `Found ${filteredSections.length} results`
              }
            </div>
          )}
        </div>
        
        <div className="p-4">
          {isSearching && searchResults.length > 0 ? (
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Search Results</h3>
              <ul className="space-y-2">
                {searchResults.map(result => (
                  <li 
                    key={result.section.id}
                    className="border border-gray-200 rounded-md p-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      setActiveSection(result.section.id);
                      setSearchQuery('');
                      if (window.innerWidth < 768) {
                        setShowMobileSidebar(false);
                      }
                    }}
                  >
                    <div className="font-medium text-blue-600">{result.section.title}</div>
                    <div 
                      className="text-xs text-gray-600 mt-1"
                      dangerouslySetInnerHTML={{ __html: result.snippet }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              {bookmarkedSections.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <BookmarkCheck className="h-4 w-4 text-blue-500 mr-2" />
                    Bookmarked Sections
                  </h3>
                  <ul className="space-y-1">
                    {bookmarkedSections.map(sectionId => {
                      const section = allSections.find(s => s.id === sectionId);
                      if (!section) return null;
                      
                      return (
                        <li key={sectionId}>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start text-left text-sm py-1 ${activeSection === sectionId ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                            onClick={() => {
                              setActiveSection(sectionId);
                              if (window.innerWidth < 768) {
                                setShowMobileSidebar(false);
                              }
                            }}
                          >
                            {section.title}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Documentation</h3>
                <ul className="space-y-1">
                  {filteredSections.map(section => (
                    <li key={section.id} className={section.level === 2 ? 'pl-4' : ''}>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          className={`flex-grow justify-start text-left text-sm py-1 ${activeSection === section.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
                          onClick={() => {
                            setActiveSection(section.id);
                            if (window.innerWidth < 768) {
                              setShowMobileSidebar(false);
                            }
                          }}
                        >
                          {section.title}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-1 text-gray-400 hover:text-blue-500"
                          onClick={() => toggleBookmark(section.id)}
                        >
                          {bookmarkedSections.includes(section.id) ? (
                            <BookmarkCheck className="h-4 w-4" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Content area */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto doc-scrollbar"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {allSections.find(s => s.id === activeSection)?.title || 'Documentation'}
          </h1>
          <div className="flex items-center space-x-4">
            <button 
              className={`flex items-center text-sm ${bookmarkedSections.includes(activeSection) ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => toggleBookmark(activeSection)}
            >
              {bookmarkedSections.includes(activeSection) ? (
                <>
                  <BookmarkCheck className="h-4 w-4 mr-1" />
                  Bookmarked
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-1" />
                  Bookmark
                </>
              )}
            </button>
            <a 
              href="#" 
              className="flex items-center text-sm text-gray-600 hover:text-blue-600"
              onClick={(e) => {
                e.preventDefault();
                // This would typically open in a new tab or window
                alert('This would open the full documentation in a new tab.');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open in new tab
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          {getContentForSection(activeSection)}
        </div>
      </div>
    </div>
  );
}
