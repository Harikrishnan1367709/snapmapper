
import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

export function FormatDropdown({ onFormatChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('dw');

  const formats = [
    { id: 'dw', name: 'DataWeave' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'json', name: 'JSON' },
    { id: 'xml', name: 'XML' }
  ];

  const handleFormatSelect = (format) => {
    setSelectedFormat(format.id);
    onFormatChange(format.id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-xs font-medium text-gray-700 hover:text-dataweave-blue focus:outline-none"
      >
        <span>{formats.find(f => f.id === selectedFormat)?.name || 'Format'}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-sm shadow-md z-10">
          <ul className="py-1">
            {formats.map((format) => (
              <li
                key={format.id}
                onClick={() => handleFormatSelect(format)}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-dataweave-highlight ${
                  selectedFormat === format.id ? 'text-dataweave-blue font-medium' : 'text-gray-700'
                }`}
              >
                {format.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
