
import { JSONPath } from 'jsonpath';

export const handleJSONPath = (script: string, data: any): any => {
  try {
    // Parse JSON data if it's a string
    const jsonData = typeof data === 'string' ? JSON.parse(data) : data;

    // Handle root access cases
    if (script === '$' || script === 'jsonPath($,"$")') {
      return jsonData;
    }

    // Check if the script includes an explicit array index after the expression
    const hasExplicitIndex = script.match(/\[(\d+|\-\d+)\]$/);
    let explicitIndex: number | null = null;
    if (hasExplicitIndex) {
      explicitIndex = parseInt(hasExplicitIndex[1]);
      script = script.slice(0, hasExplicitIndex.index);
    }

    // Normalize the expression
    let normalizedExpression = script;

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

    // Handle MAST_UPL specific cases
    if (normalizedExpression.includes('MAST_UPL')) {
      // Handle array wildcards for MAST_UPL
      if (!normalizedExpression.includes('[*]')) {
        normalizedExpression = normalizedExpression.replace(/MAST_UPL\./, 'MAST_UPL[*].');
      }
    }

    // Handle recursive search
    if (normalizedExpression.includes('..')) {
      // Ensure proper format for recursive search
      normalizedExpression = normalizedExpression.replace(/\.\./g, '..');
    }

    // Handle root array access
    if (!normalizedExpression.startsWith('$[') && Array.isArray(jsonData)) {
      normalizedExpression = normalizedExpression.replace('$', '$[*]');
    }

    // Execute JSONPath query with options
    const result = JSONPath({
      path: normalizedExpression,
      json: jsonData,
      wrap: false // Don't wrap single results in an array
    });

    // Handle empty results
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return null;
    }

    // Handle explicit index access (e.g., [0] at the end of expression)
    if (explicitIndex !== null) {
      if (Array.isArray(result)) {
        // Handle negative indices
        const actualIndex = explicitIndex < 0 ? result.length + explicitIndex : explicitIndex;
        return result[actualIndex] ?? null;
      }
      return null;
    }

    // Handle wildcard array results
    if (normalizedExpression.includes('[*]')) {
      // If the result is already an array and we used a wildcard,
      // return the array as is
      return Array.isArray(result) ? result : [result];
    }

    // Return single value for non-wildcard queries
    if (Array.isArray(result) && result.length === 1 && 
        !normalizedExpression.includes('*') && 
        !normalizedExpression.includes('..')) {
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
