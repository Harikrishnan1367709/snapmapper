<lov-code>
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
        background: #fff;
        border-radius: 4px;
      }
      
      .doc-scrollbar::-webkit-scrollbar-thumb {
        background: #3b82f6; /* Blue scrollbar thumb */
        border-radius: 4px;
        border: 2px solid #fff;
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
              code={`// Sample complex JSON structure\nconst testData = {\n  "users": [\n    {\n      "name": "John",\n      "age": 30,\n      "role": "admin",\n      "permissions": ["read", "write", "delete"],\n      "friends": [\n
