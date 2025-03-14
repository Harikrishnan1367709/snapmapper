export const evaluateOperatorExpression = (expression, data) => {
  try {
    // Handle special case for Date operations
    if (expression.includes('Date.parse') || expression.includes('Date.now')) {
      // Replace Date.parse with a safe parsing function
      expression = expression.replace(/Date\.parse\(\$([a-zA-Z0-9_]+)\)/g, (match, prop) => {
        const value = getPropValue(data, prop);
        if (!value) return 'null';
        try {
          return Date.parse(value);
        } catch (e) {
          console.error(`Error parsing date: ${value}`, e);
          return 'null';
        }
      });
      
      // Replace Date.now() with current timestamp
      expression = expression.replace(/Date\.now\(\)/g, Date.now());

      // Handle time-off entries and event types
      if (expression.includes('$EventLiteTypeID') || expression.includes('$Event')) {
        // Define the set of time-off related event types
        const timeOffEvents = [
          "Time Off Entry", 
          "Request Time Off", 
          "Timesheet Review Event", 
          "Correct Time Off"
        ];
        
        // Replace $EventLiteTypeID comparisons
        expression = expression.replace(/\$EventLiteTypeID\s*==\s*"([^"]+)"/g, (match, eventType) => {
          const eventValue = getPropValue(data, 'EventLiteTypeID');
          return eventValue === eventType ? 'true' : 'false';
        });
        
        // Replace $Event comparisons
        expression = expression.replace(/\$Event\s*==\s*"([^"]+)"/g, (match, eventType) => {
          const eventValue = getPropValue(data, 'Event');
          return eventValue === eventType ? 'true' : 'false';
        });
      }
    }
    
    // Continue with regular expression evaluation
    const transformExpression = (expr) => {
      let transformed = expr;
      if (!data) {
        return transformed;
      }
    
      Object.keys(data).forEach(key => {
        const placeholder = `\\$${key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`;
        const regex = new RegExp(placeholder, 'g');
        let value = data[key];
    
        if (typeof value === 'string') {
          value = `'${value.replace(/'/g, "\\'")}'`;
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
    
        transformed = transformed.replace(regex, value);
      });
    
      return transformed;
    };
    
    expression = transformExpression(expression);
    
    return evaluateExpression(expression);
  } catch (error) {
    console.error('Error evaluating expression:', error);
    return { error: `Error evaluating expression: ${error.message}` };
  }
};

// Helper function to get property value from data object
function getPropValue(data, propName) {
  return data[propName];
}

// Helper function to evaluate JavaScript expressions safely
function evaluateExpression(expr) {
  try {
    // Use Function constructor instead of eval for better security
    const func = new Function('return ' + expr);
    return func();
  } catch (error) {
    console.error('Error evaluating expression:', error);
    return { error: `Invalid expression: ${error.message}` };
  }
}
