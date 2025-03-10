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
    // Handle JSONPath expressions
    if (script.startsWith('$.')) {
      return this.jsonPathEvaluator.evaluate(script);
    }

    // Handle helper function calls
    if (script.startsWith('$')) {
      return this.evaluateHelper(script);
    }

    // Handle object literals
    if (script.startsWith('{')) {
      return this.parseObject(script);
    }

    // Handle array literals
    if (script.startsWith('[')) {
      return this.parseArray(script);
    }

    // Handle primitive values
    return this.parsePrimitive(script);
  }

  evaluateHelper(expr) {
    const match = expr.match(/\$(\w+)\.(\w+)\((.*)\)/s);
    if (!match) {
      throw new Error(`Invalid helper expression: ${expr}`);
    }

    const [, category, method, argsString] = match;
    const helper = snaplogicHelpers[category]?.[method];
    
    if (!helper) {
      throw new Error(`Unknown helper method: ${category}.${method}`);
    }

    const args = this.parseArguments(argsString);
    return helper(...args);
  }

  parseArguments(argsString) {
    if (!argsString.trim()) return [];

    const args = [];
    let currentArg = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];

      if ((char === '"' || char === "'") && argsString[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (!inString) {
        if (char === '{' || char === '[') depth++;
        if (char === '}' || char === ']') depth--;
      }

      if (char === ',' && depth === 0 && !inString) {
        args.push(this.parseScript(currentArg.trim()));
        currentArg = '';
        continue;
      }

      currentArg += char;
    }

    if (currentArg.trim()) {
      args.push(this.parseScript(currentArg.trim()));
    }

    return args;
  }

  parseObject(script) {
    const content = script.slice(1, -1).trim();
    if (!content) return {};

    const result = {};
    let currentKey = '';
    let currentValue = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';
    let collectingKey = true;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if ((char === '"' || char === "'") && content[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (!inString) {
        if (char === '{' || char === '[') depth++;
        if (char === '}' || char === ']') depth--;
      }

      if (char === ':' && depth === 0 && !inString && collectingKey) {
        collectingKey = false;
        continue;
      }

      if (char === ',' && depth === 0 && !inString) {
        result[currentKey.trim()] = this.parseScript(currentValue.trim());
        currentKey = '';
        currentValue = '';
        collectingKey = true;
        continue;
      }

      if (collectingKey) {
        currentKey += char;
      } else {
        currentValue += char;
      }
    }

    if (currentKey) {
      result[currentKey.trim()] = this.parseScript(currentValue.trim());
    }

    return result;
  }

  parseArray(script) {
    const content = script.slice(1, -1).trim();
    if (!content) return [];

    const result = [];
    let currentValue = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if ((char === '"' || char === "'") && content[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (!inString) {
        if (char === '{' || char === '[') depth++;
        if (char === '}' || char === ']') depth--;
      }

      if (char === ',' && depth === 0 && !inString) {
        result.push(this.parseScript(currentValue.trim()));
        currentValue = '';
        continue;
      }

      currentValue += char;
    }

    if (currentValue.trim()) {
      result.push(this.parseScript(currentValue.trim()));
    }

    return result;
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