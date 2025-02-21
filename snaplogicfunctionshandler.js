import { JSONPath } from 'jsonpath-plus';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Configure dayjs plugins
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

class SnaplogicFunctionsHandler {
  constructor() {
    this.jsonPathEvaluator = null;
    this.data = null;
    this.operatorPrecedence = {
      '||': 1,
      '&&': 2,
      '==': 3,
      '===': 3,
      '!=': 3,
      '!==': 3,
      '<': 4,
      '>': 4,
      '<=': 4,
      '>=': 4,
      '+': 5,
      '-': 5,
      '*': 6,
      '/': 6
    };
  }

  setData(data) {
    this.data = data;
    this.jsonPathEvaluator = {
      evaluate: (path) => {
        try {
          if (!this.data) {
            console.warn('No data provided for JSONPath evaluation.');
            return null;
          }
          const result = JSONPath({ path: path, json: this.data, wrap: false });
          return result;
        } catch (error) {
          console.error('JSONPath evaluation error:', error);
          return null;
        }
      }
    };
  }

  handleJSONPath(path, data) {
    try {
      if (!data) {
        console.warn('No data provided for JSONPath evaluation.');
        return null;
      }
      const result = JSONPath({ path: path, json: data, wrap: false });
      if (Array.isArray(result) && result.length === 0) {
        return null;
      }
      return result && result.length === 1 ? result[0] : result;
    } catch (error) {
      console.error('JSONPath evaluation error:', error);
      return null;
    }
  }

  evaluateValue(value) {
    if (!value) return value;
    value = value.trim();

    if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }

    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (!isNaN(value)) return Number(value);

    if (this.data && this.data.hasOwnProperty(value)) {
      return this.data[value];
    }

