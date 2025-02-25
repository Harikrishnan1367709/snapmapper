// App.jsx
import React from "react";

const SnaplogicPlayground2 = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4">DataWeave Playground</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Explorer
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            rows="6"
            placeholder="Enter your JSON payload here..."
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Script
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            rows="6"
            placeholder="Write your script here..."
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded bg-gray-50"
            rows="4"
            readOnly
            value={`"Hello world!"`}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default SnaplogicPlayground2;
