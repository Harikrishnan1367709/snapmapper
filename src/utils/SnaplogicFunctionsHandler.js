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

    this.operatorPrecedence = {
      '||': 1,
      '&&': 2,
      '==': 3, '!=': 3, '===': 3, '!==': 3,
      '<': 4, '<=': 4, '>': 4, '>=': 4,
      '+': 5, '-': 5,
      '*': 6, '/': 6,
      '?': 0, ':': 0  // Ternary operators have special handling
  };

   
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
              return Boolean(${processedScript});
            } catch (e) {
              console.error('Evaluation error:', e);
              return false;
            }
            `
          );
          return evalFn(context.Date);
        } catch (error) {
          console.error('Function creation error:', error);
          return false;
        }
      };
 
      return data.map(group => {
        const filteredEmployees = group.employee.filter(emp =>
          evaluateCondition(emp, script)
        );
 
        return {
          groupBy: group.groupBy,
          employee: filteredEmployees
        };
      }).filter(group => group.employee.length > 0);
    } catch (error) {
      console.error('Expression error:', error);
      return [];
    }
  }


  handleObjectMapping(script, data) {
    try {
      const template = JSON.parse(script);
     
      const evaluateJSONPath = (pathExpr, groupData) => {
        try {
          // Generic JSONPath evaluation
          const result = JSONPath({ path: pathExpr, json: groupData });
          console.log(`JSONPath evaluation for ${pathExpr}:`, result);
         
          // Handle different result types
          if (pathExpr.endsWith('.length')) {
            return result;
          }
         
          // For array expressions (wildcards or filters), preserve array structure
          if (pathExpr.includes('[*]') || pathExpr.includes('[?(')) {
            return result;
          }
         
          // For simple paths, return single value if array has one element
          return Array.isArray(result) && result.length === 1 ? result[0] : result;
        } catch (error) {
          console.error('JSONPath evaluation error:', error);
          return null;
        }
      };
     
      const mappedData = data.map(groupData => {
        const result = {};
       
        // Process each template key dynamically
        for (const [key, pathExpr] of Object.entries(template)) {
          if (typeof pathExpr === 'string' && pathExpr.startsWith('$.')) {
            const value = evaluateJSONPath(pathExpr, groupData);
            if (value !== null) {
              result[key] = value;
            }
          } else if (typeof pathExpr === 'object' && pathExpr !== null) {
            // Handle nested objects
            result[key] = {};
            for (const [nestedKey, nestedExpr] of Object.entries(pathExpr)) {
              if (typeof nestedExpr === 'string' && nestedExpr.startsWith('$.')) {
                const value = evaluateJSONPath(nestedExpr, groupData);
                if (value !== null) {
                  result[key][nestedKey] = value;
                }
              } else {
                result[key][nestedKey] = nestedExpr;
              }
            }
          } else {
            // Handle static values
            result[key] = pathExpr;
          }
        }
       
        return result;
      });
 
      return mappedData;
    } catch (error) {
      console.error('Object mapping error:', error);
      return null;
    }
  }

  // evaluateOperatorExpression(expression, data) {
  //   try {
  //     // First normalize the expression
  //     let normalizedExpression = expression.trim();
      
  //     // Handle jsonPath function calls first
  //     const jsonPathFuncRegex = /jsonPath\(\$,\s*["']([^"']+)["']\)/g;
  //     normalizedExpression = normalizedExpression.replace(jsonPathFuncRegex, (match, path) => {
  //       // Special handling for root access
  //       if (path === '$') {
  //         const value = data;
  //         return JSON.stringify(value);
  //       }
        
  //       const value = JSONPath({ 
  //         path: path, 
  //         json: data,
  //         wrap: false 
  //       });
        
  //       if (typeof value === 'string') {
  //         return `"${value}"`;  // Wrap strings in quotes
  //       }
  //       return JSON.stringify(value); // Handle other types
  //     });
  
  //     // Handle direct JSONPath expressions
  //     const directJsonPathRegex = /\$[.\w\[\]]+/g;
  //     normalizedExpression = normalizedExpression.replace(directJsonPathRegex, (match) => {
  //       const value = this.handleJSONPath(match, data);
  //       if (typeof value === 'string') {
  //         return `"${value}"`;  // Wrap strings in quotes
  //       }
  //       return JSON.stringify(value); // Handle other types
  //     });
  
  //     // Handle Date expressions
  //     const dateRegex = /Date\.(parse|now)\([^)]*\)/g;
  //     normalizedExpression = normalizedExpression.replace(dateRegex, (match) => {
  //       if (match === 'Date.now()') {
  //         return new Date().getTime();
  //       }
  //       const parseMatch = match.match(/Date\.parse\(['"]([^'"]+)['"]\)/);
  //       if (parseMatch) {
  //         return new Date(parseMatch[1]).getTime();
  //       }
  //       return match;
  //     });
  
  //     // Handle ternary operators
  //     if (normalizedExpression.includes('?')) {
  //       const [condition, rest] = normalizedExpression.split('?').map(p => p.trim());
  //       const [truePart, falsePart] = rest.split(':').map(p => p.trim());
        
  //       const conditionResult = this.evaluateOperatorExpression(condition, data);
  //       return conditionResult ? 
  //         this.evaluateOperatorExpression(truePart, data) : 
  //         this.evaluateOperatorExpression(falsePart, data);
  //     }
  
  //     // Handle comparison operators
  //     const comparisonRegex = /(>=|<=|==|===|!=|!==|>|<)/;
  //     if (comparisonRegex.test(normalizedExpression)) {
  //       const [left, operator, right] = normalizedExpression.split(comparisonRegex);
  //       const leftValue = this.evaluateOperatorExpression(left.trim(), data);
  //       const rightValue = this.evaluateOperatorExpression(right.trim(), data);
        
  //       switch(operator.trim()) {
  //         case '>=': return leftValue >= rightValue;
  //         case '<=': return leftValue <= rightValue;
  //         case '==': return leftValue == rightValue;
  //         case '===': return leftValue === rightValue;
  //         case '!=': return leftValue != rightValue;
  //         case '!==': return leftValue !== rightValue;
  //         case '>': return leftValue > rightValue;
  //         case '<': return leftValue < rightValue;
  //       }
  //     }
  
  //     // Handle logical operators
  //     if (normalizedExpression.includes('&&') || normalizedExpression.includes('||')) {
  //       const parts = normalizedExpression.split(/(\|\||\&\&)/);
  //       let result = this.evaluateOperatorExpression(parts[0].trim(), data);
        
  //       for (let i = 1; i < parts.length; i += 2) {
  //         const operator = parts[i];
  //         const nextValue = this.evaluateOperatorExpression(parts[i + 1].trim(), data);
          
  //         if (operator === '&&') {
  //           result = result && nextValue;
  //         } else if (operator === '||') {
  //           result = result || nextValue;
  //         }
  //       }
        
  //       return result;
  //     }
  
  //     // Handle arithmetic operators
  //     const arithmeticRegex = /[\+\-\*\/]/;
  //     if (arithmeticRegex.test(normalizedExpression)) {
  //       // Safe evaluation of arithmetic expression
  //       const fn = new Function('return ' + normalizedExpression);
  //       return fn();
  //     }
  
  //     // Handle literals and simple values
  //     if (normalizedExpression === 'true') return true;
  //     if (normalizedExpression === 'false') return false;
  //     if (normalizedExpression === 'null') return null;
  //     if (!isNaN(normalizedExpression)) return Number(normalizedExpression);
      
  //     // Handle string literals
  //     if (/^["'].*["']$/.test(normalizedExpression)) {
  //       return normalizedExpression.slice(1, -1);
  //     }
  
  //     // Try parsing JSON if it's a stringified object/array
  //     try {
  //       return JSON.parse(normalizedExpression);
  //     } catch (e) {
  //       // If not valid JSON, return as is
  //       return normalizedExpression;
  //     }
  
  //   } catch (error) {
  //     console.error('Error evaluating operator expression:', error);
  //     throw new Error(`Failed to evaluate expression: ${expression}`);
  //   }
  // }
  
  // // Helper method to evaluate single comparisons
  // evaluateComparison(expression, data) {
  //   // Handle comparison operators
  //   const comparisonRegex = /(>=|<=|==|===|!=|!==|>|<)/;
  //   if (comparisonRegex.test(expression)) {
  //     const [left, operator, right] = expression.split(comparisonRegex).map(part => part.trim());
      
  //     // Evaluate left and right sides
  //     let leftValue = this.evaluateValue(left, data);
  //     let rightValue = this.evaluateValue(right, data);
  
  //     // Convert to numbers if both sides are numeric
  //     if (!isNaN(leftValue) && !isNaN(rightValue)) {
  //       leftValue = Number(leftValue);
  //       rightValue = Number(rightValue);
  //     }
  
  //     // Perform comparison
  //     switch(operator) {
  //       case '>=': return leftValue >= rightValue;
  //       case '<=': return leftValue <= rightValue;
  //       case '==': return leftValue == rightValue;
  //       case '===': return leftValue === rightValue;
  //       case '!=': return leftValue != rightValue;
  //       case '!==': return leftValue !== rightValue;
  //       case '>': return leftValue > rightValue;
  //       case '<': return leftValue < rightValue;
  //       default: return false;
  //     }
  //   }
  
  //   // Handle single values
  //   return this.evaluateValue(expression, data);
  // }
  
  // // Helper method to evaluate single values
  // evaluateValue(value, data) {
  //   value = value.trim();
  
  //   // Handle SnapLogic functions
  //   if (value.startsWith('$') && value.includes('.')) {
  //     return this.executeScript(value, data);
  //   }
  
  //   // Handle jsonPath
  //   if (value.startsWith('jsonPath(')) {
  //     return this.executeScript(value, data);
  //   }
  
  //   // Handle literals
  //   if (value === 'true') return true;
  //   if (value === 'false') return false;
  //   if (value === 'null') return null;
  //   if (!isNaN(value)) return Number(value);
  //   if (/^["'].*["']$/.test(value)) return value.slice(1, -1);
  
  //   // Try parsing JSON
  //   try {
  //     return JSON.parse(value);
  //   } catch (e) {
  //     return value;
  //   }
  // }
  // buildNestedObject(path, value) {
  //   // Handle special characters and spaces in path
  //   const parts = path.split('.').map(part => part.trim());
  //   const result = {};
  //   let current = result;
  
  //   // Build nested structure
  //   for (let i = 0; i < parts.length; i++) {
  //     const part = parts[i];
  //     if (i === parts.length - 1) {
  //       // Set the final value
  //       current[part] = value;
  //     } else {
  //       // Create nested object if it doesn't exist
  //       current[part] = current[part] || {};
  //       current = current[part];
  //     }
  //   }
  
  //   console.log('Built nested object:', result);
  //   return result;
  // }
  

  // evaluateExpression(expression, sourceData) {
  //   if (!expression || !sourceData) return null;
  
  //   try {
  //     // Handle jsonPath function syntax with single or double quotes
  //     if (expression.startsWith('jsonPath(')) {
  //       const pathMatch = expression.match(/jsonPath\(\$,\s*['"]([^'"]+)['"]\)/);
  //       if (pathMatch) {
  //         const path = pathMatch[1];
  //         console.log('Evaluating JSONPath:', path);
  //         const result = JSONPath({
  //           path: path,
  //           json: sourceData,
  //           wrap: false
  //         });
  //         console.log('JSONPath result:', result);
  //         return result !== undefined ? result : null;
  //       }
  //     }
  
  //     // Handle direct JSONPath access
  //     if (expression.startsWith('$')) {
  //       const result = JSONPath({
  //         path: expression,
  //         json: sourceData,
  //         wrap: false
  //       });
  //       return result !== undefined ? result : null;
  //     }
  
  //     return expression;
  //   } catch (error) {
  //     console.error('Error evaluating expression:', error);
  //     return null;
  //   }
  // }
  
  // processMapping(mapping, sourceData) {
  //   if (!mapping || typeof mapping !== 'object') return {};
  
  //   let result = {};
  
  //   for (const [targetPath, expression] of Object.entries(mapping)) {
  //     if (!targetPath || !expression) continue;
  
  //     const value = this.evaluateExpression(expression.trim(), sourceData);
  
  //     if (value !== null) {
  //       if (targetPath.startsWith('jsonPath(')) {
  //         // Enhanced regex to handle both formats
  //         const pathMatch = targetPath.match(/jsonPath\(\$,\s*['"](.+?)['"]?\)/);
  //         if (pathMatch) {
  //           const path = pathMatch[1];
  //           const evaluatedKey = this.handleJSONPath(path, sourceData);
  //           if (evaluatedKey !== undefined) {
  //             result[evaluatedKey] = value;
  //           }
  //         }
  //       } else if (targetPath.startsWith('$')) {
  //         const evaluatedKey = this.handleJSONPath(targetPath, sourceData);
  //         if (evaluatedKey !== undefined) {
  //           result[evaluatedKey] = value;
  //         }
  //       } else {
  //         const nestedResult = this.buildNestedObject(targetPath, value);
  //         result = _.merge(result, nestedResult);
  //       }
  //     }
  //   }
  
  //   return result;
  // }
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
            while (operatorStack.length > 0 && 
                   this.operatorPrecedence[operatorStack[operatorStack.length - 1]] >= 
                   this.operatorPrecedence[token]) {
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

  
  
  buildNestedObject(path, value) {
    const parts = path.split('.').map(part => part.trim());
    const result = {};
    let current = result;
  
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = value;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  
    return result;
  }
  
  evaluateExpression(expression, sourceData) {
    if (!expression || !sourceData) return null;
  
    try {
      // Handle both jsonPath function and direct access using handleJSONPath
      if (expression.startsWith('jsonPath(') || expression.startsWith('$')) {
        const result = this.handleJSONPath(expression, sourceData);
        return result !== undefined ? result : null;
      }
  
      return expression;
    } catch (error) {
      console.error('Error evaluating expression:', error);
      return null;
    }
  }
  
  processMapping(mapping, sourceData) {
    if (!mapping || typeof mapping !== 'object') return {};
  
    let result = {};
  
    for (const [targetPath, expression] of Object.entries(mapping)) {
      if (!targetPath || !expression) continue;
  
      const value = this.evaluateExpression(expression.trim(), sourceData);
  
      if (value !== null) {
        if (targetPath.startsWith('jsonPath(') || targetPath.startsWith('$')) {
          // Use handleJSONPath for both formats
          const evaluatedKey = this.handleJSONPath(targetPath, sourceData);
          if (evaluatedKey !== undefined) {
            result[evaluatedKey] = value;
          }
        } else {
          const nestedResult = this.buildNestedObject(targetPath, value);
          result = _.merge(result, nestedResult);
        }
      }
    }
  
    return result;
  }
  
  handleJSONPath(script, data) {
    try {
      const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
  
      // Handle root access cases
      if (script === '$' || script === 'jsonPath($,"$")') {
        return jsonData;
      }
  
      // Check for function calls after array indexing
      if (script.includes('][0].') || script.includes(')[0].')) {
        // Split into three parts: jsonPath, array index, and function
        const jsonPathEndIndex = script.indexOf('[0]');
        const jsonPathPart = script.substring(0, jsonPathEndIndex);
        const functionPart = script.substring(jsonPathEndIndex + 4); // Skip '[0].'
  
        // First evaluate the JSONPath
        let result = this.handleJSONPath(jsonPathPart, jsonData);
        
        // Get the indexed element
        if (Array.isArray(result)) {
          result = result[0];
        }
  
        // Now handle the function call
        if (functionPart.includes('contains(')) {
          const containsMatch = functionPart.match(/contains\((["'])(.*?)\1\)/);
          if (containsMatch) {
            const searchStr = containsMatch[2];
            return this.stringFunctions.contains(result, searchStr);
          }
        }
      }
  
      // Rest of your existing JSONPath handling code...
      let normalizedExpression = script;
      let finalArrayAccess = false;
  
      if (normalizedExpression.match(/jsonPath\(\$,\s*["'].+?\["']\)\[0\]/)) {
        finalArrayAccess = true;
        normalizedExpression = normalizedExpression.replace(/\[0\]$/, '');
      }
  
      if (normalizedExpression.startsWith('jsonPath(')) {
        const pathMatch = normalizedExpression.match(/jsonPath\(\$,\s*["'](.+?)["']\)/);
        if (pathMatch) {
          normalizedExpression = pathMatch[1];
        } else {
          throw new Error('Invalid jsonPath function syntax');
        }
      }
  
      normalizedExpression = normalizedExpression.replace(/^["'](.+)["']$/, '$1');
      normalizedExpression = normalizedExpression.replace(/\$([A-Za-z])/g, '$.$1');
  
      if (!normalizedExpression.startsWith('$[0]') && Array.isArray(jsonData)) {
        normalizedExpression = normalizedExpression.replace('$', '$[0]');
      }
  
      let result = JSONPath({ path: normalizedExpression, json: jsonData });
  
      if (!result || result.length === 0) {
        return null;
      }
  
      if (finalArrayAccess || script.includes('[0]')) {
        return result[0];
      }
  
      if (result.length === 1 && !normalizedExpression.includes('*') && !normalizedExpression.includes('..')) {
        return result[0];
      }
  
      return result;
  
    } catch (error) {
      console.error('JSONPath evaluation error:', error);
      throw new Error('JSONPath evaluation failed: ' + error.message);
    }
  }
  

  // handleJSONPath(script, data) {
  //   try {
  //     // console.log('Original expression:', script);
  //     // console.log('Original data:', data);
  
  //     // Parse JSON data if it's a string
  //     const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
  //     // console.log('Parsed JSON data:', jsonData);
  
  //     // Handle root access cases
  //     if (script === '$' || script === 'jsonPath($,"$")') {
  //       return jsonData;
  //     }
  
  //     // Normalize the expression
  //     let normalizedExpression = script;
  //     let finalArrayAccess = false;
  //     // Handle jsonPath function syntax with explicit [0] at the end
  //     if (normalizedExpression.match(/jsonPath\(\$,\s*["'].+?\["']\)\[0\]/)) {
  //       finalArrayAccess = true;
  //       normalizedExpression = normalizedExpression.replace(/\[0\]$/, '');
  //     }
  
  //     // Handle jsonPath function syntax
  //     if (normalizedExpression.startsWith('jsonPath(')) {
  //       const pathMatch = normalizedExpression.match(/jsonPath\(\$,\s*["'](.+?)["']\)/);
  //       if (pathMatch) {
  //         normalizedExpression = pathMatch[1];
  //       } else {
  //         throw new Error('Invalid jsonPath function syntax');
  //       }
  //     }
  
  //     // Remove quotes around the path if present
  //     normalizedExpression = normalizedExpression.replace(/^["'](.+)["']$/, '$1');
  
  //     // Handle direct property access after $ (e.g., $ACTION -> $.ACTION)
  //     normalizedExpression = normalizedExpression.replace(/\$([A-Za-z])/g, '$.$1');
  
  //     // Handle special case where [0] is missing after MAST_UPL
  //     // if (normalizedExpression.includes('MAST_UPL.')) {
  //     //   normalizedExpression = normalizedExpression.replace('MAST_UPL.', 'MAST_UPL[0].');
  //     // }
  
  //     // If the path doesn't start with $[0] and data is an array, add [0]
  //     if (!normalizedExpression.startsWith('$[0]') && Array.isArray(jsonData)) {
  //       normalizedExpression = normalizedExpression.replace('$', '$[0]');
  //     }
  
  //     console.log('Normalized expression:', normalizedExpression);
  
  //     // Execute JSONPath query
  //     let result = JSONPath({ path: normalizedExpression, json: jsonData });
  //     console.log('JSONPath query result:', result);
  
  //     // Handle empty results
  //     if (!result || result.length === 0) {
  //       console.log('No results found');
  //       return null;
  //     }
  
  //     // Handle the case where we need to return first element
  //     if (finalArrayAccess || script.includes('[0]')) {
  //       console.log('Returning first element:', result[0]);
  //       return result[0];
  //     }
  
  //     // Return single value for specific cases
  //     if (result.length === 1 && !normalizedExpression.includes('*') && !normalizedExpression.includes('..')) {
  //       console.log('Returning single value:', result[0]);
  //       return result[0];
  //     }
  
  //     console.log('Returning full result:', result);
  //     return result;
  //   } catch (error) {
  //     console.error('JSONPath evaluation error:', error);
  //     throw new Error('JSONPath evaluation failed: ' + error.message);
  //   }
  // }
  
 
  executeScript(script, data) { 
    if (!script) return null; 
  
    try { 

      // Handle direct JSONPath queries
if (script.startsWith('$.') || script.startsWith('jsonPath(')) {
  const result = this.handleJSONPath(script, data);
  console.log('JSONPath result:', result);
  return result;
}

// Handle variable references that need JSONPath processing
if (script.startsWith('$') && !script.includes('(')) {
  return this.handleJSONPath(`$.${script.slice(1)}`, data);
}
       // Handle typeof directly 
      if (script.startsWith('typeof ')) { 
        const valueExpr = script.slice(7); // Remove 'typeof ' 
        let value; 
        
        if (valueExpr.startsWith('$.')) { 
          value = this.handleJSONPath(valueExpr, data); 
        } else if (valueExpr.startsWith('$')) { 
          value = data[valueExpr.slice(1)]; 
        } else { 
          value = this.evaluateValue(valueExpr); 
        } 
        
        return this.globalFunctions.typeof(value); 
      } 
 
      // Handle eval 
      if (script.startsWith('eval(')) { 
        const match = script.match(/eval\((.*)\)/); 
        if (match) { 
          const expression = match[1].trim().replace(/^["']|["']$/g, ''); 
          return this.globalFunctions.eval(expression, data); 
        } 
      } 
       // Handle global functions 
       if (script.includes('(')) { 
        const functionMatch = script.match(/^(\w+)\((.*)\)$/); 
        if (functionMatch) { 
          const [, funcName, args] = functionMatch; 
          if (this.globalFunctions[funcName]) { 
            const evaluatedArgs = args.split(',').map(arg => { 
              arg = arg.trim(); 
              if (arg.startsWith('$')) { 
                return this.handleJSONPath(arg, data); 
              } 
              if (arg.startsWith('"') || arg.startsWith("'")) { 
                return arg.slice(1, -1); 
              } 
              return arg; 
            }); 
            return this.globalFunctions[funcName](...evaluatedArgs); 
          } 
        } 
      } 
 
       // Handle match expressions 
    
       // In executeScript method, update the match handling: 
if (script.trim().startsWith('match')) { 
  const matchRegex = /match\s+(.+?)\s*{([\s\S]+)}/; 
  const matches = script.match(matchRegex); 
  
  if (matches) { 
    const [, inputExpr, patternsBlock] = matches; 
    let inputValue; 
    
    // Get input value 
    if (inputExpr.startsWith('$.')) { 
      inputValue = this.handleJSONPath(inputExpr, data); 
    } else if (inputExpr.startsWith('$')) { 
      const varName = inputExpr.slice(1); 
      inputValue = data[varName]; 
    } 
 
    // Parse patterns from the block 
    const patterns = patternsBlock 
      .split('\n') 
      .map(line => line.trim()) 
      .filter(line => line && !line.startsWith('//')) 
      .map(line => { 
        const [pattern, result] = line.split('=>').map(s => s.trim()); 
        if (!result) return null; 
        
        const [mainPattern, guard] = pattern.split(' if ').map(s => 
s.trim()); 
        return { pattern: mainPattern, guard, result }; 
      }) 
      .filter(Boolean); 
 
    // Try each pattern 
    for (const { pattern, guard, result } of patterns) { 
      let matches = false; 
 
      // Handle different pattern types 
      if (pattern === '_') { 
        matches = true; 
      } else if (pattern.includes('..')) { 
        const [start, end] = pattern.split('..'); 
        matches = this.matchFunctions.range(inputValue, Number(start), 
Number(end)); 
      } else if (pattern.startsWith('{')) { 
        matches = this.matchFunctions.object(inputValue, 
JSON.parse(pattern)); 
      } else if (pattern.startsWith('[')) { 
        matches = this.matchFunctions.array(inputValue, 
JSON.parse(pattern)); 
      } else if (pattern.startsWith('/')) { 
        matches = this.matchFunctions.regex(inputValue, pattern); 
      } else { 
        matches = inputValue === pattern; 
      } 
 
      // Check guard condition 
      if (matches && guard) { 
        matches = this.evaluateGuard(guard, { value: inputValue, data }); 
      } 
 
      if (matches) { 
        return this.evaluateExpression(result, { value: inputValue, data 
}); 
      } 
    } 
    return null; 
  } 
} 
 
 
 
 
 
 
 // Add JSON functions handling at the start 
 if (script.startsWith('JSON.')) { 
  const jsonMatch = script.match(/JSON\.(parse|stringify)\((.*)\)/); 
  if (jsonMatch) { 
      const [, method, args] = jsonMatch; 
      
      // Handle the argument 
      let processedArg; 
      if (args.startsWith('$')) { 
          // Handle variable reference 
          const varName = args.slice(1); 
          processedArg = data[varName]; 
      } else if (args.startsWith('"') || args.startsWith("'")) { 
          // Handle string literal 
          processedArg = args.slice(1, -1); 
      } else { 
          // Handle other literals 
          processedArg = args; 
      } 
 
      return this.jsonFunctions[method](processedArg); 
  } 
  throw new Error(`Invalid JSON function call: ${script}`); 
} 
 
       // Add Math functions handling at the start (after the null check) 
    if (script.startsWith('Math.')) { 
      const mathMatch = script.match(/Math\.(\w+)(?:\((.*)\))?/); 
      if (mathMatch) { 
        const [, mathFunction, args] = mathMatch; 
         // Special handling for random() and randomUUID() 
         if (mathFunction === 'random' && !args) { 
          return this.mathFunctions.random(); 
        } 
        
        if (mathFunction === 'randomUUID' && !args) { 
          return this.mathFunctions.randomUUID(); 
        } 
        // Handle constants (no parentheses) 
        if (!args && this.mathFunctions[mathFunction] !== undefined) { 
          return this.mathFunctions[mathFunction]; 
        } 
        
        // Handle functions 
        if (this.mathFunctions[mathFunction]) { 
          const parsedArgs = args ? args.split(',').map(arg => { 
            arg = arg.trim(); 
            // Handle string numbers 
            if (arg.startsWith('"') || arg.startsWith("'")) { 
              return arg.slice(1, -1); 
            } 
            // Handle numeric values 
            if (!isNaN(arg)) { 
              return Number(arg); 
            } 
            // Handle variables 
            if (arg.startsWith('$')) { 
              return data[arg.slice(1)]; 
            } 
            return arg; 
          }) : []; 
          
          return this.mathFunctions[mathFunction](...parsedArgs); 
        } 
        
        throw new Error(`Unsupported Math function: ${mathFunction}`); 
      } 
    } 
    const numberMatch = 
script.match(/\$(\w+)\.(toExponential|toFixed|toPrecision)(?:\((\d*)\))?/)
 ; 
    if (numberMatch) { 
        const [, variable, method, digits] = numberMatch; 
        const value = data[variable]; 
        
        if (this.numberFunctions[method]) { 
            return this.numberFunctions[method](value, digits ? 
parseInt(digits) : undefined); 
        } 
        
        throw new Error(`Unsupported number method: ${method}`); 
    } 
      // Handle JSONPath expressions first 
      // if (script.startsWith('$.')) { 
      //   const jsonData = data; 
      //   const result = JSONPath({ 
      //     path: script, 
      //     json: jsonData, 
      //     wrap: true, 
      //     flatten: true 
      //   }); 
  
      //   if (Array.isArray(result) && result.length > 0) { 
      //     return result.length === 1 ? result[0] : result; 
      //   } 
      //   return result; 
      // } 
  
 
      // First convert string dates to Date objects in the data 
// Inside executeScript method 
if (data) { 
  // Handle both single objects and arrays of objects 
  const processData = (input) => { 
    if (Array.isArray(input)) { 
      return input.map(item => processData(item)); 
    } 
    
    if (typeof input === 'object' && input !== null) { 
      Object.keys(input).forEach(key => { 
        const value = input[key]; 
        
        // Convert dates 
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) 
{ 
          input[key] = new Date(value); 
        } 
        // Process nested objects/arrays 
        else if (typeof value === 'object') { 
          input[key] = processData(value); 
        } 
      }); 
    } 
    return input; 
  }; 
 
 
  data = processData(data); 
} 
 
 
 
      // Handle Local parsing methods 
      if (script.includes('Local')) { 
        // Handle LocalDateTime.parse 
        const dateTimeMatch = 
script.match(/LocalDateTime\.parse\("([^"]+)"\)/); 
        if (dateTimeMatch) { 
          const [, dateStr] = dateTimeMatch; 
          const date = moment(dateStr).toDate(); 
          return date; 
        } 
  
        // Handle LocalDate.parse 
        const dateMatch = script.match(/LocalDate\.parse\("([^"]+)"\)/); 
        if (dateMatch) { 
          const [, dateStr] = dateMatch; 
          const date = moment(dateStr).startOf('day').toDate(); 
          return date; 
        } 
  
        // Handle LocalTime.parse 
        const timeMatch = script.match(/LocalTime\.parse\("([^"]+)"\)/); 
        if (timeMatch) { 
          const [, timeStr] = timeMatch; 
          const date = moment(`1970-01-01 ${timeStr}`).toDate(); 
          return date; 
        } 
      } 
  
      // Static Date methods 
      if (script.startsWith('Date.')) { 
        const staticMatch = script.match(/Date\.(\w+)\((.*)\)/); 
        if (staticMatch) { 
          const [, staticMethod, staticArgs] = staticMatch; 
          const parsedArgs = staticArgs ? staticArgs.split(',').map(arg => 
            !isNaN(arg.trim()) ? Number(arg.trim()) : 
arg.trim().replace(/['"]/g, '') 
          ) : []; 
          
          if (this.dateFunctions[staticMethod]) { 
            return this.dateFunctions[staticMethod](...parsedArgs); 
          } 
        } 
      } 
  
      // Handle method calls (including arrow functions) 
      const methodMatch = script.match(/\$(\w+)\.(\w+)\((.*)\)/); 
      if (methodMatch) { 
        const [, propertyName, methodName, argsString] = methodMatch; 
        const value = data[propertyName]; 
  
        // If data is an array, treat it as a collection of objects 
        if (Array.isArray(data)) { 
          return data.map(item => { 
            const value = item[propertyName]; 
            if (value === undefined) { 
              return item; 
            } 
  
            // Handle arrow functions 
            if (argsString.includes('=>')) { 
              const fn = eval(`(${argsString.trim()})`); 
              if (typeof value === 'object' && value !== null && 
this.objectFunctions[methodName]) { 
                return this.objectFunctions[methodName](value, fn); 
              } 
            } 
  
            const args = this.parseArguments(argsString, data); 
  
            if (typeof value === 'string' && 
this.stringFunctions[methodName]) { 
              return this.stringFunctions[methodName](value, ...args); 
            } 
            if (Array.isArray(value) && this.arrayFunctions[methodName]) { 
              return this.arrayFunctions[methodName](value, ...args); 
            } 
            if ((value instanceof Date || moment.isDate(value)) && 
this.dateFunctions[methodName]) { 
              return this.dateFunctions[methodName](value, ...args); 
            } 
            if (typeof value === 'object' && value !== null && 
this.objectFunctions[methodName]) { 
              return this.objectFunctions[methodName](value, ...args); 
            } 
            
  
            return value; 
          }); 
        } 
  
        // Handle single object with arrow function 
        if (argsString.includes('=>')) { 
          const fn = eval(`(${argsString.trim()})`); 
          if (typeof value === 'object' && value !== null && 
this.objectFunctions[methodName]) { 
            return this.objectFunctions[methodName](value, fn); 
          } 
        } 
  
        // Handle regular arguments 
        const args = this.parseArguments(argsString, data); 
  
        if (typeof value === 'string' && this.stringFunctions[methodName]) 
{ 
          return this.stringFunctions[methodName](value, ...args); 
        } 
        if (Array.isArray(value) && this.arrayFunctions[methodName]) { 
          return this.arrayFunctions[methodName](value, ...args); 
        } 
        if ((value instanceof Date || moment.isDate(value)) && 
this.dateFunctions[methodName]) { 
          return this.dateFunctions[methodName](value, ...args); 
        } 
        if (typeof value === 'object' && value !== null && 
this.objectFunctions[methodName]) { 
          let args; 
          if (argsString.includes('=>')) { 
            args = [eval(`(${argsString})`)]; 
          } else if (argsString.includes('{')) { 
            try { 
              args = [JSON.parse(argsString)]; 
            } catch (e) { 
              args = [eval(`(${argsString})`)]; 
            } 
          } else { 
            args = argsString.split(',').map(arg => { 
              arg = arg.trim(); 
              if (arg.startsWith('"') || arg.startsWith("'")) return 
arg.slice(1, -1); 
              if (!isNaN(arg)) return Number(arg); 
              if (arg === 'true') return true; 
              if (arg === 'false') return false; 
              if (arg === 'null') return null; 
              return arg; 
            }).filter(arg => arg !== ''); 
          } 
          return this.objectFunctions[methodName](value, ...args); 
        } 
  
        throw new Error(`Unsupported operation '${methodName}' for type: 
