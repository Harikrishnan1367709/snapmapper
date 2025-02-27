import { JSONPath } from 'jsonpath-plus';
import moment from 'moment';
import _ from 'lodash';

class SnapLogicFunctionsHandler {
  constructor() {
    this.stringFunctions = {
      camelCase: (str) => str.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()),
      capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
      charAt: (str, index) => str.charAt(index),
      charCodeAt: (str, index) => str.charCodeAt(index),
      concat: (...args) => args.join(''),
      contains: (str, search, position = 0) => str.indexOf(search, position) !== -1,
      endsWith: (str, searchString, length) => str.endsWith(searchString, length),
      indexOf: (str, searchValue, fromIndex) => str.indexOf(searchValue, fromIndex),
      kebabCase: (str) => str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`).replace(/^-/, ''),
      lastIndexOf: (str, searchValue, fromIndex) => str.lastIndexOf(searchValue, fromIndex),
      length: (str) => str.length,
      localeCompare: (str, compareString) => str.localeCompare(compareString),
      lowerFirst: (str) => str.charAt(0).toLowerCase() + str.slice(1),
      match: (str, regexp) => str.match(regexp),
      repeat: (str, count) => str.repeat(count),
      replace: (str, searchValue, replaceValue) => str.replace(searchValue, replaceValue),
      replaceAll: (str, searchValue, replaceValue) => str.replaceAll(searchValue, replaceValue),
      search: (str, regexp) => str.search(regexp),
      slice: (str, beginIndex, endIndex) => str.slice(beginIndex, endIndex),
      snakeCase: (str) => str.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`).replace(/^_/, ''),
      split: (str, separator, limit) => str.split(separator, limit),
      sprintf: (str, ...args) => {
        return str.replace(/%(\d+\$)?s/g, (match, num) => {
          if (num) {
            const position = parseInt(num) - 1;
            return args[position] || '';
          }
          return args.shift() || '';
        });
      },
      startsWith: (str, searchString, position) => str.startsWith(searchString, position),
      substr: (str, start, length) => str.substr(start, length),
      substring: (str, start, end) => str.substring(start, end),
      toLowerCase: (str) => str.toLowerCase(),
      toUpperCase: (str) => str.toUpperCase(),
      trim: (str) => str.trim(),
      trimLeft: (str) => str.trimStart(),
      trimRight: (str) => str.trimEnd(),
      upperFirst: (str) => str.charAt(0).toUpperCase() + str.slice(1)
    };
    
    this.numberFunctions = {
      toExponential: (num, digits) => {
        if (typeof num !== 'number') {
          throw new Error('toExponential: Input must be a number');
        }
        return digits !== undefined ? num.toExponential(digits) : num.toExponential();
      },
      
      toFixed: (num, digits) => {
        if (typeof num !== 'number') {
          throw new Error('toFixed: Input must be a number');
        }
        return digits !== undefined ? num.toFixed(digits) : num.toFixed();
      },
      
      toPrecision: (num, precision) => {
        if (typeof num !== 'number') {
          throw new Error('toPrecision: Input must be a number');
        }
        return precision !== undefined ? num.toPrecision(precision) : num.toString();
      }
    };

    this.arrayFunctions = {
      concat: (arr1, ...arrays) => {
        const resolvedArrays = arrays.map(arr => 
          typeof arr === 'string' && arr.startsWith('$') ? 
          data[arr.slice(1)] : arr
        );
        
        return arr1.concat(...resolvedArrays);
      },
      
      filter: (arr, predicate) => {
        if (typeof predicate === 'string') {
          return arr.filter(x => {
            const fn = new Function('x', `return ${predicate}`);
            return fn(x);
          });
        }
        return arr.filter(predicate);
      },
      find: (arr, searchValue) => {
        if (typeof searchValue === 'string') {
          const predicate = new Function('x', `return ${searchValue}`);
          return arr.find(x => predicate(x));
        }
        return arr.find(searchValue);
      },
      
      findIndex: (arr, searchValue) => {
        if (typeof searchValue === 'string') {
          const predicate = new Function('x', `return ${searchValue}`);
          return arr.findIndex(x => predicate(x));
        }
        return arr.findIndex(searchValue);
      },
      includes: (arr, element) => arr.includes(element),
      indexOf: (arr, element) => arr.indexOf(element),
      lastIndexOf: (arr, element) => arr.lastIndexOf(element),
      length: (arr) => arr.length,
      join: (arr, separator) => arr.join(separator),
      map: (arr, mapper) => {
        if (typeof mapper === 'string') {
          const mapFn = new Function('x', `return ${mapper}`);
          return arr.map(x => mapFn(x));
        }
        return arr.map(mapper);
      },
      pop: (arr) => {
        const newArr = [...arr];
        newArr.pop();
        return newArr;
      },
      push: (arr, ...items) => {
        const newArr = [...arr];
        newArr.push(...items);
        return newArr;
      },
      reduce: (arr, reducer, initialValue) => {
        if (typeof reducer === 'string') {
          return arr.reduce((acc, curr) => {
            const fn = new Function('acc', 'curr', `return ${reducer}`);
            return fn(acc, curr);
          }, initialValue);
        }
        return arr.reduce(reducer, initialValue);
      },
      reduceRight: (arr, reducer, initialValue) => {
        if (typeof reducer === 'string') {
          return arr.reduceRight((acc, curr) => {
            const fn = new Function('acc', 'curr', `return ${reducer}`);
            return fn(acc, curr);
          }, initialValue);
        }
        return arr.reduceRight(reducer, initialValue);
      },
    
      reverse: (arr) => [...arr].reverse(),
      shift: (arr) => arr.slice(1),
      slice: (arr, begin, end) => arr.slice(begin, end),
      sort: (arr, compareFunction) => [...arr].sort(compareFunction),
      splice: (arr, start, deleteCount, ...items) => {
        const copy = [...arr];
        copy.splice(start, deleteCount, ...items);
        return copy;
      },
      toObject: (arr, keyCallback, valueCallback) => {
        const result = {};
        arr.forEach((item, index) => {
          const key = keyCallback(item, index);
          const value = valueCallback ? valueCallback(item, index) : item;
          result[key] = value;
        });
        return result;
      },
      toString: (arr) => arr.toString(),
      unshift: (arr, ...elements) => [...elements, ...arr],
    
      uint8Of: (...args) => Uint8Array.of(...args),
      uint8Subarray: (arr, begin, end) => {
        const uint8Arr = new Uint8Array(arr);
        return uint8Arr.subarray(begin, end);
      },
      uint8IndexOf: (arr, element) => {
        const uint8Arr = new Uint8Array(arr);
        return uint8Arr.indexOf(element);
      },
      uint8LastIndexOf: (arr, element) => {
        const uint8Arr = new Uint8Array(arr);
        return uint8Arr.lastIndexOf(element);
      }
    };

    this.globalFunctions = {
      decodeURIComponent: (encodedURI) => {
        try {
          return decodeURIComponent(encodedURI);
        } catch (e) {
          console.error('decodeURIComponent error:', e);
          return null;
        }
      },
      
      encodeURIComponent: (str) => {
        try {
          return encodeURIComponent(str);
        } catch (e) {
          console.error('encodeURIComponent error:', e);
          return null;
        }
      },

      eval: (expression, context) => {
        try {
          const processedExpr = expression.replace(/\$\./g, 'context.');
          const fn = new Function('context', `return ${processedExpr};`);
          return fn(context);
        } catch (e) {
          console.error('Eval error:', e);
          return null;
        }
      },

      instanceof: (obj, type) => {
        const types = {
          'Null': obj === null,
          'Boolean': typeof obj === 'boolean',
          'String': typeof obj === 'string',
          'Number': typeof obj === 'number',
          'Object': typeof obj === 'object' && !Array.isArray(obj),
          'Array': Array.isArray(obj),
          'Date': obj instanceof Date,
          'LocalDate': obj instanceof Date,
          'DateTime': obj instanceof Date,
          'LocalDateTime': obj instanceof Date
        };
        return types[type] || false;
      },

      isNaN: (value) => {
        return isNaN(value);
      },

      jsonPath: (obj, path) => {
        try {
          return JSONPath({ path: path, json: obj });
        } catch (e) {
          console.error('jsonPath error:', e);
          throw new Error(`Invalid JSONPath: ${path}`);
        }
      },

      parseFloat: (str) => {
        return parseFloat(str);
      },

      parseInt: (str, radix = 10) => {
        return parseInt(str, radix);
      },

      typeof: (value) => {
        if (value === null) return 'object';
        if (Array.isArray(value)) return 'array';
        if (value instanceof Date) return 'date';
        return typeof value;
      },

      true: true,
      false: false,
      null: null,

      lib: {}
    };

    this.matchFunctions = {
      equals: (value, pattern) => value === pattern,
      range: (value, start, end, inclusive = false) => {
        const numValue = Number(value);
        const numStart = Number(start);
        const numEnd = Number(end);
        return inclusive 
          ? numValue >= numStart && numValue <= numEnd
          : numValue >= numStart && numValue < numEnd;
      },
      
      regex: (value, pattern) => {
        try {
          const regex = new RegExp(pattern.slice(1, -1));
          return regex.test(value);
        } catch (e) {
          return false;
        }
      },
      startsWith: (value, prefix) => 
        typeof value === 'string' && value.startsWith(prefix),
      endsWith: (value, suffix) => 
        typeof value === 'string' && value.endsWith(suffix),
      
      object: (input, pattern) => {
        if (typeof input !== 'object' || !input) return false;
        
        return Object.entries(pattern).every(([key, value]) => {
          if (key.endsWith('?')) {
            const actualKey = key.slice(0, -1);
            return input[actualKey] === undefined || input[actualKey] === value;
          }
          
          if (key.endsWith('!')) {
            const actualKey = key.slice(0, -1);
            return input[actualKey] && input[actualKey] === value;
          }
          
          if (typeof value === 'string' && value.includes('..')) {
            const [min, max] = value.split('..').map(Number);
            const inputValue = input[key];
            return inputValue >= min && (value.endsWith('=') ? inputValue <= max : inputValue < max);
          }
          
          return input[key] === value;
        });
      },
      array: (input, pattern) => {
        if (!Array.isArray(input)) return false;
        
        if (pattern.length === 0) return input.length === 0;
        
        const hasSpread = pattern.includes('...');
        if (hasSpread) {
          if (pattern[0] === '...') {
            return this.matchFunctions.object(input[input.length - 1], pattern[pattern.length - 1]);
          }
          if (pattern[pattern.length - 1] === '...') {
            return this.matchFunctions.object(input[0], pattern[0]);
          }
          return this.matchFunctions.object(input[0], pattern[0]) && 
                 this.matchFunctions.object(input[input.length - 1], pattern[pattern.length - 1]);
        }
        
        return input.length === pattern.length && 
               input.every((item, i) => this.matchFunctions.object(item, pattern[i]));
      }
    };

    this.jsonFunctions = {
      parse: (text) => {
        try {
          if (typeof text !== 'string') {
              throw new Error('JSON.parse: Input must be a string');
          }
          return JSON.parse(text);
        } catch (error) {
          console.error('JSON parse error:', error);
          throw new Error(`JSON parse failed: ${error.message}`);
        }
      },

      stringify: (value) => {
        try {
            if (value instanceof Date) {
                return value.toISOString();
            }
            
            return JSON.stringify(value);
            
        } catch (error) {
            console.error('JSON stringify error:', error);
            throw new Error(`JSON stringify failed: ${error.message}`);
        }
      }
    };

    this.dateFunctions = {
      now: () => new Date(),
      parse: (args, data) => {
        try {
          if (Array.isArray(data)) {
            data.flatMap(group => 
              group.employee?.map(emp => {
                if (args.startsWith('$')) {
                  const varName = args.substring(1);
                  const dateStr = emp[varName];
                  if (!dateStr) {
                    console.warn(`No date value found for: ${varName} in employee:`, emp);
                    return null;
                  }
                  return new Date(dateStr);
                }
                return null;
              }) || []
            ).filter(date => date !== null);
          }
  
          if (typeof data === 'object' && data !== null) {
            if (args.startsWith('$')) {
              const varName = args.substring(1);
              const dateStr = data[varName];
              if (!dateStr) return null;
              return new Date(dateStr);
            }
          }
  
          return null;
        } catch (error) {
          console.error('Error in Date.parse:', error);
          return null;
        }
      },
  
      UTC: (year, month, day = 1, hour = 0, minute = 0, second = 0, millisecond = 0) => 
        Date.UTC(year, month, day, hour, minute, second, millisecond),
    
      LocalDateTime: (dateStr) => moment(dateStr).toDate(),
      LocalDate: (dateStr) => moment(dateStr).startOf('day').toDate(),
      LocalTime: (timeStr) => moment(`1970-01-01 ${timeStr}`).toDate(),
    
      getDate: (date) => date.getDate(),
      getDay: (date) => date.getDay(),
      getFullYear: (date) => date.getFullYear(),
      getHours: (date) => date.getHours(),
      getMilliseconds: (date) => date.getMilliseconds(),
      getMinutes: (date) => date.getMinutes(),
      getMonth: (date) => date.getMonth() + 1,
      getMonthFromZero: (date) => date.getMonth(),
      getUTCMonthFromZero: (date) => date.getUTCMonth(),
      getSeconds: (date) => date.getSeconds(),
      getTime: (date) => date.getTime(),
      
      getUTCDate: (date) => date.getUTCDate(),
      getUTCDay: (date) => date.getUTCDay(),
      getUTCFullYear: (date) => date.getUTCFullYear(),
      getUTCHours: (date) => date.getUTCHours(),
      getUTCMilliseconds: (date) => date.getUTCMilliseconds(),
      getUTCMinutes: (date) => date.getUTCMinutes(),
      getUTCMonth: (date) => date.getUTCMonth() + 1,
      getUTCSeconds: (date) => date.getUTCSeconds(),
      getTimezoneOffset: (date) => date.getTimezoneOffset(),
    
      toString: (date) => date.toISOString(),
      toLocaleString: (date, options) => date.toLocaleString(options?.locale, options),
      toLocaleDateString: (date, options) => date.toLocaleDateString(options?.locale, options),
      toLocaleDateTimeString: (date, options) => moment(date).format(options?.format || 'YYYY-MM-DDTHH:mm:ss.SSS'),
      toLocaleTimeString: (date, options) => date.toLocaleTimeString(options?.locale, options),
    
      plus: (date, value) => moment(date).add(value, 'milliseconds').toDate(),
      plusDays: (date, days) => moment(date).add(days, 'days').toDate(),
      plusHours: (date, hours) => moment(date).add(hours, 'hours').toDate(),
      plusMillis: (date, millis) => moment(date).add(millis, 'milliseconds').toDate(),
      plusMinutes: (date, minutes) => moment(date).add(minutes, 'minutes').toDate(),
      plusMonths: (date, months) => moment(date).add(months, 'months').toDate(),
      plusSeconds: (date, seconds) => moment(date).add(seconds, 'seconds').toDate(),
      plusWeeks: (date, weeks) => moment(date).add(weeks, 'weeks').toDate(),
      plusYears: (date, years) => moment(date).add(years, 'years').toDate(),
    
      minus: (date, value) => moment(date).subtract(value, 'milliseconds').toDate(),
      minusDays: (date, days) => moment(date).subtract(days, 'days').toDate(),
      minusHours: (date, hours) => moment(date).subtract(hours, 'hours').toDate(),
      minusMillis: (date, millis) => moment(date).subtract(millis, 'milliseconds').toDate(),
      minusMinutes: (date, minutes) => moment(date).subtract(minutes, 'minutes').toDate(),
      minusMonths: (date, months) => moment(date).subtract(months, 'months').toDate(),
      minusSeconds: (date, seconds) => moment(date).subtract(seconds, 'seconds').toDate(),
      minusWeeks: (date, weeks) => moment(date).subtract(weeks, 'weeks').toDate(),
      minusYears: (date, years) => moment(date).subtract(years, 'years').toDate(),
    
      withDayOfMonth: (date, day) => moment(date).date(day).toDate(),
      withDayOfYear: (date, day) => moment(date).dayOfYear(day).toDate(),
      withHourOfDay: (date, hour) => moment(date).hour(hour).toDate(),
      withMillisOfSecond: (date, millis) => moment(date).millisecond(millis).toDate(),
      withMinuteOfHour: (date, minute) => moment(date).minute(minute).toDate(),
      withMonthOfYear: (date, month) => moment(date).month(month - 1).toDate(),
      withSecondOfMinute: (date, second) => moment(date).second(second).toDate(),
      withYear: (date, year) => moment(date).year(year).toDate()
    };

    this.mathFunctions = {
      abs: Math.abs,
      ceil: Math.ceil,
      floor: Math.floor,
      max: Math.max,
      min: Math.min,
      pow: Math.pow,
      random: Math.random,
      randomUUID: () => {
        const timestamp = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (timestamp + Math.random() * 16) % 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
      },
      round: Math.round,
      sign: (number) => {
        if (number === 0 || number === -0) return 0;
        return Math.sign(number);
      },
      trunc: Math.trunc,
  
      E: Math.E,
      LN2: Math.LN2,
      LN10: Math.LN10,
      LOG2E: Math.LOG2E,
      LOG10E: Math.LOG10E,
      PI: Math.PI,
      SQRT1_2: Math.SQRT1_2,
      SQRT2: Math.SQRT2
    };

    this.objectFunctions = {
      entries: (obj) => Object.entries(obj),
      
      keys: (obj) => Object.keys(obj),
      
      values: (obj) => Object.values(obj),
      
      filter: (obj, predicate) => {
        if (typeof predicate === 'string') {
          const fn = new Function('value', 'key', 'obj', `return ${predicate}`);
          return Object.fromEntries(
            Object.entries(obj).filter(([key, value]) => fn(value, key, obj))
          );
        }
        return Object.fromEntries(
          Object.entries(obj).filter(([key, value]) => predicate(value, key, obj))
        );
      },
    
      mapKeys: (obj, mapper) => {
        if (!obj || typeof obj !== 'object') {
          throw new Error('mapKeys: Input must be an object');
        }

        const result = {};
        
        if (typeof mapper === 'string') {
          const fn = new Function('value', 'key', 'obj', `return ${mapper}`);
          Object.entries(obj).forEach(([key, value]) => {
            try {
              const newKey = fn(value, key, obj);
              result[newKey] = value;
            } catch (error) {
              console.error(`mapKeys: Error transforming key "${key}":`, error);
              result[key] = value;
            }
          });
          return result;
        }
        
        if (typeof mapper === 'function') {
          Object.entries(obj).forEach(([key, value]) => {
            try {
              const newKey = mapper(value, key, obj);
              result[newKey] = value;
            } catch (error) {
              console.error(`mapKeys: Error transforming key "${key}":`, error);
              result[key] = value;
            }
          });
          return result;
        }

        throw new Error('mapKeys: Mapper must be a string expression or function');
      },

      get: (obj, path, defaultValue = null) => _.get(obj, path, defaultValue),
      
      getFirst: (obj, propertyName, defaultValue = null) => {
        const value = obj[propertyName];
        return Array.isArray(value) && value.length > 0 ? value[0] : (value || defaultValue);
      },
      
      hasPath: (obj, path) => _.has(obj, path),
      
      hasOwnProperty: (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop),
      
      isEmpty: (obj) => Object.keys(obj).length === 0,
      
      merge: (obj, ...sources) => _.merge({}, obj, ...sources),
      mapValues: (obj, mapper) => {
        if (typeof mapper === 'string') {
          const fn = new Function('value', 'key', 'obj', `return ${mapper}`);
          return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, fn(value, key, obj)])
          );
        }
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [key, mapper(value, key, obj)])
        );
      },
    
      extend: (obj, ...sources) => {
        const result = { ...obj };
        sources.forEach(source => {
          if (typeof source === 'string') {
            try {
              source = JSON.parse(source);
            } catch (e) {
              source = {};
            }
          }
          Object.assign(result, source);
        });
        return result;
      }
    };

    this.dateFormatter = {
      formatDate: (date, format) => {
        return moment(date).format(format);
      },
      subtractHours: (date, hours) => {
        return moment(date).subtract(hours, 'hours').toDate();
      }
    };

    this.operatorPrecedence = {
      '||': 1,
      '&&': 2,
      '===': 3,
      '==': 3,
      '!=': 3,
      '!==': 3,
      '<': 4, '<=': 4, '>': 4, '>=': 4,
      '+': 5, '-': 5,
      '*': 6, '/': 6,
      
      '?': 1,
      ':': 1
    };
  }

  evaluateOperatorExpression(expression, data) {
    try {
      if (expression.includes('Date.parse') && expression.includes('Date.now()')) {
        let processedExpr = expression;
        
        const dateParseRegex = /Date\.parse\(\$([a-zA-Z0-9_]+)\)/g;
        processedExpr = processedExpr.replace(dateParseRegex, (match, varName) => {
          const dateValue = data[varName];
          if (!dateValue) return 'null';
          return `Date.parse("${dateValue}")`;
        });
        
        processedExpr = processedExpr.replace(/Date\.now\(\)/g, Date.now().toString());
        
        processedExpr = processedExpr.replace(/\$([a-zA-Z0-9_]+)/g, (match, varName) => {
          const value = data[varName];
          if (value === undefined || value === null) return 'null';
          return typeof value === 'string' ? `"${value.replace(/"/g, '\\"')}"` : value;
        });
        
        const evaluationFn = new Function(`
          try {
            return Boolean(${processedExpr});
          } catch (e) {
            console.error("Expression evaluation error:", e);
            return false;
          }
        `);
        
        return evaluationFn();
      }

      const normalizedExpr = expression.replace(/\r?\n/g, ' ').trim();
      
      if (normalizedExpr.includes('&&') || normalizedExpr.includes('||')) {
        const andParts = normalizedExpr.split('&&').map(part => part.trim());
        
        const andResults = andParts.map(part => {
          const orParts = part.split('||').map(p => p.trim());
          
          const orResults = orParts.map(p => {
            if (p.includes('==')) {
              const [left, right] = p.split('==').map(s => s.trim());
              const leftValue = this.evaluateNestedFunction(left, data);
              const rightValue = this.evaluateNestedFunction(right, data);
              return leftValue == rightValue;
            }
            return this.evaluateNestedFunction(p, data);
          });
          
          return orResults.some(r => Boolean(r));
        });
        
        return andResults.every(r => Boolean(r));
      }

      if (normalizedExpr.includes('Date.now()')) {
        return this.handleComplexDateExpression(normalizedExpr, data);
      }

      const operatorRegex = /[\+\-\*\/>=<==!=&\|?:]/;
      if (!operatorRegex.test(normalizedExpr)) {
        return this.evaluateNestedFunction(normalizedExpr, data);
      }

      const tokens = this.tokenizeExpression(normalizedExpr);
      return this.parseExpression(tokens, data, 0).result;
    } catch (error) {
      console.error('Error evaluating operator expression:', error);
      console.error('Failed expression:', expression);
      return false;
    }
  }

  evaluateNestedFunction(expression, data) {
    return expression;
  }

  tokenizeExpression(expression) {
    return [];
  }

  parseExpression(tokens, data, index) {
    return { result: false, index: 0 };
  }

  handleComplexDateExpression(expression, data) {
    return false;
  }
}

export default SnapLogicFunctionsHandler;
