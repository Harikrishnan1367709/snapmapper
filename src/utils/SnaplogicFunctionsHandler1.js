import _ from 'lodash';
import moment from 'moment';
import { JSONPath } from 'jsonpath-plus';

class SnapLogicFunctionsHandler {
  constructor() {
    this.operators = {
      '===': (a, b) => a === b,
      '!==': (a, b) => a !== b,
      '==': (a, b) => a == b,
      '!=': (a, b) => a != b,
      '>=': (a, b) => a >= b,
      '<=': (a, b) => a <= b,
      '>': (a, b) => a > b,
      '<': (a, b) => a < b,
      '+': (a, b) => a + b,
      '-': (a, b) => a - b,
      '*': (a, b) => a * b,
      '/': (a, b) => a / b,
      '%': (a, b) => a % b,
      '&&': (a, b) => a && b,
      '||': (a, b) => a || b
    };

    this.functionRegistry = {
      string: this.createStringFunctions(),
      number: this.createNumberFunctions(),
      array: this.createArrayFunctions(),
      object: this.createObjectFunctions(),
      date: this.createDateFunctions()
    };
  }

  execute(script, data) {
    try {
      // Handle null/undefined
      if (script === null || script === undefined) {
        return null;
      }

      // Handle direct values (numbers, booleans)
      if (typeof script !== 'string' && typeof script !== 'object') {
        return script;
      }

      // Handle direct JSONPath calls
      if (this.isJSONPathCall(script)) {
        return this.executeJSONPath(script, data);
      }

      // Handle mapper scripts (objects)
      if (this.isMapperScript(script)) {
        return this.executeMapper(script, data);
      }

      // Handle array inputs
      if (Array.isArray(script)) {
        return script.map(item => this.execute(item, data));
      }

      // Handle string scripts
      if (typeof script === 'string') {
        return this.executeScript(script, data);
      }

      return script;
    } catch (error) {
      console.error('Execution error:', error);
      throw new Error(`Script execution failed: ${error.message}`);
    }
  }

  executeScript(script, data) {
    script = script.trim();

    // Handle empty strings
    if (!script) {
      return '';
    }

    // Handle direct data references
    if (script === '$') {
      return data;
    }

    // Handle ternary operations
    if (this.isTernary(script)) {
      return this.evaluateTernary(script, data);
    }

    // Handle operators
    if (this.hasOperators(script)) {
      return this.evaluateOperators(script, data);
    }

    // Handle function chains
    if (this.isFunctionChain(script)) {
      return this.evaluateFunctionChain(script, data);
    }

    // Handle simple JSONPath
    if (script.startsWith('$')) {
      return this.evaluateJSONPath(script, data);
    }

    // Return literal values
    return this.evaluateArgument(script, data);
  }

  executeMapper(script, data) {
    // Handle array data with mapper
    if (Array.isArray(data)) {
      return data.map(item => this.mapObject(script, item));
    }
    return this.mapObject(script, data);
  }

  tokenizeChain(chain) {
    const tokens = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < chain.length; i++) {
      const char = chain[i];

      // Handle strings
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        stringChar = char;
        current += char;
        continue;
      }
      if (char === stringChar && chain[i - 1] !== '\\' && inString) {
        inString = false;
        current += char;
        continue;
      }
      if (inString) {
        current += char;
        continue;
      }

      // Handle parentheses
      if (char === '(') {
        depth++;
        current += char;
        continue;
      }
      if (char === ')') {
        depth--;
        current += char;
        continue;
      }

      // Handle dot separator
      if (char === '.' && depth === 0) {
        if (current) tokens.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    if (current) tokens.push(current.trim());
    return tokens;
  }

