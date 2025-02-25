import React from 'react'

export function OutputDisplay({ output }) {
  return (
    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[300px]">
      {output}
    </pre>
  )
}

