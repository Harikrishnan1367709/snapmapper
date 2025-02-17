
import { JSONPath } from 'jsonpath';

export const handleJSONPath = (script: string, data: any): any => {
  try {
    // Parse JSON data if it's a string
    const jsonData = typeof data === 'string' ? JSON.parse(data) : data;

    // Handle root access cases
    if (script === '$' || script === 'jsonPath($,"$")') {
      return jsonData;
    }

    // Normalize the expression
    let normalizedExpression = script;
    let finalArrayAccess = false;

    // Handle jsonPath function syntax with explicit [0] at the end
    if (normalizedExpression.match(/jsonPath\(\$,\s*["'].+?\["']\)\[0\]/)) {
      finalArrayAccess = true;
      normalizedExpression = normalizedExpression.replace(/\[0\]$/, '');
    }

    // Handle jsonPath function syntax
    if (normalizedExpression.startsWith('jsonPath(')) {
      const pathMatch = normalizedExpression.match(/jsonPath\(\$,\s*["'](.+?)["']\)/);
      if (pathMatch) {
        normalizedExpression = pathMatch[1];
      } else {
        throw new Error('Invalid jsonPath function syntax');
      }
    }

    // Remove quotes if present
    normalizedExpression = normalizedExpression.replace(/^["'](.+)["']$/, '$1');

    // Handle direct property access (e.g., $ACTION -> $.ACTION)
    normalizedExpression = normalizedExpression.replace(/\$([A-Za-z])/g, '$.$1');

    // Handle array access for MAST_UPL
    if (normalizedExpression.includes('MAST_UPL.')) {
      normalizedExpression = normalizedExpression.replace('MAST_UPL.', 'MAST_UPL[0].');
    }

    // Handle root array access
    if (!normalizedExpression.startsWith('$[0]') && Array.isArray(jsonData)) {
      normalizedExpression = normalizedExpression.replace('$', '$[0]');
    }

    // Execute JSONPath query
    const result = JSONPath({ path: normalizedExpression, json: jsonData });

    // Handle empty results
    if (!result || result.length === 0) {
      return null;
    }

    // Return first element if explicitly requested
    if (finalArrayAccess || script.includes('[0]')) {
      return result[0];
    }

    // Return single value for non-wildcard queries
    if (result.length === 1 && !normalizedExpression.includes('*') && !normalizedExpression.includes('..')) {
      return result[0];
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`JSONPath evaluation failed: ${error.message}`);
    }
    throw new Error('JSONPath evaluation failed: Unknown error');
  }
};