  mapObject(script, data) {
    const result = {};
    
    for (const [key, value] of Object.entries(script)) {
      try {
        if (this.isMapperScript(value)) {
          result[key] = this.executeMapper(value, data);
        } else if (Array.isArray(value)) {
          result[key] = value.map(item => this.execute(item, data));
        } else {
          result[key] = this.execute(value, data);
        }
      } catch (error) {
        console.error(`Error mapping key "${key}":`, error);
        result[key] = null;
      }
    }
    
    return result;
  }
  createStringFunctions() {
    return {
      // Basic String Operations
      toLowerCase: (str) => str.toLowerCase(),
      toUpperCase: (str) => str.toUpperCase(),
      trim: (str) => str.trim(),
      trimStart: (str) => str.trimStart(),
      trimEnd: (str) => str.trimEnd(),
      
      // String Manipulation
      substring: (str, start, end) => str.substring(start, end),
      substr: (str, start, length) => str.substr(start, length),
      slice: (str, start, end) => str.slice(start, end),
      replace: (str, searchValue, replaceValue) => str.replace(searchValue, replaceValue),
      replaceAll: (str, searchValue, replaceValue) => str.replaceAll(searchValue, replaceValue),
      
      // String Analysis
      length: (str) => str.length,
      charAt: (str, index) => str.charAt(index),
      charCodeAt: (str, index) => str.charCodeAt(index),
      indexOf: (str, searchValue, fromIndex) => str.indexOf(searchValue, fromIndex),
      lastIndexOf: (str, searchValue, fromIndex) => str.lastIndexOf(searchValue, fromIndex),
      
      // String Splitting and Joining
      split: (str, separator, limit) => str.split(separator, limit),
      concat: (str, ...args) => str.concat(...args),
      padStart: (str, targetLength, padString) => str.padStart(targetLength, padString),
      padEnd: (str, targetLength, padString) => str.padEnd(targetLength, padString),
      
      // String Testing
      includes: (str, searchString, position) => str.includes(searchString, position),
      startsWith: (str, searchString, position) => str.startsWith(searchString, position),
      endsWith: (str, searchString, length) => str.endsWith(searchString, length),
      match: (str, regexp) => str.match(regexp),
      search: (str, regexp) => str.search(regexp),
      
      // Case Transformations
      capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
      camelCase: (str) => _.camelCase(str),
      kebabCase: (str) => _.kebabCase(str),
      snakeCase: (str) => _.snakeCase(str),
      
      // Additional String Utilities
      repeat: (str, count) => str.repeat(count),
      reverse: (str) => str.split('').reverse().join(''),
      truncate: (str, length, ending = '...') => {
        if (str.length > length) {
          return str.substring(0, length - ending.length) + ending;
        }
        return str;
      }
    };
  }

  createNumberFunctions() {
    return {
      // Basic Number Operations
      toString: (num, radix) => num.toString(radix),
      toFixed: (num, digits) => num.toFixed(digits),
      toPrecision: (num, precision) => num.toPrecision(precision),
      toExponential: (num, fractionDigits) => num.toExponential(fractionDigits),
      
      // Math Operations
      abs: (num) => Math.abs(num),
      ceil: (num) => Math.ceil(num),
      floor: (num) => Math.floor(num),
      round: (num) => Math.round(num),
      trunc: (num) => Math.trunc(num),
      
      // Advanced Math Operations
      pow: (num, exp) => Math.pow(num, exp),
      sqrt: (num) => Math.sqrt(num),
      cbrt: (num) => Math.cbrt(num),
      
      // Number Validation
      isInteger: (num) => Number.isInteger(num),
      isFinite: (num) => Number.isFinite(num),
      isNaN: (num) => Number.isNaN(num),
      
      // Number Formatting
      format: (num, locale = 'en-US', options = {}) => {
        return new Intl.NumberFormat(locale, options).format(num);
      },
      
      // Currency Formatting
      toCurrency: (num, currency = 'USD', locale = 'en-US') => {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency
        }).format(num);
      },
      
      // Percentage
      toPercentage: (num, decimals = 2) => `${(num * 100).toFixed(decimals)}%`,
      fromPercentage: (str) => parseFloat(str) / 100,
      
