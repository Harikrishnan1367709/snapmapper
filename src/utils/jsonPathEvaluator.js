
import { JSONPath } from 'jsonpath-plus';

export class JsonPathEvaluator {
  constructor(data) {
    this.data = data;
  }

  evaluate(path) {
    try {
      // Handle simple root path
      if (path === '$') {
        return this.data;
      }

      // Handle array access with specific index
      const hasArrayAccess = path.match(/\[\d+\]$/);
      if (hasArrayAccess) {
        const basePath = path.slice(0, path.lastIndexOf('['));
        const index = parseInt(path.match(/\[(\d+)\]$/)[1]);
        const result = JSONPath({ 
          path: basePath, 
          json: this.data,
          wrap: false
        });
        return Array.isArray(result) ? result[index] : result;
      }

      // Handle regular JSONPath expressions
      const result = JSONPath({ 
        path: path, 
        json: this.data,
        wrap: false
      });

      // If the result is undefined or null, return null
      if (result === undefined || result === null) {
        return null;
      }

      // Return array if path contains wildcard or array slice
      if (path.includes('[*]') || path.includes('..')) {
        return Array.isArray(result) ? result : [result];
      }

      // Return single value for specific paths
      return result;
    } catch (error) {
      console.error('JSONPath evaluation error:', error);
      throw new Error(`Invalid JSONPath expression: ${path}`);
    }
  }
}
