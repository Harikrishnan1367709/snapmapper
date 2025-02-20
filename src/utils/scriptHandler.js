
import { JsonPathEvaluator } from './jsonPathEvaluator';
import { snaplogicHelpers } from './snaplogicHelpers';

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

    // Handle direct variable access ($name or $MAST_UPL)
    if (script.startsWith('$') && !script.includes('.')) {
      const varName = script.substring(1);
      return this.data[varName];
    }

    // Handle chained function calls
    if (script.includes('.') && script.startsWith('$')) {
      return this.handleChainedCalls(script);
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
    // Extract path from jsonPath($, "$.name") format
    const match = script.match(/jsonPath\(\$,\s*["'](.+)["']\)/);
    if (!match) {
      throw new Error('Invalid JSONPath function format');
    }
    return this.jsonPathEvaluator.evaluate(match[1]);
  }

  handleChainedCalls(script) {
    // Remove initial $ and split by dots
    const parts = script.substring(1).split('.');
    let result = this.data[parts[0]];

    // Apply each function in the chain
    for (let i = 1; i < parts.length; i++) {
      const functionCall = parts[i];
      if (typeof result === 'string') {
        if (functionCall === 'toUpperCase()') {
          result = result.toUpperCase();
        } else if (functionCall === 'toLowerCase()') {
          result = result.toLowerCase();
        } else if (functionCall === 'trim()') {
          result = result.trim();
        }
      } else if (Array.isArray(result)) {
        // Handle array methods
        if (functionCall === 'length') {
          result = result.length;
        } else if (functionCall.startsWith('join')) {
          const separator = functionCall.match(/join\(['"](.*)["']\)/)?.[1] || ',';
          result = result.join(separator);
        }
      }
    }
    return result;
  }

  containsOperators(script) {
    const operators = ['+', '-', '*', '/', '>', '<', '==', '===', '!=', '!==', '&&', '||'];
    return operators.some(op => script.includes(op));
  }

  evaluateExpression(script) {
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