      // Range Operations
      clamp: (num, min, max) => Math.min(Math.max(num, min), max),
      inRange: (num, start, end) => num >= start && num < end
    };
  }

  createArrayFunctions() {
    return {
      // Basic Array Operations
      length: (arr) => arr.length,
      toString: (arr) => arr.toString(),
      join: (arr, separator) => arr.join(separator),
      concat: (arr, ...items) => arr.concat(...items),
      slice: (arr, start, end) => arr.slice(start, end),
      
      // Array Modification
      reverse: (arr) => [...arr].reverse(),
      sort: (arr, compareFunction) => {
        if (typeof compareFunction === 'string') {
          const fn = new Function('a', 'b', `return ${compareFunction}`);
          return [...arr].sort((a, b) => fn(a, b));
        }
        return [...arr].sort(compareFunction);
      },
      
      // Array Search
      indexOf: (arr, element) => arr.indexOf(element),
      lastIndexOf: (arr, element) => arr.lastIndexOf(element),
      includes: (arr, element) => arr.includes(element),
      find: (arr, predicate) => {
        if (typeof predicate === 'string') {
          const fn = new Function('x', `return ${predicate}`);
          return arr.find(x => fn(x));
        }
        return arr.find(predicate);
      },
      
      // Array Transformation
      map: (arr, mapper) => {
        if (typeof mapper === 'string') {
          // Handle property access like 'price'
          if (!mapper.includes('(') && !mapper.includes(' ')) {
            return arr.map(item => item[mapper]);
          }
          // Handle complex expressions
          return arr.map(item => {
            const script = mapper.replace(/\$(\w+)/g, (_, key) => {
              return JSON.stringify(item[key]);
            });
            return this.execute(script, item);
          });
        }
        return arr.map(mapper);
      },

      filter: (arr, predicate) => {
        if (typeof predicate === 'string') {
          return arr.filter(item => {
            const script = predicate.replace(/\$(\w+)/g, (_, key) => {
              return JSON.stringify(item[key]);
            });
            return this.execute(script, item);
          });
        }
        return arr.filter(predicate);
      },

      // Array Reduction
      reduce: (arr, reducer, initialValue) => {
        if (typeof reducer === 'string') {
          return arr.reduce((acc, curr) => {
            const script = reducer.replace(/\$acc/g, JSON.stringify(acc))
                                .replace(/\$curr/g, JSON.stringify(curr));
            return this.execute(script, { acc, curr });
          }, initialValue);
        }
        return arr.reduce(reducer, initialValue);
      },

      // Array Statistics
      sum: (arr) => arr.reduce((a, b) => a + b, 0),
      average: (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
      min: (arr) => Math.min(...arr),
      max: (arr) => Math.max(...arr),
      
      // Array Utilities
      unique: (arr) => [...new Set(arr)],
      flatten: (arr) => arr.flat(),
      flattenDeep: (arr) => arr.flat(Infinity),
      chunk: (arr, size) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return chunks;
      },

      
      // Set Operations
      union: (arr1, arr2) => [...new Set([...arr1, ...arr2])],
      intersection: (arr1, arr2) => arr1.filter(x => arr2.includes(x)),
      difference: (arr1, arr2) => arr1.filter(x => !arr2.includes(x))
    };
  }
  createObjectFunctions() {
    return {
      // Basic Object Operations
      keys: (obj) => Object.keys(obj),
      values: (obj) => Object.values(obj),
      entries: (obj) => Object.entries(obj),
      fromEntries: (entries) => Object.fromEntries(entries),
      assign: (target, ...sources) => Object.assign({}, target, ...sources),
      
      // Property Operations
      get: (obj, path, defaultValue) => _.get(obj, path, defaultValue),
      set: (obj, path, value) => {
        const newObj = _.cloneDeep(obj);
        _.set(newObj, path, value);
        return newObj;
      },
      has: (obj, path) => _.has(obj, path),
      unset: (obj, path) => {
        const newObj = _.cloneDeep(obj);
        _.unset(newObj, path);
        return newObj;
      },
      
      // Object Transformation
      mapKeys: (obj, iteratee) => {
        if (typeof iteratee === 'string') {
          const fn = new Function('key', 'value', `return ${iteratee}`);
          return _.mapKeys(obj, (value, key) => fn(key, value));
        }
        return _.mapKeys(obj, iteratee);
      },
      mapValues: (obj, iteratee) => {
        if (typeof iteratee === 'string') {
          const fn = new Function('value', 'key', `return ${iteratee}`);
          return _.mapValues(obj, (value, key) => fn(value, key));
        }
        return _.mapValues(obj, iteratee);
      },
      
      // Object Manipulation
      pick: (obj, paths) => _.pick(obj, paths),
      omit: (obj, paths) => _.omit(obj, paths),
      merge: (obj, ...sources) => _.merge({}, obj, ...sources),
      defaults: (obj, ...sources) => _.defaults({}, obj, ...sources),
      
      // Object Analysis
      size: (obj) => _.size(obj),
      isEmpty: (obj) => _.isEmpty(obj),
      isEqual: (value, other) => _.isEqual(value, other),
      
      // Type Checking
      isObject: (value) => _.isObject(value),
      isArray: (value) => Array.isArray(value),
      isString: (value) => typeof value === 'string',
      isNumber: (value) => typeof value === 'number',
      isBoolean: (value) => typeof value === 'boolean',
      isNull: (value) => value === null,
      isUndefined: (value) => value === undefined
    };
  }

  createDateFunctions() {
    return {
      // Basic Date Operations
      now: () => new Date(),
      parse: (dateStr) => new Date(dateStr),
      toString: (date) => date.toString(),
      toISOString: (date) => date.toISOString(),
      toUTCString: (date) => date.toUTCString(),
      
      // Date Formatting
      format: (date, format) => moment(date).format(format),
      formatLocale: (date, format, locale) => moment(date).locale(locale).format(format),
      
      // Date Components
      getYear: (date) => date.getFullYear(),
      getMonth: (date) => date.getMonth(),
      getDate: (date) => date.getDate(),
      getDay: (date) => date.getDay(),
      getHours: (date) => date.getHours(),
      getMinutes: (date) => date.getMinutes(),
      getSeconds: (date) => date.getSeconds(),
      
      // Date Manipulation
      add: (date, amount, unit) => moment(date).add(amount, unit).toDate(),
      subtract: (date, amount, unit) => moment(date).subtract(amount, unit).toDate(),
      startOf: (date, unit) => moment(date).startOf(unit).toDate(),
      endOf: (date, unit) => moment(date).endOf(unit).toDate(),
      
      // Date Comparison
      isBefore: (date1, date2) => moment(date1).isBefore(date2),
      isAfter: (date1, date2) => moment(date1).isAfter(date2),
      isSame: (date1, date2, unit) => moment(date1).isSame(date2, unit),
      diff: (date1, date2, unit) => moment(date1).diff(date2, unit),
      
      // Date Validation
      isValid: (date) => moment(date).isValid(),
      isWeekend: (date) => {
        const day = moment(date).day();
        return day === 0 || day === 6;
      },
      
      // Date Utilities
      daysInMonth: (date) => moment(date).daysInMonth(),
      quarter: (date) => moment(date).quarter(),
      week: (date) => moment(date).week(),
      dayOfYear: (date) => moment(date).dayOfYear(),
      
      // Relative Time
      fromNow: (date) => moment(date).fromNow(),
      toNow: (date) => moment(date).toNow(),
      calendar: (date) => moment(date).calendar()
    };
  }

  evaluateFunctionChain(script, data) {
    // Remove $ prefix if exists
    const chain = script.startsWith('$') ? script.slice(1) : script;
    const parts = this.tokenizeChain(chain);
    
    // Get initial value
    let result = this.resolveInitialValue(parts[0], data);
    
    // Execute each function in the chain
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (this.isFunction(part)) {
        result = this.executeFunction(result, part, data);
      } else {
        result = result[part];
      }
    }

    return result;
  }

  executeFunction(value, functionExpr, data) {
    const match = functionExpr.match(/(\w+)\((.*)\)/);
    if (!match) throw new Error(`Invalid function expression: ${functionExpr}`);

    const [, name, argsStr] = match;
    const args = this.parseArguments(argsStr, data);
    
    const type = this.getValueType(value);
    const func = this.functionRegistry[type]?.[name];

    if (!func) throw new Error(`Function not found: ${name} for type ${type}`);
    
    return func(value, ...args);
  }

  parseArguments(argsStr, data) {
    if (!argsStr.trim()) return [];

    const args = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];

      // Handle strings
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && argsStr[i - 1] !== '\\') {
        inString = false;
      }

      // Handle nested parentheses
      if (!inString) {
        if (char === '(') depth++;
        if (char === ')') depth--;
        if (char === ',' && depth === 0) {
          args.push(this.evaluateArgument(current.trim(), data));
          current = '';
          continue;
        }
      }

      current += char;
    }

    if (current.trim()) {
      args.push(this.evaluateArgument(current.trim(), data));
    }

    return args;
  }
  evaluateArgument(arg, data) {
    // Handle string literals
    if ((arg.startsWith('"') && arg.endsWith('"')) || 
        (arg.startsWith("'") && arg.endsWith("'"))) {
      return arg.slice(1, -1);
    }

    // Handle numbers
    if (!isNaN(arg)) {
      return Number(arg);
    }

    // Handle boolean values
    if (arg === 'true') return true;
    if (arg === 'false') return false;
    if (arg === 'null') return null;
    if (arg === 'undefined') return undefined;

    // Handle arrays
    if (arg.startsWith('[') && arg.endsWith(']')) {
      try {
        return JSON.parse(arg);
      } catch {
        return arg;
      }
    }

    // Handle objects
    if (arg.startsWith('{') && arg.endsWith('}')) {
      try {
        return JSON.parse(arg);
      } catch {
        return arg;
      }
    }

    // Handle variables/expressions
    if (arg.startsWith('$')) {
      return this.execute(arg, data);
    }

    return arg;
  }

  evaluateOperators(script, data) {
    const tokens = this.tokenizeExpression(script);
    return this.evaluateTokens(tokens, data);
  }

  tokenizeExpression(expr) {
    const tokens = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    const operators = Object.keys(this.operators)
      .sort((a, b) => b.length - a.length);
    
    const isOperator = (str) => operators.some(op => str.startsWith(op));

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];

      // Handle strings
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        stringChar = char;
        current += char;
        continue;
      }
      if (char === stringChar && expr[i - 1] !== '\\' && inString) {
        inString = false;
        current += char;
        continue;
      }
      if (inString) {
        current += char;
        continue;
      }

      // Handle parentheses
      if (char === '(') depth++;
      if (char === ')') depth--;

      // Check for operators
      if (depth === 0) {
        const remainingExpr = expr.slice(i);
        const foundOperator = operators.find(op => remainingExpr.startsWith(op));

        if (foundOperator) {
          if (current.trim()) tokens.push(current.trim());
          tokens.push(foundOperator);
          current = '';
          i += foundOperator.length - 1;
          continue;
        }
      }

      current += char;
    }

    if (current.trim()) tokens.push(current.trim());
    return tokens;
  }

  evaluateTokens(tokens, data) {
    // Handle operator precedence
    const precedence = {
      '*': 7, '/': 7, '%': 7,
      '+': 6, '-': 6,
      '>': 5, '<': 5, '>=': 5, '<=': 5,
      '==': 4, '!=': 4, '===': 4, '!==': 4,
      '&&': 3,
      '||': 2
    };

    // Convert to postfix notation (Shunting Yard Algorithm)
    const output = [];
    const operatorStack = [];

    for (const token of tokens) {
      if (token in this.operators) {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] in this.operators &&
          precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
        ) {
          output.push(operatorStack.pop());
        }
        operatorStack.push(token);
      } else {
        output.push(token);
      }
    }

    while (operatorStack.length > 0) {
      output.push(operatorStack.pop());
    }

    // Evaluate postfix expression
    const evalStack = [];
    for (const token of output) {
      if (token in this.operators) {
        const b = this.execute(evalStack.pop(), data);
        const a = this.execute(evalStack.pop(), data);
        evalStack.push(this.operators[token](a, b));
      } else {
        evalStack.push(token);
      }
    }

    return evalStack[0];
  }

  evaluateTernary(script, data) {
    const [condition, rest] = script.split('?').map(s => s.trim());
    const [trueExpr, falseExpr] = rest.split(':').map(s => s.trim());

    const conditionResult = this.execute(condition, data);
    return conditionResult ? 
      this.execute(trueExpr, data) : 
      this.execute(falseExpr, data);
  }

  // Utility methods for type checking and validation
  isJSONPathCall(script) {
    return typeof script === 'string' && 
           (script.startsWith('jsonPath(') || script.startsWith('JSONPath(')) && 
           script.endsWith(')');
  }

  isMapperScript(script) {
    return typeof script === 'object' && 
           !Array.isArray(script) && 
           script !== null;
  }

  isFunctionChain(script) {
    return typeof script === 'string' && 
           (script.includes('.') || script.includes('('));
  }

  isFunction(expr) {
    return typeof expr === 'string' && expr.includes('(');
  }

  hasOperators(script) {
    return typeof script === 'string' && 
           Object.keys(this.operators).some(op => script.includes(op));
  }

  isTernary(script) {
    return typeof script === 'string' && 
           script.includes('?') && 
           script.includes(':');
  }
  executeArrayOperation(arr, operation, script) {
    if (typeof script === 'string') {
      return arr[operation](item => {
        // Replace $item with the actual item value
        const processedScript = script.replace(/\$item/g, JSON.stringify(item));
        return this.execute(processedScript, { item });
      });
    }
    return arr[operation](script);
  }
  getValueType(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  }

  resolveInitialValue(path, data) {
    if (path.startsWith('$')) {
      return this.evaluateJSONPath(`$.${path.slice(1)}`, data);
    }
    return data[path];
  }
}

export default SnapLogicFunctionsHandler;