
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

export const Documentation = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-['Manrope']">
      <div className="fixed inset-0 z-[-1] bg-white" />
      
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/d11a9e99-9c20-4aed-9025-1973db87d692.png" 
            alt="DataWeave Logo" 
            className="h-8"
            style={{ marginTop: '3px', marginLeft: '5px' }} 
          />
          <span className="text-lg font-semibold text-gray-800">DataWeave</span>
        </div>
        
        <div className="flex items-center space-x-10">
          <button className="dataweave-nav">
            BLOGS
          </button>
          <button className="dataweave-nav dataweave-nav-active">
            DOCS
          </button>
          <button className="dataweave-nav">
            TUTORIAL
          </button>
          <button 
            onClick={() => navigate('/')}
            className="dataweave-nav"
          >
            PLAYGROUND
          </button>
        </div>
      </div>

      <div className="flex-1 flex h-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 h-full overflow-y-auto bg-white">
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-dataweave-blue focus:border-transparent"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Getting Started</h3>
            <div className="mt-2 space-y-1">
              <button className="dataweave-sidebar-item active flex w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-sm hover:bg-dataweave-blue hover:bg-opacity-10 hover:text-dataweave-blue">
                <div className="absolute h-full left-0 w-0.5 bg-dataweave-blue"></div>
                Introduction
              </button>
              <button className="dataweave-sidebar-item w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-sm hover:bg-dataweave-blue hover:bg-opacity-10 hover:text-dataweave-blue">
                Installation
              </button>
              <button className="dataweave-sidebar-item w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-sm hover:bg-dataweave-blue hover:bg-opacity-10 hover:text-dataweave-blue">
                Quick Start
              </button>
            </div>
          </div>
          
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Core Concepts</h3>
            <div className="mt-2 space-y-1">
              <button className="dataweave-sidebar-item w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-sm hover:bg-dataweave-blue hover:bg-opacity-10 hover:text-dataweave-blue">
                Data Types
              </button>
              <button className="dataweave-sidebar-item w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-sm hover:bg-dataweave-blue hover:bg-opacity-10 hover:text-dataweave-blue">
                Functions
              </button>
              <button className="dataweave-sidebar-item w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-sm hover:bg-dataweave-blue hover:bg-opacity-10 hover:text-dataweave-blue">
                Operators
              </button>
            </div>
          </div>
          
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Advanced Topics</h3>
            <div className="mt-2 space-y-1">
              <button className="dataweave-sidebar-item w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-sm hover:bg-dataweave-blue hover:bg-opacity-10 hover:text-dataweave-blue">
                Pattern Matching
              </button>
              <button className="dataweave-sidebar-item w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-sm hover:bg-dataweave-blue hover:bg-opacity-10 hover:text-dataweave-blue">
                Error Handling
              </button>
              <button className="dataweave-sidebar-item w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-sm hover:bg-dataweave-blue hover:bg-opacity-10 hover:text-dataweave-blue">
                Custom Modules
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Introduction to DataWeave</h1>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            DataWeave is MuleSoft's powerful expression language that lets you access and transform data in Mule applications. This guide will introduce you to the language and help you understand how to use it effectively.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What is DataWeave?</h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            DataWeave is a functional, side-effect-free language designed to make data transformations easy. It features a concise syntax that makes the language both easy to write and read. The language includes numerous built-in functions and operators that help when you need to filter, group, join, pivot, and perform other operations on your data.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Features</h2>
          
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-6 space-y-2">
            <li>Transform data between different formats (JSON, XML, CSV, etc.)</li>
            <li>Manipulate complex data structures with ease</li>
            <li>Filter, map, reduce, and other functional operations</li>
            <li>Pattern matching for handling conditional transformations</li>
            <li>Rich standard library with numerous useful functions</li>
            <li>Extensible with custom modules and functions</li>
          </ul>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Getting Started</h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            The basic structure of a DataWeave script consists of a header and a body separated by <code className="bg-gray-100 px-1 py-0.5 rounded">---</code>. The header contains metadata about the script, such as input and output formats. The body contains the actual transformation logic.
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 mb-6">
            <pre className="text-sm">
              <code className="text-gray-800">
{`%dw 2.0
output application/json
---
{
  greeting: "Hello, world!"
}`}
              </code>
            </pre>
          </div>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            In the example above, <code className="bg-gray-100 px-1 py-0.5 rounded">%dw 2.0</code> indicates that we're using DataWeave version 2.0. The <code className="bg-gray-100 px-1 py-0.5 rounded">output application/json</code> directive specifies that the output should be in JSON format. The body of the script creates a simple JSON object with a greeting message.
          </p>
          
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Previous</p>
                <a href="#" className="text-dataweave-blue hover:underline">Installation</a>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Next</p>
                <a href="#" className="text-dataweave-blue hover:underline">Quick Start</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 py-2 px-6 text-xs text-gray-600 bg-white text-center">
        ©2023 MuleSoft LLC, a Salesforce company
      </div>
    </div>
  );
};

export default Documentation;
