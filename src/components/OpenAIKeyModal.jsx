
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const OpenAIKeyModal = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('OPENAI_API_KEY') || '');
  
  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('OPENAI_API_KEY', apiKey.trim());
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OpenAI API Key</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-gray-600">
            Enter your OpenAI API key to enable script validation. The key is stored locally in your browser.
          </p>
          <div>
            <Label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </Label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="sk-..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OpenAIKeyModal;
