
import { JSONPath } from 'jsonpath';

export const handleJSONPath = (script: string, data: any): any => {
  try {
    // Parse JSON data if it's a string
    const jsonData = typeof data === 'string' ? JSON.parse(data) : data;

    // Handle direct root property access (SnapLogic style)
    // e.g., $ACTION should work directly
    if (script.match(/^\$[A-Za-z]/)) {
      const propertyName = script.substring(1);
      if (Array.isArray(jsonData)) {
        const results = jsonData.map(item => item[propertyName]);
        return results.length === 1 ? results[0] : results;
      }
      return jsonData[propertyName];
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

    // Handle array properties (like MAST_UPL)
    const propertyAccesses = normalizedExpression.match(/\$\.([^.\[]+)\.?/g);
    if (propertyAccesses) {
      for (const propAccess of propertyAccesses) {
        const prop = propAccess.replace(/^\$\./, '').replace(/\.$/, '');
        // Check if this property exists and is an array in the data
        if (Array.isArray(jsonData)) {
          const firstItem = jsonData[0];
          if (firstItem && Array.isArray(firstItem[prop]) && !propAccess.includes('[')) {
            // If it's an array and doesn't already have array access notation, add [*]
            normalizedExpression = normalizedExpression.replace(
              new RegExp(`${prop}\\.`),
              `${prop}[*].`
            );
          }
        }
      }
    }

    // Handle recursive search
    if (normalizedExpression.includes('..')) {
      normalizedExpression = normalizedExpression.replace(/\.\./g, '..');
    }

    // Execute JSONPath query with options
    const result = JSONPath({
      path: normalizedExpression,
      json: jsonData,
      wrap: false
    });

    // Handle empty results
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return null;
    }

    // Handle array results
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
