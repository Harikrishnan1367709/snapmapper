import { JsonPathEvaluator } from './jsonPathEvaluator';
import { snaplogicHelpers } from './snaplogicHelpers';
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

export class ScriptHandler {
  constructor(data) {
    this.data = data;
    this.jsonPathEvaluator = new JsonPathEvaluator(data);
  }

  evaluate(script) {
    if (!script?.trim()) {
      return { message: "Enter an expression" };
    }

    try {
      return this.parseScript(script.trim());
    } catch (error) {
      throw new Error(`Script evaluation failed: ${error.message}`);
    }
  }

  parseScript(script) {
    // Handle direct JSONPath queries
    if (script.startsWith('jsonPath(')) {
      return this.handleJsonPathFunction(script);
    }

    // Handle direct variable access with path
    if (script.startsWith('$') && script.includes('.')) {
      return this.handleDirectPathAccess(script);
    }

    // Handle direct variable access ($name or $MAST_UPL)
    if (script.startsWith('$')) {
      const varName = script.substring(1);
      return this.data[varName];
    }

    // Handle date operations
    if (script.includes('Date.')) {
      return this.handleDateOperation(script);
    }

    // Handle operators and expressions
    if (this.containsOperators(script)) {
      return this.evaluateExpression(script);
    }

    // Handle array or object literals
    if (script.startsWith('[') || script.startsWith('{')) {
      return this.parseComplexLiteral(script);
    }

    // Handle primitive values
    return this.parsePrimitive(script);
  }

  handleJsonPathFunction(script) {
    try {
      // Extract path and handle array access
      const match = script.match(/jsonPath\(\$,\s*["'](.+?)["']\)(\[\d+\])?/);
      if (!match) {
        throw new Error('Invalid JSONPath function format');
      }

      let result = this.jsonPathEvaluator.evaluate(match[1]);
      
      // Handle array indexing if present
      if (match[2]) {
        const index = parseInt(match[2].slice(1, -1));
        result = result[index];
      }

      // Handle method chaining (e.g., .contains())
      if (script.includes('.contains(')) {
        const containsMatch = script.match(/\.contains\(['"](.+)['"]\)/);
        if (containsMatch) {
          return result.includes(containsMatch[1]);
        }
      }

      return result;
    } catch (error) {
      console.error('JSONPath evaluation error:', error);
      throw error;
    }
  }

  handleDirectPathAccess(script) {
    try {
      // Remove initial $ and handle array access
      const pathParts = script.substring(1).split('.');
      let result = this.data;

      for (const part of pathParts) {
        if (part.includes('[*]')) {
          // Handle wildcard array access
          const arrayName = part.split('[')[0];
          result = result[arrayName];
          if (Array.isArray(result)) {
            result = result.map(item => {
              const remainingPath = part.split(']')[1];
              return remainingPath ? this.traversePath(item, remainingPath.substring(1)) : item;
            });
          }
        } else if (part.match(/\[\d+\]/)) {
          // Handle specific array index
          const [arrayName, index] = part.split('[');
          result = result[arrayName][parseInt(index)];
        } else {
          result = result[part];
        }
      }

      return result;
    } catch (error) {
      console.error('Path access error:', error);
      throw error;
    }
  }

  traversePath(obj, path) {
    return path.split('.').reduce((curr, key) => curr?.[key], obj);
  }

  handleDateOperation(script) {
    // Replace Date.now() with actual implementation
    script = script.replace(/Date\.now\(\)/g, 'dayjs()');
    
    // Handle minusHours
    if (script.includes('minusHours')) {
      const match = script.match(/minusHours\((\d+)\)/);
      if (match) {
        const hours = parseInt(match[1]);
        return dayjs().subtract(hours, 'hour');
      }
    }

    // Handle toLocaleDateTimeString
    if (script.includes('toLocaleDateTimeString')) {
      const match = script.match(/toLocaleDateTimeString\('(.+?)'\)/);
      if (match) {
        const format = JSON.parse(match[1]).format;
        return dayjs().format(format);
      }
    }

    // Handle Date.parse
    if (script.startsWith('Date.parse')) {
      const match = script.match(/Date\.parse\((.+?)\)/);
      if (match) {
        const dateStr = this.evaluateExpression(match[1]);
        return dayjs(dateStr).valueOf();
      }
    }

    try {
      return eval(script);
    } catch (error) {
      console.error('Date operation error:', error);
      throw error;
    }
  }

  evaluateExpression(script) {
    // Replace date functions
    script = this.preprocessDateExpressions(script);

    // Replace $variables with their values
    const processedScript = script.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
      const value = this.data[varName];
      if (typeof value === 'string') return `"${value}"`;
      return JSON.stringify(value);
    });

    // Handle ternary operators
    if (processedScript.includes('?')) {
      const [condition, rest] = processedScript.split('?');
      const [trueCase, falseCase] = rest.split(':');
      return this.evaluateExpression(condition) 
        ? this.parseScript(trueCase.trim())
        : this.parseScript(falseCase.trim());
    }

    // Safely evaluate the expression
    try {
      return Function('"use strict";return (' + processedScript + ')')();
    } catch (error) {
      throw new Error(`Invalid expression: ${error.message}`);
    }
  }

  preprocessDateExpressions(script) {
    // Replace Date.now()
    script = script.replace(/Date\.now\(\)/g, 'new Date().getTime()');
    
    // Replace custom date format strings
    script = script.replace(/toLocaleDateTimeString\('(.+?)'\)/g, (match, format) => {
      const parsedFormat = JSON.parse(format);
      return `dayjs().format('${parsedFormat.format}')`; 
    });

    return script;
  }

  parseComplexLiteral(script) {
    try {
      // Handle arrays and objects
      if (script.startsWith('[') || script.startsWith('{')) {
        // Replace $variables with their actual values
        const processedScript = script.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
          return JSON.stringify(this.data[varName]);
        });
        return JSON.parse(processedScript);
      }
      return JSON.parse(script);
    } catch (error) {
      throw new Error(`Invalid array/object literal: ${error.message}`);
    }
  }

  parsePrimitive(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    if (!isNaN(Number(value))) return Number(value);
    if (value.startsWith('"') || value.startsWith("'")) {
      return value.slice(1, -1);
    }
    return value;
  }
}
