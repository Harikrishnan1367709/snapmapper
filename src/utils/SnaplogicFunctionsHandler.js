export class SnaplogicFunctionsHandler {
  constructor(data) {
    this.data = data;
  }

  evaluateOperatorExpression(expr) {
    try {
      // Handle date comparisons with Date.parse and Date.now()
      let modifiedExpr = expr.replace(/Date\.parse\(\$([^\)]+)\)/g, (match, key) => {
        const value = this.data[key];
        return value ? `Date.parse('${value}')` : 'null';
      });

      // Replace Date.now() with actual timestamp
      modifiedExpr = modifiedExpr.replace(/Date\.now\(\)/g, Date.now().toString());

      // Replace variables with their actual values, handling string values properly
      modifiedExpr = modifiedExpr.replace(/\$([a-zA-Z0-9_]+)/g, (match, key) => {
        const value = this.data[key];
        if (value === undefined || value === null) return 'null';
        return typeof value === 'string' ? `"${value}"` : value;
      });

      // Safely evaluate the expression
      return new Function(`return ${modifiedExpr}`)();
    } catch (error) {
      console.error('Error evaluating expression:', error, expr);
      return false;
    }
  }

  evaluateExpression(expr) {
    if (typeof expr === 'string' && expr.startsWith('$')) {
      return this.data[expr.substring(1)];
    }
    return expr;
  }

  handleFunction(name, args) {
    const evaluatedArgs = args.map(arg => this.evaluateExpression(arg));

    switch (name.toLowerCase()) {
      case 'contains':
        return String(evaluatedArgs[0]).includes(String(evaluatedArgs[1]));
      case 'startswith':
        return String(evaluatedArgs[0]).startsWith(String(evaluatedArgs[1]));
      case 'endswith':
        return String(evaluatedArgs[0]).endsWith(String(evaluatedArgs[1]));
      case 'length':
        return String(evaluatedArgs[0]).length;
      case 'tolower':
        return String(evaluatedArgs[0]).toLowerCase();
      case 'toupper':
        return String(evaluatedArgs[0]).toUpperCase();
      case 'trim':
        return String(evaluatedArgs[0]).trim();
      default:
        throw new Error(`Unknown function: ${name}`);
    }
  }
}

export default SnaplogicFunctionsHandler;
