import React, { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';

const tutorialData = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `SnapLogic is a modern integration platform that helps organizations connect their applications, data, and APIs. This comprehensive guide will walk you through the fundamentals of SnapLogic and its powerful playground environment.`,
    subTopics: [
      {
        id: 'what-is-snaplogic',
        title: '1.1 What is SnapLogic',
        content: `SnapLogic is an Enterprise Integration Platform as a Service (iPaaS) that provides a unified platform for application and data integration. It enables organizations to connect cloud and on-premises applications, automate business processes, and drive digital transformation.

Key aspects of SnapLogic:
• Cloud-native integration platform
• Visual development environment
• Pre-built connectors and integration patterns
• Real-time data processing capabilities
• Enterprise-grade security and governance`,
        codeExample: `// Example of basic SnapLogic pipeline
{
  "pipeline": {
    "name": "Sample Integration",
    "tasks": [
      {
        "type": "REST",
        "endpoint": "/api/data",
        "method": "GET"
      },
      {
        "type": "Transform",
        "mapping": "$.data.items"
      }
    ]
  }
}`
      },
      {
        id: 'what-is-snaplogic-playground',
        title: '1.2 What is SnapLogic Playground',
        content: `SnapLogic Playground is an interactive environment where users can experiment with SnapLogic's expression language and data transformation capabilities. It provides a safe space to:

• Test data transformations
• Learn expression syntax
• Validate output results
• Debug expressions in real-time
• Share and collaborate on solutions`,
        codeExample: `// Example of playground expression
$.body.customers[*].{
  "id": $.customerId,
  "name": $.firstName + " " + $.lastName,
  "orders": $.orders[*].orderId
}`
      },
      {
        id: 'why-snaplogic-playground',
        title: '1.3 Why SnapLogic Playground',
        content: `SnapLogic Playground offers several advantages for developers and integration specialists:

1. Rapid Prototyping
   • Test expressions quickly
   • Immediate feedback
   • No setup required

2. Learning Tool
   • Interactive examples
   • Real-time validation
   • Comprehensive documentation

3. Collaboration
   • Share expressions
   • Team learning
   • Best practices development`,
        codeExample: `// Example showing playground benefits
// Input JSON
{
  "data": [1, 2, 3, 4, 5]
}

// Expression
$.data[*].{
  "value": $,
  "squared": $ * $,
  "isEven": $ % 2 == 0
}

// Immediate output validation
// Learn and experiment in real-time`
      }
    ]
  },
  {
    id: 'key-features',
    title: '2. Key Features',
    content: `SnapLogic Playground offers a rich set of features designed to enhance your integration development experience:

1. Interactive Editor
   • Syntax highlighting
   • Auto-completion
   • Error detection

2. Real-time Execution
   • Immediate results
   • Performance metrics
   • Error feedback

3. Multiple Input Support
   • JSON data
   • XML conversion
   • Custom formats

4. Expression Library
   • Common patterns
   • Best practices
   • Reusable components`,
    codeExample: `// Example demonstrating key features
// Multiple input handling
$input1.customers[?(@.type == 'premium')].{
  "id": $.id,
  "total": sum($.orders[*].amount),
  "status": if($.active, 'Active', 'Inactive')
}`
  },
  {
    id: 'ui-overview',
    title: '3. User Interface Overview',
    content: `The SnapLogic Playground interface is divided into several key areas:

1. Navigation Bar
   • Project management
   • Settings
   • Documentation access

2. Editor Panel
   • Expression editor
   • Syntax highlighting
   • Line numbers

3. Input Panel
   • Data input
   • Format selection
   • Sample data

4. Output Panel
   • Results display
   • Error messages
   • Performance metrics`,
    codeExample: `// UI demonstration
// Editor Panel
$.data.transform()

// Input Panel
{
  "data": {
    "items": []
  }
}

// Output Panel
// Results shown here`
  },
  {
    id: 'functions',
    title: '5. Functions',
    content: 'SnapLogic provides a comprehensive set of functions for data transformation and manipulation.',
    subTopics: [
      {
        id: 'string-functions',
        title: '5.1 String Functions',
        content: `String functions in SnapLogic allow you to manipulate text data efficiently:

1. Basic Operations
   • concat() - Combine strings
   • substring() - Extract part of string
   • trim() - Remove whitespace

2. Case Manipulation
   • uppercase() - Convert to upper case
   • lowercase() - Convert to lower case
   • capitalize() - Capitalize first letter

3. Search and Replace
   • contains() - Check if string contains substring
   • replace() - Replace text
   • split() - Split string into array`,
        codeExample: `// String function examples
// Basic string manipulation
$uppercase("hello") // "HELLO"
$lowercase("WORLD") // "world"
$trim("  spaces  ") // "spaces"

// Advanced operations
$substring("Hello World", 0, 5) // "Hello"
$replace("Hello", "H", "Y") // "Yello"
$split("a,b,c", ",") // ["a", "b", "c"]`
      },
      {
        id: 'array-functions',
        title: '5.2 Array Functions',
        content: `Array functions provide powerful capabilities for working with collections of data:

1. Basic Operations
   • length() - Get array size
   • first() - Get first element
   • last() - Get last element

2. Transformation
   • map() - Transform elements
   • filter() - Filter elements
   • reduce() - Reduce to single value

3. Manipulation
   • sort() - Sort array
   • reverse() - Reverse order
   • concat() - Combine arrays`,
        codeExample: `// Array function examples
// Basic array operations
$length([1,2,3]) // 3
$first([1,2,3]) // 1
$last([1,2,3]) // 3

// Advanced operations
$[1,2,3].map($ * 2) // [2,4,6]
$filter([1,2,3], $ > 1) // [2,3]
$sort([3,1,2]) // [1,2,3]`
      }
    ]
  },
  // Add more sections as needed
];

