
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

export function handleDateExpressions(expression, evaluateValue, formatDate) {
  const dateRegex = /Date\.(now|parse)\(([^)]*)\)(?:\.(\w+)\([^)]*\))?/g;
  return expression.replace(dateRegex, (match, method, args, chainedMethod) => {
    try {
      let date = method === 'now' ? new Date() : new Date(evaluateValue(args));
      
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
              return `"${formatDate(date, format)}"`;
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

export function formatDate(date, format) {
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
