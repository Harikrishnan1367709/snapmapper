
// Change the export to use default
export default class SnaplogicFunctionsHandler {
  constructor(data) {
    this.data = data;
  }

  executeScript(script, inputData) {
    // Update the data with the new input
    this.data = inputData;

    // Handle empty script
    if (!script || script.trim() === '') {
      return null;
    }

    try {
      // Handle different script types
      if (script.startsWith('$')) {
        return this.evaluateExpression(script);
      } else {
        // For future extension of other script types
        return this.evaluateExpression(script);
      }
    } catch (error) {
      console.error('Script execution error:', error);
      throw new Error(`Script execution failed: ${error.message}`);
    }
  }

  evaluateOperatorExpression(expr) {
    // Handle date comparisons with Date.parse and Date.now()
    expr = expr.replace(/Date\.parse\(\$([^\)]+)\)/g, (match, key) => {
      const value = this.data[key];
      return value ? `Date.parse('${value}')` : 'null';
    });

    expr = expr.replace(/Date\.now\(\)/g, Date.now());

    // Handle normal variable substitution
    expr = expr.replace(/\$([a-zA-Z0-9_]+)/g, (match, key) => {
      const value = this.data[key];
      if (typeof value === 'string') {
        return `"${value}"`;
      }
      return value !== undefined ? value : 'null';
    });

    try {
      // Safely evaluate the expression
      const result = new Function(`return ${expr}`)();
      return result;
    } catch (error) {
      console.error('Error evaluating expression:', error);
      return false;
    }
  }

  evaluateExpression(expr) {
    // Handle different types of expressions
    if (expr.includes('&&') || expr.includes('||') || 
        expr.includes('<=') || expr.includes('>=') || 
        expr.includes('==') || expr.includes('!=') ||
        expr.includes('<') || expr.includes('>') ||
        expr.includes('Date.parse') || expr.includes('Date.now')) {
      return this.evaluateOperatorExpression(expr);
    }

    // Keep existing single value expression handling
    const value = expr.startsWith('$') ? this.data[expr.substring(1)] : expr;
    return value !== undefined ? value : null;
  }

  handleJSON(json, query) {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      
      if (query.startsWith('$')) {
        return this.evaluateExpression(query);
      } else if (query.startsWith('Object.')) {
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
        const [_, operation, ...args] = query.split('.');
        const arrayData = Array.isArray(data) ? data : Object.values(data);
        switch (operation) {
          case 'filter':
            return arrayData.filter(item => this.evaluateExpression(args.join('.')));
          case 'map':
            return arrayData.map(item => this.evaluateExpression(args.join('.')));
          case 'reduce':
            return arrayData.reduce((acc, item) => this.evaluateExpression(args.join('.')));
          case 'sort':
            return [...arrayData].sort();
          case 'reverse':
            return [...arrayData].reverse();
          default:
            throw new Error(`Unsupported Array operation: ${operation}`);
        }
      } else {
        throw new Error(`Unsupported operation: ${query}`);
      }
    } catch (error) {
      console.error('Error processing JSON:', error);
      return { error: error.message };
    }
  }
}
