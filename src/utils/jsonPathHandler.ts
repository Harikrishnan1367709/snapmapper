
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

    // Generic array property handling
    // Look for property access patterns that might be accessing arrays
    const propertyAccesses = normalizedExpression.match(/\$\.([^.\[]+)\.?/g);
    if (propertyAccesses) {
      for (const propAccess of propertyAccesses) {
        const prop = propAccess.replace(/^\$\./, '').replace(/\.$/, '');
        // Check if this property exists and is an array in the data
        const tempResult = JSONPath({ 
          path: `$['${prop}']`, 
          json: jsonData 
        });
        
        if (tempResult && Array.isArray(tempResult[0]) && !propAccess.includes('[')) {
          // If it's an array and doesn't already have array access notation, add [*]
          normalizedExpression = normalizedExpression.replace(
            new RegExp(`${prop}\\.`), 
            `${prop}[*].`
          );
        }
      }
    }

    // Handle recursive search
    if (normalizedExpression.includes('..')) {
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
