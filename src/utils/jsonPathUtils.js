
import { JSONPath } from 'jsonpath-plus';

export function handleJSONPathExpressions(expression, data, handleJSONPath) {
  const jsonPathRegex = /(\$[\w.[\]]+(?:\.(?:toUpperCase|toLowerCase)\(\))?)/g;
  return expression.replace(jsonPathRegex, (match) => {
    try {
      const hasUpperCase = match.endsWith('.toUpperCase()');
      const hasLowerCase = match.endsWith('.toLowerCase()');
      const basePath = match.split('.to')[0];

      let value = handleJSONPath(basePath, data);

      if (typeof value === 'string') {
        if (hasUpperCase) value = value.toUpperCase();
        if (hasLowerCase) value = value.toLowerCase();
      }

      return typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
    } catch (e) {
      console.error("JSONPath evaluation error:", e);
      return 'null';
    }
  });
}

export class JsonPathEvaluator {
  constructor(data) {
    this.data = data;
  }

  evaluate(path) {
    try {
      if (path === '$') {
        return this.data;
      }

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

      const result = JSONPath({ 
        path: path, 
        json: this.data,
        wrap: false
      });

      if (result === undefined || result === null) {
        return null;
      }

      if (path.includes('[*]') || path.includes('..')) {
        return Array.isArray(result) ? result : [result];
      }

      return result;
    } catch (error) {
      console.error('JSONPath evaluation error:', error);
      throw new Error(`Invalid JSONPath expression: ${path}`);
    }
  }
}
