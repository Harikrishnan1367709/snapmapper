import React from 'react';
import Editor from 'react-simple-code-editor';

import Prism from 'prismjs';

import 'prismjs/components/prism-json';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

// Initialize Prism.js
Prism.manual = true;

export function CodeEditor({ value, onChange, language = 'javascript' }) {
  return (
    <Editor
      value={value}
      onValueChange={onChange}
      highlight={(code) => Prism.highlight(code, Prism.languages[language], language)}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 14,
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        minHeight: '200px',
      }}
    />
  );
}
