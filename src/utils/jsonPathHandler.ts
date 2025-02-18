
import { JSONPath } from 'jsonpath';

interface ExpressionComponents {
  isJsonPathFunc: boolean;
  path: string;
  hasArrayAccess: boolean;
  hasFilter: boolean;
}

export const handleJSONPath = (script: string, data: any): any => {
  try {
    // Parse JSON data if it's a string
    const jsonData = typeof data === 'string' ? JSON.parse(data) : data;

    // First phase: Expression preprocessing
    const components = parseExpression(script);
    let normalizedExpression = normalizeExpression(components, jsonData);

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
    hasFilter: false
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

  // Detect array access and filters
  components.hasArrayAccess = components.path.includes('[*]') || components.path.includes('[0]');
  components.hasFilter = components.path.includes('?(@');

  return components;
}

function normalizeExpression(components: ExpressionComponents, jsonData: any): string {
  let normalized = components.path;

  // Handle root access cases
  if (normalized === '$' || normalized === 'jsonPath($,"$")') {
    return '$';
  }

  // Remove quotes if present
  normalized = normalized.replace(/^["'](.+)["']$/, '$1');

  // Handle direct property access (e.g., $ACTION -> $.ACTION)
  if (normalized.match(/^\$[A-Za-z]/)) {
    const propertyName = normalized.substring(1);
    // For simple property access without filters or wildcards
    if (!propertyName.includes('[') && !propertyName.includes('*')) {
      if (Array.isArray(jsonData)) {
        normalized = `$[*].${propertyName}`;
      } else {
        normalized = `$.${propertyName}`;
      }
    }
  }

  // Convert direct access syntax to JSONPath syntax
  normalized = normalized.replace(/\$([A-Za-z])/g, '$.$1');

  // Handle array properties
  const propertyAccesses = normalized.match(/\$\.([^.\[]+)\.?/g);
  if (propertyAccesses) {
    for (const propAccess of propertyAccesses) {
      const prop = propAccess.replace(/^\$\./, '').replace(/\.$/, '');
      if (Array.isArray(jsonData)) {
        const firstItem = jsonData[0];
        // Add [*] for array properties that don't already have array notation
        if (firstItem && Array.isArray(firstItem[prop]) && !normalized.includes(`${prop}[`)) {
          normalized = normalized.replace(
            new RegExp(`${prop}(?=\\.|$)`),
            `${prop}[*]`
          );
        }
      }
    }
  }

  // Handle filter expressions
  if (normalized.includes('?(@')) {
    // Ensure proper array context for filters
    normalized = normalized.replace(
      /(\[[^\]]*\])\[\?\(@/g,
      '$1[?(@'
    );
  }

  return normalized;
}

function processResult(result: any, components: ExpressionComponents): any {
  // Handle empty results
  if (!result || (Array.isArray(result) && result.length === 0)) {
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

  return result;
}
