import React from 'react';

export const Documentation = ({ onBack }) => {
  return (
    <div className="font-['Manrope'] flex flex-col h-screen bg-white">
      {/* Header with Back Button */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-800 font-medium">
          &larr; Back to Playground
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Documentation</h1>
      </div>

      {/* Main Content */}
      <div className="p-6 overflow-y-auto">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to the SnapLogic Playground Documentation! This guide will help you understand how to use the playground effectively to build, test, and deploy your integration pipelines.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Getting Started</h2>
          <ol className="list-decimal pl-5 text-gray-700 leading-relaxed">
            <li>
              <strong>Create a New Project:</strong> Start by creating a new project in the playground. This will be your workspace for building pipelines.
            </li>
            <li>
              <strong>Add Data Sources:</strong> Connect to various data sources such as databases, APIs, and files.
            </li>
            <li>
              <strong>Design Your Pipeline:</strong> Use the drag-and-drop interface to design your integration pipeline.
            </li>
            <li>
              <strong>Test Your Pipeline:</strong> Run your pipeline with sample data to ensure it works as expected.
            </li>
            <li>
              <strong>Deploy Your Pipeline:</strong> Once you are satisfied, deploy your pipeline to the SnapLogic platform.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Features</h2>
          <ul className="list-disc pl-5 text-gray-700 leading-relaxed">
            <li>
              <strong>Drag-and-Drop Interface:</strong> Easily design pipelines with a visual interface.
            </li>
            <li>
              <strong>Pre-built Connectors:</strong> Connect to a wide range of data sources with pre-built connectors.
            </li>
            <li>
              <strong>Real-time Monitoring:</strong> Monitor your pipelines in real-time to ensure they are running smoothly.
            </li>
            <li>
              <strong>Error Handling:</strong> Handle errors gracefully with built-in error handling capabilities.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Advanced Usage</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Data Transformation</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Use the SnapLogic expression language to transform data as it flows through your pipeline.
          </p>
          <ul className="list-disc pl-5 text-gray-700 leading-relaxed">
            <li>
              <strong>Basic Transformation:</strong>
              <ul className="list-inside list-disc pl-5">
                <li>
                  <span><strong>Concatenation</strong> - Combine two fields: <code>$.firstName + ' ' + $.lastName</code></span>
                </li>
                <li>
                  <span><strong>Date Formatting</strong> - Convert date formats: <code>$date.toLocaleDateString()</code></span>
                </li>
              </ul>
            </li>
            <li>
              <strong>Conditional Transformation:</strong>
              <ul className="list-inside list-disc pl-5">
                <li>
                  <span><strong>If-Else Logic</strong> - Apply different transformations based on conditions: <code>$.age > 18 ? 'Adult' : 'Minor'</code></span>
                </li>
                <li>
                  <span><strong>Switch Case</strong> - Handle multiple conditions: <code>switch ($.status) { case 'active': return 'Enabled'; default: return 'Disabled'; }</code></span>
                </li>
              </ul>
            </li>
            <li>
              <strong>Array Transformation:</strong>
              <ul className="list-inside list-disc pl-5">
                <li>
                  <span><strong>Mapping</strong> - Transform each element in an array: <code>$.items.map(item => item.price * 1.1)</code></span>
                </li>
                <li>
                  <span><strong>Filtering</strong> - Apply conditions to select specific items: <code className="text-xs bg-blue-100 px-1 py-0.5 rounded">$.users[?(@.age&gt;30)]</code></span>
                </li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Best Practices</h2>
          <ul className="list-disc pl-5 text-gray-700 leading-relaxed">
            <li>
              <strong>Use Descriptive Names:</strong> Give your pipelines and Snaps descriptive names to make them easier to understand.
            </li>
            <li>
              <strong>Add Comments:</strong> Add comments to your pipelines to explain what they do.
            </li>
            <li>
              <strong>Test Thoroughly:</strong> Test your pipelines thoroughly before deploying them to production.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Troubleshooting</h2>
          <p className="text-gray-700 leading-relaxed">
            If you encounter any issues, please refer to the SnapLogic documentation or contact SnapLogic support for assistance.
          </p>
        </section>
      </div>
    </div>
  );
};