const SnapLogicTutorial = () => {
  const [selectedTopic, setSelectedTopic] = useState(tutorialData[0]);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentContent = useMemo(() => {
    return selectedSubTopic || selectedTopic;
  }, [selectedTopic, selectedSubTopic]);

  const handleTopicChange = (topic) => {
    setIsLoading(true);
    setSelectedTopic(topic);
    setSelectedSubTopic(null);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleSubTopicChange = (subTopic) => {
    setIsLoading(true);
    setSelectedSubTopic(subTopic);
    setTimeout(() => setIsLoading(false), 300);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Table of Contents */}
      <div className="w-64 border-r overflow-y-auto p-4 bg-gray-50">
        <h2 className="font-semibold mb-4 text-gray-800 font-['Manrope']">Table of Contents</h2>
        <div className="space-y-2">
          {tutorialData.map((topic) => (
            <div key={topic.id} className="rounded-sm overflow-hidden">
              <button
                className={`block w-full text-left py-2 px-3 text-sm font-medium transition-colors font-['Manrope']
                  ${selectedTopic.id === topic.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleTopicChange(topic)}
              >
                {topic.title}
              </button>
              {topic.subTopics && topic.id === selectedTopic.id && (
                <div className="ml-4 border-l border-gray-200 mt-1 space-y-1">
                  {topic.subTopics.map(subTopic => (
                    <button
                      key={subTopic.id}
                      className={`block w-full text-left py-1.5 px-3 text-xs transition-colors font-['Manrope']
                        ${selectedSubTopic?.id === subTopic.id 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-600 hover:bg-gray-100'}`}
                      onClick={() => handleSubTopicChange(subTopic)}
                    >
                      {subTopic.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Middle Panel - Content */}
      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 font-['Manrope']">
              {currentContent.title}
            </h1>
            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 whitespace-pre-line font-['Manrope']">
                {currentContent.content || 'Content coming soon...'}
              </p>
            </div>
            {currentContent.codeExample && (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <Editor
                  height="300px"
                  language="javascript"
                  theme="vs-dark"
                  value={currentContent.codeExample}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                  loading={<div className="h-full w-full bg-gray-800 animate-pulse" />}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SnapLogicTutorial;