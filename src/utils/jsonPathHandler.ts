
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
    console.log('Input data:', jsonData);

    // Execute JSONPath query with options
    const result = JSONPath({
      path: normalizedExpression,
      json: jsonData,
      wrap: false
    });

    console.log('Query result:', result);
    return processResult(result, components);

  } catch (error) {
    console.error('JSONPath evaluation error:', error);
    if (error instanceof Error) {
      throw new Error(`JSONPath evaluation failed: ${error.message}`);
    }
    throw new Error('JSONPath evaluation failed: Unknown error');
  }
};

function parseExpression(script: string): ExpressionComponents {
  const components: ExpressionComponents = {
    isJsonPathFunc: false,
    path: script,
    hasArrayAccess: false,
    hasFilter: false,
    isDirect: false
  };

  // Check if expression starts with $ and contains a property name
  if (script.startsWith('$') && !script.startsWith('$.')) {
    components.isDirect = true;
  }

  // Detect array access and filters
  components.hasArrayAccess = script.includes('[') && (
    script.includes('[*]') || 
    script.match(/\[\d+\]/) !== null
  );
  
  components.hasFilter = script.includes('[?(');

  return components;
}

function normalizeExpression(script: string): string {
  // Handle root access
  if (script === '$') {
    return '$';
  }

  // Convert direct property access to standard JSONPath
  if (script.startsWith('$') && !script.startsWith('$.')) {
    script = '$.' + script.substring(1);
  }

  // Handle array access
  const preserveArrays = (expr: string): string => {
    // Preserve array wildcards
    expr = expr.replace(/\[\*\]/g, '[*]');
    // Preserve array indices
    expr = expr.replace(/\[(\d+)\]/g, '[$1]');
    return expr;
  };

  // Handle filter expressions
  const preserveFilters = (expr: string): string => {
    const filters = expr.match(/\[\?\(.*?\)\]/g) || [];
    let result = expr;
    filters.forEach((filter, index) => {
      const placeholder = `__FILTER_${index}_`;
      result = result.replace(filter, placeholder);
    });
    result = preserveArrays(result);
    filters.forEach((filter, index) => {
      const placeholder = `__FILTER_${index}_`;
      result = result.replace(placeholder, filter);
    });
    return result;
  };

  // Apply all transformations
  let normalized = script;
  normalized = preserveFilters(normalized);
  normalized = preserveArrays(normalized);

  return normalized;
}

function processResult(result: any, components: ExpressionComponents): any {
  // Handle empty results
  if (result === undefined || result === null) {
    return null;
  }

  // Handle array results
  if (Array.isArray(result)) {
    // Return array for wildcard queries or explicit array access
    if (components.hasArrayAccess || components.path.includes('[*]')) {
      return result;
    }
    // Return single value for non-wildcard queries that happened to return an array
    if (result.length === 1) {
      return result[0];
    }
    // Return the array if it contains multiple values
    return result;
  }

  return result;
}
