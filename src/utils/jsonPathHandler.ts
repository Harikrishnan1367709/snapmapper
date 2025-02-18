
import { JSONPath } from 'jsonpath';

interface ExpressionComponents {
  isJsonPathFunc: boolean;
  path: string;
  hasArrayAccess: boolean;
  hasFilter: boolean;
  isDirect: boolean;
}

export const handleJSONPath = (script: string, data: any): any => {
  try {
    // Parse JSON data if it's a string
    const jsonData = typeof data === 'string' ? JSON.parse(data) : data;

    // First phase: Expression preprocessing
    const components = parseExpression(script);
    let normalizedExpression = normalizeExpression(script);

    console.log('Original expression:', script);
    console.log('Normalized expression:', normalizedExpression);
    console.log('Expression components:', components);
    console.log('Input data:', jsonData);

    // Execute JSONPath query
    const result = JSONPath({
      path: normalizedExpression,
      json: jsonData
    });

    console.log('Raw query result:', result);
    const processedResult = processResult(result, components);
    console.log('Processed result:', processedResult);
    
    return processedResult;

  } catch (error) {
    console.error('JSONPath evaluation error:', error);
    if (error instanceof Error) {
      throw new Error(`JSONPath evaluation failed: ${error.message}`);
    }
    throw new Error('JSONPath evaluation failed: Unknown error');
  }
};

function parseExpression(script: string): ExpressionComponents {
  return {
    isJsonPathFunc: false,
    path: script,
    hasArrayAccess: script.includes('[') && (
      script.includes('[*]') || 
      /\[\d+\]/.test(script)
    ),
    hasFilter: script.includes('[?('),
    isDirect: script === '$' || (script.startsWith('$') && !script.startsWith('$.'))
  };
}

function normalizeExpression(script: string): string {
  // Handle root access
  if (script === '$') {
    return '$';
  }

  let normalized = script;

  // Convert direct property access to standard JSONPath
  if (normalized.startsWith('$') && !normalized.startsWith('$.')) {
    const parts = normalized.split(/[.[\]]/).filter(Boolean);
    normalized = '$';
    for (let part of parts) {
      if (part.startsWith('$')) {
        part = part.substring(1);
      }
      if (part) {
        normalized += '.' + part;
      }
    }
  }

  // Handle array access
  const preserveArrays = (expr: string): string => {
    return expr.replace(/\[(\*|\d+)\]/g, '[$1]');
  };

  // Handle filter expressions
  const preserveFilters = (expr: string): string => {
    const filterRegex = /(\[\?\(.*?\)\])/g;
    const filters = expr.match(filterRegex) || [];
    let result = expr;

    filters.forEach((filter, index) => {
      const placeholder = `__FILTER_${index}__`;
      result = result.replace(filter, placeholder);
    });

    result = preserveArrays(result);

    filters.forEach((filter, index) => {
      const placeholder = `__FILTER_${index}__`;
      result = result.replace(placeholder, filter);
    });

    return result;
  };

  normalized = preserveFilters(normalized);

  console.log('Final normalized expression:', normalized);
  return normalized;
}

function processResult(result: any, components: ExpressionComponents): any {
  if (result === undefined || result === null || result.length === 0) {
    return null;
  }

  // Handle root query
  if (components.path === '$') {
    return result;
  }

  // Handle array results
  if (Array.isArray(result)) {
    // Return array for wildcard queries or explicit array access
    if (components.hasArrayAccess || components.path.includes('[*]')) {
      return result;
    }
    // Return single value for direct property access that returned an array
    if (result.length === 1 && !components.hasArrayAccess) {
      return result[0];
    }
    // Return the array if it contains multiple values
    return result;
  }

  return result;
}
