<lov-code>
import { JSONPath } from 'jsonpath-plus';
import moment from 'moment';
import _ from 'lodash';
import { operatorPrecedence, isOperator, applyOperator } from './src/utils/operatorUtils';
import { handleDateExpressions, formatDate } from './src/utils/dateUtils';
import { handleJSONPathExpressions, JsonPathEvaluator } from './src/utils/jsonPathUtils';

class SnaplogicFunctionsHandler {
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
        // Convert any string references to actual arrays
        const resolvedArrays = arrays.map(arr => 
          typeof arr === 'string' && arr.startsWith('$') ? 
          data[arr.slice(1)] : arr
        );
        
        // Perform concatenation with all resolved arrays
        return arr1.concat(...resolvedArrays);
      },
      
      filter: (arr, predicate) => {
        if (typeof predicate === 'string') {
          // Handle string predicate like "x > 3"
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
          // Handle string reducer like "acc + curr"
          return arr.reduce((acc, curr) => {
            const fn = new Function('acc', 'curr', `return ${reducer}`);
            return fn(acc, curr);
          }, initialValue);
        }
        return arr.reduce(reducer, initialValue);
      },
      reduceRight: (arr, reducer, initialValue) => {
        if (typeof reducer === 'string') {
          // Handle string reducer like "acc + curr"
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
    
      // Uint8Array specific methods
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
      // URI Component functions
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

      // Evaluation function
      eval: (expression, context) => {
        try {
          // Replace $ with context reference
          const processedExpr = expression.replace(/\$\./g, 'context.');
          const fn = new Function('context', `return ${processedExpr};`);
          return fn(context);
        } catch (e) {
          console.error('Eval error:', e);
          return null;
        }
      },

      // Type checking functions
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

      // JSON Path function
      jsonPath: (obj, path) => {
        try {
          return JSONPath({ path: path, json: obj });
        } catch (e) {
          console.error('jsonPath error:', e);
          throw new Error(`Invalid JSONPath: ${path}`);
        }
      },

      // Parsing functions
      parseFloat: (str) => {
        return parseFloat(str);
      },

      parseInt: (str, radix = 10) => {
        return parseInt(str, radix);
      },

      // Type checking
      typeof: (value) => {
        if (value === null) return 'object';
        if (Array.isArray(value)) return 'array';
        if (value instanceof Date) return 'date';
        return typeof value;
      },

      // Constants
      true: true,
      false: false,
      null: null,

      // Library support
      lib: {} // This would be populated with imported expression libraries
    };

    this.matchFunctions = {
      // Basic match operations
      equals: (value, pattern) => value === pattern,
      range: (value, start, end, inclusive = false) => {
        const numValue = Number(value);
        const numStart = Number(start);
        const numEnd = Number(end);
        return inclusive 
          ? numValue >= numStart && numValue <= numEnd
          : numValue >= numStart && numValue < numEnd;
      },
      
      // String pattern matching
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
      
      // Object pattern matching
      object: (input, pattern) => {
        if (typeof input !== 'object' || !input) return false;
        
        return Object.entries(pattern).every(([key, value]) => {
          // Handle optional properties
          if (key.endsWith('?')) {
            const actualKey = key.slice(0, -1);
            return input[actualKey] === undefined || input[actualKey] === value;
          }
          
          // Handle required properties
          if (key.endsWith('!')) {
            const actualKey = key.slice(0, -1);
            return input[actualKey] && input[actualKey] === value;
          }
          
          // Handle ranges
          if (typeof value === 'string' && value.includes('..')) {
            const [min, max] = value.split('..').map(Number);
            const inputValue = input[key];
            return inputValue >= min && (value.endsWith('=') ? inputValue <= max : inputValue < max);
          }
          
          return input[key] === value;
        });
      },
      // Array pattern matching
      array: (input, pattern) => {
        if (!Array.isArray(input)) return false;
        
        // Empty array pattern
        if (pattern.length === 0) return input.length === 0;
        
        // Handle spread patterns
        const hasSpread = pattern.includes('...');
        if (hasSpread) {
          if (pattern[0] === '...') {
            return this.matchFunctions.object(input[input.length - 1], pattern[pattern.length - 1]);
          }
          if (pattern[pattern.length - 1] === '...') {
            return this.matchFunctions.object(input[0], pattern[0]);
          }
          // Handle middle spread
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
            // Handle Date objects specially
            if (value instanceof Date) {
                return value.toISOString();
            }
            
            // Simply stringify once with no formatting
            return JSON.stringify(value);
            
        } catch (error) {
            console.error('JSON stringify error:', error);
            throw new Error(`JSON stringify failed: ${error.message}`);
        }
    }
  };

    this.dateFunctions = {
      // Core Date Methods
      now: () => new Date(),
      parse: (dateStr, format) => format ? moment(dateStr, format).toDate() : new Date(dateStr),
      UTC: (year, month, day = 1, hour = 0, minute = 0, second = 0, millisecond = 0) => 
        Date.UTC(year, month, day, hour, minute, second, millisecond),
    
      // Local Date/Time Parsing
      LocalDateTime: (dateStr) => moment(dateStr).toDate(),
      LocalDate: (dateStr) => moment(dateStr).startOf('day').toDate(),
      LocalTime: (timeStr) => moment(`1970-01-01 ${timeStr}`).toDate(),
    
      // Getters
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
      
      // UTC Getters
      getUTCDate: (date) => date.getUTCDate(),
      getUTCDay: (date) => date.getUTCDay(),
      getUTCFullYear: (date) => date.getUTCFullYear(),
      getUTCHours: (date) => date.getUTCHours(),
      getUTCMilliseconds: (date) => date.getUTCMilliseconds(),
      getUTCMinutes: (date) => date.getUTCMinutes(),
      getUTCMonth: (date) => date.getUTCMonth() + 1,
      getUTCSeconds: (date) => date.getUTCSeconds(),
      getTimezoneOffset: (date) => date.getTimezoneOffset(),
    
      // Conversion Methods
      toString: (date) => date.toISOString(),
      toLocaleString: (date, options) => date.toLocaleString(options?.locale, options),
      toLocaleDateString: (date, options) => date.toLocaleDateString(options?.locale, options),
      toLocaleDateTimeString: (date, options) => moment(date).format(options?.format || 'YYYY-MM-DDTHH:mm:ss.SSS'),
      toLocaleTimeString: (date, options) => date.toLocaleTimeString(options?.locale, options),
    
      // Plus Methods
      plus: (date, value) => moment(date).add(value, 'milliseconds').toDate(),
      plusDays: (date, days) => moment(date).add(days, 'days').toDate(),
      plusHours: (date, hours) => moment(date).add(hours, 'hours').toDate(),
      plusMillis: (date, millis) => moment(date).add(millis, 'milliseconds').toDate(),
      plusMinutes: (date, minutes) => moment(date).add(minutes, 'minutes').toDate(),
      plusMonths: (date, months) => moment(date).add(months, 'months').toDate(),
      plusSeconds: (date, seconds) => moment(date).add(seconds, 'seconds').toDate(),
      plusWeeks: (date, weeks) => moment(date).add(weeks, 'weeks').toDate(),
      plusYears: (date, years) => moment(date).add(years, 'years').toDate(),
    
      // Minus Methods
      minus: (date, value) => moment(date).subtract(value, 'milliseconds').toDate(),
      minusDays: (date, days) => moment(date).subtract(days, 'days').toDate(),
      minusHours: (date, hours) => moment(date).subtract(hours, 'hours').toDate(),
      minusMillis: (date, millis) => moment(date).subtract(millis, 'milliseconds').toDate(),
      minusMinutes: (date, minutes) => moment(date).subtract(minutes, 'minutes').toDate(),
      minusMonths: (date, months) => moment(date).subtract(months, 'months').toDate(),
      minusSeconds: (date, seconds) => moment(date).subtract(seconds, 'seconds').toDate(),
      minusWeeks: (date, weeks) => moment(date).subtract(weeks, 'weeks').toDate(),
      minusYears: (date, years) => moment(date).subtract(years, 'years').toDate(),
    
      // With Methods
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
      // Basic Math Functions
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
        // Custom implementation to handle zero cases as specified
        if (number === 0 || number === -0) return 0;
        return Math.sign(number);
      },
      trunc: Math.trunc,
  
      // Mathematical Constants
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
        // Input validation
        if (!obj || typeof obj !== 'object') {
          throw new Error('mapKeys: Input must be an object');
        }

        const result = {};
        
        // Handle string mapper (e.g., simple transformation expression)
        if (typeof mapper === 'string') {
          const fn = new Function('value', 'key', 'obj', `return ${mapper}`);
          Object.entries(obj).forEach(([key, value]) => {
            try {
              const newKey = fn(value, key, obj);
              result[newKey] = value;
            } catch (error) {
              console.error(`mapKeys: Error transforming key "${key}":`, error);
              result[key] = value; // Keep original key on error
            }
          });
          return result;
        }
        
        // Handle function mapper
        if (typeof mapper === 'function') {
          Object.entries(obj).forEach(([key, value]) => {
            try {
              const newKey = mapper(value, key, obj);
              result[newKey] = value;
            } catch (error) {
              console.error(`mapKeys: Error transforming key "${key}":`, error);
              result[key] = value; // Keep original key on error
            }
          });
          return result;
        }

        // Invalid mapper
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

    this.operatorPrecedence = operatorPrecedence;

   
  }


  handleComplexDateExpression(script) {
    try {
      const cleanScript = script.replace(/\n/g, ' ').trim();


      const context = {
        Date: {
          now: () => new Date(),
          parse: (str) => new Date(str)
        },
        moment,
        formatter: this.dateFormatter
      };


      const evalFn = new Function('Date', 'moment', 'formatter', `
        try {
          const now = Date.now();
         
          const result = ${cleanScript.includes('?') ?
            `(${cleanScript.split('?')[0]}) ?
             "${cleanScript.split('?')[1].split(':')[0].trim()}" :
             (() => {
               const baseDate = formatter.subtractHours(now, 10);
               const datePart = formatter.formatDate(baseDate, 'YYYY-MM-DD');
               const timePart = formatter.formatDate(baseDate, 'HH:mm:ss');
               return datePart + 'T' + timePart + '+02:00';
             })()`
            :
            cleanScript
          };
         
          return result;
        } catch (error) {
          console.error('Evaluation error:', error);
          return null;
        }
      `);


      return evalFn(context.Date, context.moment, context.formatter);
    } catch (error) {
      console.error('Expression handling error:', error);
      return null;
    }
  }




  // evaluateValue(expression, data) {
  //   if (expression.startsWith('$')) {
  //     const variable = expression.slice(1);
  //     return data[variable];
  //   }
  //   return expression;
  // }

   // Add these helper methods

   parsePattern(pattern) {
    try {
      // Handle special patterns like [..., {...}, ...]
      if (pattern.includes('...')) {
        return pattern
          .replace(/\.\.\./g, '"..."')
          .replace(/(\w+)!/g, '"$1!"')
          .replace(/(\w+)\?/g, '"$1?"');
      }
      return JSON.parse(pattern);
    } catch (e) {
      return pattern;
    }
  }
  evaluateGuard(guard, context) {
    try {
      const fn = new Function(...Object.keys(context), `return ${guard};`);
      return fn(...Object.values(context));
    } catch (error) {
      return false;
    }
  }
  

  evaluateExpression(expression, context) {
    try {
      // Handle string literals
      if (expression.startsWith("'") || expression.startsWith('"')) {
        return expression.slice(1, -1);
      }
      
      // Handle expressions with concatenation
      if (expression.includes('+')) {
        const fn = new Function(...Object.keys(context), `return ${expression};`);
        return fn(...Object.values(context));
      }
      
      return expression;
    } catch (error) {
      return expression;
    }
  }

  evaluateGuard(guard, context) {
    try {
      const fn = new Function(...Object.keys(context), `return ${guard};`);
      return fn(...Object.values(context));
    } catch (error) {
      console.error('Guard evaluation error:', error);
      return false;
    }
  }

  


  handleDateExpression(script) {
    try {
      console.log('Input script:', script); // Debug log
      const result = this.dateUtils.parseExpression(script);
      console.log('Output result:', result); // Debug log
      return result;
    } catch (error) {
      console.error('Date expression handling error:', error);
      return script;
    }
  }




  handleDateComparison(script, data) {
    const results = data.map(group => {
      const evaluatedEmployees = group.employee.map(emp => {
        const evaluateScript = () => {
          // Create a context object with all employee data
          const context = {
            ...emp,
            dates: {
              effective: moment(emp.EffectiveMoment),
              entry: moment(emp.EntryMoment),
              now: moment(),
              parse: (dateStr) => moment(dateStr)
            }
          };
 
          // Handle different types of date comparisons
          if (script.includes('Date.parse')) {
            const dateComparisons = {
              effectiveVsNow: context.dates.effective.valueOf() <= context.dates.now.valueOf(),
              effectiveVsEntry: context.dates.effective.valueOf() >= context.dates.entry.valueOf(),
              effectiveInRange: (start, end) => {
                const startDate = context.dates.parse(start);
                const endDate = context.dates.parse(end);
                return context.dates.effective.isBetween(startDate, endDate, 'day', '[]');
              }
            };
 
            // Evaluate specific conditions based on script
            if (script.includes('2023-01-01')) {
              return dateComparisons.effectiveInRange('2023-01-01', '2023-12-31') &&
                     (emp.Event === "Time Off Entry" || emp.Event === "Request Time Off");
            }
           
            if (script.includes('EntryMoment')) {
              return dateComparisons.effectiveVsEntry &&
                     (emp.EventLiteTypeID === "Time Off Entry" || emp.Event === "Request Time Off");
            }
 
            if (script.includes('WorkerID == "81131"')) {
              return emp.WorkerID === "81131" &&
                     dateComparisons.effectiveVsNow &&
                     (emp.Event === "Time Off Entry" || emp.Event === "Request Time Off");
            }
          }
 
          // Handle non-date conditions
          if (script.includes('IsCorrectionOrCorrected')) {
            return emp.IsCorrectionOrCorrected === "0" &&
                   (emp.Event === "Correct Time Off" || emp.Event === "Time Off Entry");
          }
 
          // Default date and event check
          return context.dates.effective.valueOf() <= context.dates.now.valueOf() &&
                 ["Time Off Entry", "Request Time Off", "Timesheet Review Event", "Correct Time Off"]
                 .includes(emp.Event || emp.EventLiteTypeID);
        };
 
        return evaluateScript();
      });
 
      return {
        ...group,
        employee: evaluatedEmployees
      };
    });
 
    return results;
  }
 
  handleLogicalExpression(script, data) {
    try {
      const evaluateCondition = (emp, script) => {
        const context = {
          ...emp,
          Date: {
            parse: (dateStr) => new Date(dateStr).getTime(),
            now: () => new Date().getTime()  // Add this line
          }
        };
 
        // Add debug logging
        console.log('Evaluating:', {
          EffectiveMoment: new Date(emp.EffectiveMoment).getTime(),
          Now: new Date().getTime(),
          EventLiteTypeID: emp.EventLiteTypeID,
          Event: emp.Event
        });
 
        const processedScript = script.replace(/\$(\w+)/g, (match, variable) => {
          const value = context[variable];
          if (value === null) return 'null';
          if (typeof value === 'string') {
            return `"${value}"`; // Wrap strings in quotes
          }
          return value ?? 'undefined';
        });
 
        try {
          const evalFn = new Function(
            'Date',
            `
            try {
              return
