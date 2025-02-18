
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { handleJSONPath } from "@/utils/jsonPathHandler";

const Index = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [scriptInput, setScriptInput] = useState("");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const handleExecute = () => {
    try {
      // Validate JSON input
      const parsedJson = JSON.parse(jsonInput);
      
      // Execute JSONPath
      const result = handleJSONPath(scriptInput, parsedJson);
      
      // Format and display result
      setOutput(JSON.stringify(result, null, 2));
      
      toast({
        title: "Success",
        description: "JSONPath executed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">JSONPath Evaluator</h1>
        
        {/* JSON Input Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            JSON Input
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-48 p-3 border rounded-md font-mono text-sm bg-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your JSON data here..."
          />
        </div>

        {/* Script Input Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            JSONPath Expression
          </label>
          <input
            type="text"
            value={scriptInput}
            onChange={(e) => setScriptInput(e.target.value)}
            className="w-full p-3 border rounded-md font-mono text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter JSONPath expression (e.g., $.store.book[*].author)"
          />
        </div>

        {/* Execute Button */}
        <div className="flex justify-center">
          <button
            onClick={handleExecute}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Execute
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Result
          </label>
          <textarea
            value={output}
            readOnly
            className="w-full h-48 p-3 border rounded-md font-mono text-sm bg-gray-50 resize-none"
            placeholder="Output will appear here..."
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