    return value;
  }

  formatDate(date, format) {
    const formatters = {
      'yyyy': d => d.getFullYear(),
      'MM': d => String(d.getMonth() + 1).padStart(2, '0'),
      'dd': d => String(d.getDate()).padStart(2, '0'),
      'HH': d => String(d.getHours()).padStart(2, '0'),
      'mm': d => String(d.getMinutes()).padStart(2, '0'),
      'ss': d => String(d.getSeconds()).padStart(2, '0')
    };

    return Object.entries(formatters).reduce((result, [pattern, formatter]) => {
      return result.replace(pattern, formatter(date));
    }, format);
  }

  evaluateExpression(expression) {
    try {
      if (!expression?.trim()) {
        return { message: "Enter an expression" };
      }
      return this.evaluateOperatorExpression(expression, this.data);
    } catch (error) {
      throw new Error(`Script evaluation failed: ${error.message}`);
    }
  }

  evaluateOperatorExpression(expression, data) {
    try {
      // 1. First normalize and tokenize the expression
      let normalizedExpression = expression.trim();

      // 2. Handle JSONPath with functions
      normalizedExpression = this.handleJSONPathExpressions(normalizedExpression, data);

      // 3. Handle Date functions
      normalizedExpression = this.handleDateExpressions(normalizedExpression);

      // 4. Handle ternary operator separately
      if (normalizedExpression.includes('?')) {
        return this.evaluateTernary(normalizedExpression, data);
      }

      // 5. Convert to postfix and evaluate
      const tokens = this.tokenize(normalizedExpression);
      const postfix = this.infixToPostfix(tokens);
      return this.evaluatePostfix(postfix, data);

    } catch (error) {
      console.error('Expression evaluation error:', error);
      throw new Error(`Failed to evaluate: ${expression}`);
    }
  }

  handleJSONPathExpressions(expression, data) {
    // Handle complex JSONPath expressions with string functions and concatenation
    const jsonPathRegex = /(\$[\w.[\]]+(?:\.(?:toUpperCase|toLowerCase)\(\))?)/g;
    return expression.replace(jsonPathRegex, (match) => {
      try {
        // Extract the base path and function
        const hasUpperCase = match.endsWith('.toUpperCase()');
        const hasLowerCase = match.endsWith('.toLowerCase()');
        const basePath = match.split('.to')[0];

        // Get the value using JSONPath
        let value = this.handleJSONPath(basePath, data);

        // Apply string functions if present
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

  handleDateExpressions(expression) {
    const dateRegex = /Date\.(now|parse)\(([^)]*)\)(?:\.(\w+)\([^)]*\))?/g;
    return expression.replace(dateRegex, (match, method, args, chainedMethod) => {
      try {
        let date = method === 'now' ? new Date() : new Date(this.evaluateValue(args));
        
        if (chainedMethod) {
          const methodMatch = match.match(/\.(\w+)\(([^)]*)\)/);
          if (methodMatch) {
            const [, methodName, methodArgs] = methodMatch;
            switch(methodName) {
              case 'minusHours':
                const hours = parseInt(methodArgs);
                date.setHours(date.getHours() - hours);
                break;
              case 'toLocaleDateTimeString':
                const format = JSON.parse(methodArgs).format;
                return `"${this.formatDate(date, format)}"`;
            }
          }
        }
        
        return date.getTime();
      } catch (e) {
        console.error("Date operation error:", e);
        return match;
      }
    });
  }

  tokenize(expression) {
    const operators = Object.keys(this.operatorPrecedence);
    let tokens = [];
    let current = '';
    
    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];
      
      // Handle string literals with spaces
      if (char === '"' || char === "'") {
        if (current) {
          tokens.push(current);
          current = '';
        }
        let j = i + 1;
        let stringLiteral = char;
        while (j < expression.length) {
          stringLiteral += expression[j];
          if (expression[j] === char && expression[j-1] !== '\\') break;
          j++;
        }
        tokens.push(stringLiteral);
        i = j;
        continue;
      }

      // Handle operators
      const op = operators.find(op => expression.substring(i).startsWith(op));
      if (op) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(op);
        i += op.length - 1;
        continue;
      }

      // Handle spaces
      if (char === ' ') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current) tokens.push(current);
    return tokens;
  }

  infixToPostfix(tokens) {
    const output = [];
    const operatorStack = [];

    tokens.forEach(token => {
      if (this.isOperator(token)) {
        while (
          operatorStack.length > 0 && 
          this.operatorPrecedence[operatorStack[operatorStack.length - 1]] >= 
          this.operatorPrecedence[token]
        ) {
          output.push(operatorStack.pop());
        }
        operatorStack.push(token);
      } else {
        output.push(token);
      }
    });

    while (operatorStack.length > 0) {
      output.push(operatorStack.pop());
    }

    return output;
  }

  evaluatePostfix(tokens, data) {
    const stack = [];

    tokens.forEach(token => {
      if (this.isOperator(token)) {
        const right = stack.pop();
        const left = stack.pop();
        stack.push(this.applyOperator(left, token, right));
      } else {
        stack.push(this.evaluateValue(token));
      }
    });

    return stack[0];
  }

  evaluateTernary(expression, data) {
    const [condition, rest] = expression.split('?').map(p => p.trim());
    const [truePart, falsePart] = rest.split(':').map(p => p.trim());
    
    const conditionResult = this.evaluateOperatorExpression(condition, data);
    return conditionResult ? 
      this.evaluateOperatorExpression(truePart, data) : 
      this.evaluateOperatorExpression(falsePart, data);
  }

  isOperator(token) {
    return this.operatorPrecedence.hasOwnProperty(token);
  }

  applyOperator(left, operator, right) {
    switch(operator) {
      case '+': return this.add(left, right);
      case '-': return Number(left) - Number(right);
      case '*': return Number(left) * Number(right);
      case '/': 
        if (Number(right) === 0) throw new Error('Division by zero');
        return Number(left) / Number(right);
      case '==': return left == right;
      case '===': return left === right;
      case '!=': return left != right;
      case '!==': return left !== right;
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '&&': return left && right;
      case '||': return left || right;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  add(a, b) {
    // Remove quotes from string literals
    const unquote = (val) => {
      if (typeof val === 'string' && (val.startsWith('"') || val.startsWith("'"))) {
        return val.slice(1, -1);
      }
      return val;
    };

    a = unquote(a);
    b = unquote(b);

    // Handle string concatenation
    if (typeof a === 'string' || typeof b === 'string') {
      return String(a) + String(b);
    }
    
    return Number(a) + Number(b);
  }

  evaluateValue(value) {
    if (!value) return value;
    value = value.trim();
    
    // Handle string literals
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value; // Keep quotes for string literals
    }
    
    // Handle other types
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (!isNaN(value)) return Number(value);
    
    return value;
  }

  formatDate(date, format) {
    const formatters = {
      'yyyy': d => d.getFullYear(),
      'MM': d => String(d.getMonth() + 1).padStart(2, '0'),
      'dd': d => String(d.getDate()).padStart(2, '0'),
      'HH': d => String(d.getHours()).padStart(2, '0'),
      'mm': d => String(d.getMinutes()).padStart(2, '0'),
      'ss': d => String(d.getSeconds()).padStart(2, '0')
    };

    return Object.entries(formatters).reduce((result, [pattern, formatter]) => {
      return result.replace(pattern, formatter(date));
    }, format);
  }
}

export default SnaplogicFunctionsHandler;
