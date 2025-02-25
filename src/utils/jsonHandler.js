import { JSONPath } from 'jsonpath-plus';

export function handleJSON(json, query) {   // Removed type annotations
  try {
    // Parse the JSON if it's a string
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    
    // Detect the type of query
    if (query.startsWith('$')) {
      // JSONPath query
      return JSONPath({ path: query, json: data });
    } else if (query.startsWith('Object.')) {
      // Object operation
      const operation = query.split('.')[1];
      switch (operation) {
        case 'keys':
          return Object.keys(data);
        case 'values':
          return Object.values(data);
        case 'entries':
          return Object.entries(data);
        default:
          throw new Error(`Unsupported Object operation: ${operation}`);
      }
    } else if (query.startsWith('Array.')) {
      // Array operation
      const [_, operation, ...args] = query.split('.');
      const arrayData = Array.isArray(data) ? data : Object.values(data);
      switch (operation) {
        case 'filter':
          return arrayData.filter(item => new Function('item', `return ${args.join('.')}`)(item));
        case 'map':
          return arrayData.map(item => new Function('item', `return ${args.join('.')}`)(item));
        case 'reduce':
          return arrayData.reduce((acc, item) => new Function('acc', 'item', `return ${args.join('.')}`)(acc, item));
        case 'sort':
          return [...arrayData].sort();
        case 'reverse':
          return [...arrayData].reverse();
        default:
          throw new Error(`Unsupported Array operation: ${operation}`);
      }
    } else if (query.startsWith('String.')) {
      // String operation
      const [_, operation, path] = query.split('.');
      const stringData = path ? JSONPath({ path, json: data })[0] : JSON.stringify(data);
      switch (operation) {
        case 'toLowerCase':
          return stringData.toLowerCase();
        case 'toUpperCase':
          return stringData.toUpperCase();
        case 'trim':
          return stringData.trim();
        default:
          throw new Error(`Unsupported String operation: ${operation}`);
      }
    } else {
      throw new Error(`Unsupported operation: ${query}`);
    }
  } catch (error) {
    console.error('Error processing JSON:', error);
    return { error: error.message };
  }
}