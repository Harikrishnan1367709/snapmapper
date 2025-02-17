
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
    if (normalizedExpression.match(/^\$[A-Za-z]/)) {
      const propertyName = normalizedExpression.substring(1);
      // If it's a simple property access without filters or wildcards
      if (!propertyName.includes('[') && !propertyName.includes('*')) {
        if (Array.isArray(jsonData)) {
          const results = jsonData.map(item => item[propertyName]);
          return results.length === 1 ? results[0] : results;
        }
        return jsonData[propertyName];
      }
    }

    // Convert direct access syntax to JSONPath syntax
    normalizedExpression = normalizedExpression.replace(/\$([A-Za-z])/g, '$.$1');

    // Handle array properties
    const propertyAccesses = normalizedExpression.match(/\$\.([^.\[]+)\.?/g);
    if (propertyAccesses) {
      for (const propAccess of propertyAccesses) {
        const prop = propAccess.replace(/^\$\./, '').replace(/\.$/, '');
        if (Array.isArray(jsonData)) {
          const firstItem = jsonData[0];
          // Add [*] for array properties that don't already have array notation
          if (firstItem && Array.isArray(firstItem[prop]) && !normalizedExpression.includes(`${prop}[`)) {
            normalizedExpression = normalizedExpression.replace(
              new RegExp(`${prop}(?=\\.|$)`),
              `${prop}[*]`
            );
          }
        }
      }
    }

    // Handle filter expressions
    if (normalizedExpression.includes('?(@')) {
      // Ensure proper array context for filters
      normalizedExpression = normalizedExpression.replace(
        /(\[[^\]]*\])\[\?\(@/g,
        '$1[?(@'
      );
    }

    console.log('Normalized expression:', normalizedExpression);

    // Execute JSONPath query with options
    const result = JSONPath({
      path: normalizedExpression,
      json: jsonData,
      wrap: false
    });

    console.log('Query result:', result);

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
    console.error('JSONPath evaluation error:', error);
    if (error instanceof Error) {
      throw new Error(`JSONPath evaluation failed: ${error.message}`);
    }
    throw new Error('JSONPath evaluation failed: Unknown error');
  }
};