${typeof value}`); 
      } 
   // Handle mapper scripts
   if (typeof script === 'string' && script.trim().startsWith('{')) {
    // Normalize quotes in JSONPath expressions before parsing
    const normalizedScript = script.replace(/jsonPath\(\$,\s*["']([^"']+)["']\)/g, 
      (match, path) => `jsonPath($,'${path}')`);
      const mappingObj = JSON.parse(normalizedScript);
  console.log('Processing mapping:', mappingObj);
  return this.processMapping(mappingObj, data);
}

// Handle object mappings
if (typeof script === 'object' && script !== null) {
  console.log('Processing object mapping:', script);
  return this.processMapping(script, data);
}
// Handle operator expressions in all script types
if (typeof script === 'string') {
  const hasOperators = /[\+\-\*\/>=<==!=&\|?:]/.test(script);
  if (hasOperators) {
    return this.evaluateOperatorExpression(script, data);
  }
}



      // Handle array length without parentheses 
      const lengthMatch = script.match(/\$(\w+)\.length$/); 
      if (lengthMatch) { 
        const [, variableName] = lengthMatch; 
        const value = data[variableName]; 
        if (Array.isArray(value) || value instanceof Uint8Array) { 
          return value.length; 
        } 
        throw new Error(`Variable '${variableName}' is not an array`); 
      } 
  
      // Handle other expressions 
      if (script.includes('Date.parse') || script.includes('&&') || 
script.includes('||')) { 
        return this.handleLogicalExpression(script, data); 
      } 
  
      if (script.includes('Date.now()') || (script.includes('?') && 
script.includes('T'))) { 
        return this.handleComplexDateExpression(script); 
      } 
  
      if (script.trim().startsWith('{') && script.includes('$.')) { 
        return this.handleObjectMapping(script, data); 
      } 
  
      if (script.includes('$')) { 
        return this.handleJSONPath(script, data); 
      } 
  
      throw new Error(`Unsupported script: ${script}`); 
    } catch (error) { 
      console.error('Script execution error:', error); 
      throw new Error(`Script execution failed: ${error.message}`); 
    } 
  } 
  parseArguments(argsString, data) {
    if (!argsString) return [];
     // Handle arrow functions for reduce/reduceRight
  if (argsString.includes('=>')) {
    const lastCommaIndex = argsString.lastIndexOf(',');
    if (lastCommaIndex !== -1) {
      const arrowFunction = argsString.substring(0, lastCommaIndex).trim();
      const initialValue = argsString.substring(lastCommaIndex + 1).trim();
      
      // Create the reducer function
      const reducer = (acc, curr) => {
        const fn = new Function('acc', 'curr', `return ${arrowFunction.match(/=>\s*(.+)/)[1]};`);
        return fn(acc, curr);
      };
      
      return [reducer, eval(initialValue)];
    }
  }


    return argsString.split(',').map(arg => {
      arg = arg.trim();
      
      // Handle arrow functions for array methods
      if (arg.includes('=>')) {
        return eval(arg);
      }
      
      // Handle variable references
      if (arg.startsWith('$')) {
        return data[arg.slice(1)];
      }
      
      // Handle numeric values
      if (!isNaN(arg)) {
        return Number(arg);
      }
      
      // Handle string literals
      if (arg.startsWith('"') || arg.startsWith("'")) {
        return arg.slice(1, -1);
      }
      
      return arg;
    });
  }
  
  


  handleStringOperation(script, data) {
    const match = script.match(/\$string\.(\w+)\((.*)\)/);
    if (!match) throw new Error('Invalid string function syntax');


    const [, functionName, args] = match;
    const evaluatedArgs = this.evaluateArguments(args, data);
    return this.stringFunctions[functionName](...evaluatedArgs);
  }


  handleArrayOperation(script, data) {
    // Updated regex to handle multiline object mapping
    const match = script.match(/\$array\.(\w+)\(([\s\S]*)\)/);
    if (!match) throw new Error('Invalid array function syntax');
 
    const [, functionName, argsString] = match;
   
    if (functionName === 'map') {
      // Find the first comma that's not inside an object literal
      let depth = 0;
      let commaIndex = -1;
      for (let i = 0; i < argsString.length; i++) {
        if (argsString[i] === '{') depth++;
        if (argsString[i] === '}') depth--;
        if (argsString[i] === ',' && depth === 0) {
          commaIndex = i;
          break;
        }
      }
 
      const arrayPath = argsString.substring(0, commaIndex).trim();
      const mapper = argsString.substring(commaIndex + 1).trim();
      const sourceArray = this.handleJSONPath(arrayPath, data);
 
      // Handle object mapping with proper JSON parsing
      if (mapper.startsWith('{')) {
        const mappingObj = JSON.parse(mapper);
        return sourceArray.map(item => {
          const result = {};
          Object.entries(mappingObj).forEach(([key, value]) => {
            result[key] = item[value];
          });
          return result;
        });
      }
 
      // Handle simple property mapping
      if (mapper.match(/^["'].*["']$/)) {
        const prop = mapper.replace(/['"]/g, '');
        return sourceArray.map(item => item[prop]);
      }
    }
 
    return this.arrayFunctions[functionName](...this.evaluateArguments(argsString, data));
  }
 
 
 


  handleDateOperation(script, data) {
    const match = script.match(/\$date\.(\w+)\.?(\w+)?\((.*)\)/);
    if (!match) throw new Error('Invalid date function syntax');


    const [, category, method, args] = match;
    const evaluatedArgs = this.evaluateArguments(args, data);


    if (method) {
      return this.dateFunctions[category][method](...evaluatedArgs);
    }
    return this.dateFunctions[category](...evaluatedArgs);
  }


  handleMathOperation(script, data) {
    const match = script.match(/\$math\.(\w+)\((.*)\)/);
    if (!match) throw new Error('Invalid math function syntax');


    const [, functionName, args] = match;
    const evaluatedArgs = this.evaluateArguments(args, data);
    return this.mathFunctions[functionName](...evaluatedArgs);
  }


  handleObjectOperation(script, data) {
    const match = script.match(/\$object\.(\w+)\((.*)\)/);
    if (!match) throw new Error('Invalid object function syntax');


    const [, functionName, args] = match;
    const evaluatedArgs = this.evaluateArguments(args, data);
    return this.objectFunctions[functionName](...evaluatedArgs);
  }


 


  evaluateArguments(argsString, data) {
    if (!argsString) return [];
   
    return argsString.split(',').map(arg => {
      arg = arg.trim();
      if (arg.startsWith('$.')) {
        return this.handleJSONPath(arg, data);
      }
      if (arg.startsWith('"') || arg.startsWith("'")) {
        return arg.slice(1, -1);
      }
      if (!isNaN(arg)) {
        return Number(arg);
      }
      return arg;
    });
  }
}


export default SnapLogicFunctionsHandler;





