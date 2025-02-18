
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
    let normalizedExpression = normalizeExpression(components);

    console.log('Original expression:', script);
    console.log('Normalized expression:', normalizedExpression);

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

  // Check if it's a jsonPath function call
  if (script.startsWith('jsonPath(')) {
    components.isJsonPathFunc = true;
    const pathMatch = script.match(/jsonPath\(\$,\s*["'](.+?)["']\)/);
    if (pathMatch) {
      components.path = pathMatch[1];
    } else {
      throw new Error('Invalid jsonPath function syntax');
    }
  }

  // Check for direct property access ($property)
  if (script.match(/^\$[A-Za-z][^.[\s]*/)) {
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

function normalizeExpression(components: ExpressionComponents): string {
  let normalized = components.path;

  // Handle root access cases
  if (normalized === '$' || normalized === 'jsonPath($,"$")') {
    return '$';
  }

  // Remove quotes if present
  normalized = normalized.replace(/^["'](.+)["']$/, '$1');

  // Handle direct property access ($property -> $.property)
  if (components.isDirect) {
    // Split the path into segments
    const segments = normalized.split(/[\.\[]/).filter(Boolean);
    let result = '$';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      // Handle array access
      if (segment.includes(']')) {
        result += segment;
      } else if (segment.startsWith('$')) {
        // First segment with $ prefix
        result += '.' + segment.substring(1);
      } else {
        // Regular property
        result += '.' + segment;
      }
    }

    normalized = result;
  }

  // Handle array access
  if (components.hasArrayAccess) {
    // Preserve array wildcards
    normalized = normalized.replace(/\[\*\]/g, '[*]');
    
    // Preserve array indices
    normalized = normalized.replace(/\[(\d+)\]/g, '[$1]');
  }

  // Handle filter expressions
  if (components.hasFilter) {
    // Ensure filter expressions are preserved exactly
    const filterMatches = normalized.match(/\[\?\(.*?\)\]/g) || [];
    for (const filter of filterMatches) {
      // Temporarily replace filter to protect it during other transformations
      const placeholder = `__FILTER_${Math.random()}_`;
      normalized = normalized.replace(filter, placeholder);
      // Restore the filter after other transformations
      normalized = normalized.replace(placeholder, filter);
    }
  }

  // Ensure proper dot notation
  normalized = normalized.replace(/([A-Za-z0-9_])\[/g, '$1.[');

  return normalized;
}

function processResult(result: any, components: ExpressionComponents): any {
  // Handle empty results
  if (result === undefined || result === null || 
      (Array.isArray(result) && result.length === 0)) {
    return null;
  }

  // Handle array results
  if (components.hasArrayAccess || components.path.includes('[*]')) {
    return Array.isArray(result) ? result : [result];
  }

  // Return single value for non-wildcard queries
  if (Array.isArray(result) && result.length === 1 && 
      !components.path.includes('*') && 
      !components.path.includes('..')) {
    return result[0];
  }

  // Handle direct property access results
  if (components.isDirect && Array.isArray(result) && result.length === 1) {
    return result[0];
  }

  return result;
}
