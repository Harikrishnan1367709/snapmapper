import React, { useEffect, useMemo, useRef, useState } from 'react';
import { JSONPath } from 'jsonpath-plus';
import { ChevronDown, Upload, Download, Terminal, Book, ChevronLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';

const UpdatedCode = () => {
  const navigate = useNavigate();

  const getNavLink = (item) => {
    const links = {
      blogs: 'https://www.snaplogic.com/blog',
      docs: '/docs', // Changed to route path
      tutorial: 'https://www.youtube.com/snaplogic',
      playground: '/'
    };
    return links[item];
  };

  const handleNavClick = (item, e) => {
    if (e) {
      e.preventDefault(); // Prevent default behavior
    }
    
    if (item === 'docs') {
      navigate('/docs');
      setActiveNavItem('docs');
    } else if (item === 'playground') {
      navigate('/');
      setActiveNavItem('playground');
    } else {
      setActiveNavItem(item);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
      <div className="flex items-center justify-between px-6 py-2 border-b">
        <div className="space-x-8 text-[0.82rem] font-bold text-[#333333] relative font-['Manrope'] flex items-center">
          {['blogs', 'docs', 'tutorial', 'playground'].map(item => (
            <a
              key={item}
              href={getNavLink(item)}
              className={`text-black hover:text-blue-500 px-2 py-2 relative ${
                activeNavItem === item
                  ? 'after:content-[""] after:absolute after:left-0 after:right-0 after:h-0.5 after:bg-[#1B4E8D] after:-bottom-[0.5rem] z-10'
                  : ''
              }`}
              onClick={(e) => handleNavClick(item, e)}
            >
              {item.toUpperCase()}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdatedCode;
