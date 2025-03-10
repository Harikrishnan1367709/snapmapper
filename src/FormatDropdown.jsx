import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react'

const FormatDropdown = ({ onFormatChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('JSON');
  const formats = ['JSON'];
  
  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
    setIsOpen(false);
    // Notify parent component about format change
    onFormatChange(format.toLowerCase());
  };
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center h-[30px] bg-white space-x-2 focus:outline-none focus:ring-0 focus:border-none active:outline-none hover:outline-none border-none outline-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <span className="font-bold text-gray-600 hover:text-blue-500 text-xs mr-14">{selectedFormat}</span>
        <img
          src="/chevron_down_small.svg"
          alt="SnapLogic Logo"
          className="text-gray-500 h-3 w-3"
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white border shadow-lg py-1 z-10">
          {formats.map((format) => (
            <div
              key={format}
              className="px-4 py-2 hover:bg-gray-100 text-[12px]
  font-system-default
  font-bold
  text-[rgb(107,108,109)]
  leading-[18px] cursor-pointer "
              onClick={() => handleFormatSelect(format)}
            >
              {format}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormatDropdown;