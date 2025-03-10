
// Function to evaluate script expressions against JSON payload
export const evaluateScriptExpression = (script, jsonData) => {
  if (!script || script.trim() === '') {
    return null;
  }

  // Handle the special $ reference to the entire object
  if (script.trim() === '$') {
    return jsonData;
  }

  try {
    // Simple property access expressions ($.property or $['property'])
    if (script.startsWith('$.') || script.startsWith('$[')) {
      return evaluateJsonPathExpression(script, jsonData);
    }

    // For Date.parse expressions (custom handling)
    if (script.includes('Date.parse') || script.includes('$Event') || script.includes('$') && (script.includes('==') || script.includes('&&') || script.includes('||'))) {
      return evaluateOperatorExpression(script, jsonData);
    }

    // For JavaScript expressions that don't start with $
    if (!script.includes('$')) {
      // Execute the script as JavaScript code
      return evaluateJavaScriptExpression(script);
    }

    // Default: try to execute as a standard script
    return evaluateStandardExpression(script, jsonData);
  } catch (error) {
    console.error("Script evaluation error:", error);
    throw new Error(`Error evaluating script: ${error.message}`);
  }
};

// Handle JSONPath-like expressions
const evaluateJsonPathExpression = (expression, jsonData) => {
  // Remove the $ at the beginning
  const path = expression.slice(1);
  
  // Simple implementation to navigate object using path
  let result = jsonData;
  
  // Handle both dot notation and bracket notation
  const segments = path.split(/\.|\[['"]?|['"]?\]/g).filter(Boolean);
  
  for (const segment of segments) {
    if (result === undefined || result === null) {
      return undefined;
    }
    
    const cleanSegment = segment.trim();
    if (cleanSegment) {
      result = result[cleanSegment];
    }
  }
  
  return result;
};

// Handle expressions with operators (==, !=, &&, ||, etc.)
const evaluateOperatorExpression = (expression, jsonData) => {
  // Replace JSONPath expressions with actual values
  let processedExpression = expression;
  
  // Handle Date.parse($EffectiveMoment) style expressions
  if (expression.includes('Date.parse($EffectiveMoment)')) {
    const effectiveMoment = jsonData.EffectiveMoment || new Date().toISOString();
    processedExpression = processedExpression.replace(/Date\.parse\(\$EffectiveMoment\)/g, `Date.parse('${effectiveMoment}')`);
  }
  
  // Handle Date.now() expressions
  if (expression.includes('Date.now()')) {
    processedExpression = processedExpression.replace(/Date\.now\(\)/g, Date.now().toString());
  }
  
  // Handle $EventLiteTypeID == "Time Off Entry" style expressions
  if (expression.includes('$EventLiteTypeID') || expression.includes('$Event')) {
    const eventLiteTypeID = jsonData.EventLiteTypeID || '';
    processedExpression = processedExpression.replace(/\$EventLiteTypeID/g, `"${eventLiteTypeID}"`);
    
    const event = jsonData.Event || '';
    processedExpression = processedExpression.replace(/\$Event/g, `"${event}"`);
  }
  
  // Handle script like Date.parse($EffectiveMoment) <= Date.now() && ($EventLiteTypeID == "Time Off Entry" || $EventLiteTypeID == "Request Time Off" || $EventLiteTypeID == "Timesheet Review Event" || $EventLiteTypeID == "Correct Time Off" || $Event == "Time Off Entry" || $Event == "Request Time Off" || $Event == "Timesheet Review Event" || $Event == "Correct Time Off")
  if (expression.includes('$EffectiveMoment') && (expression.includes('$EventLiteTypeID') || expression.includes('$Event'))) {
    // Replace $EffectiveMoment with its value
    const effectiveMoment = jsonData.EffectiveMoment || new Date().toISOString();
    processedExpression = processedExpression.replace(/\$EffectiveMoment/g, `'${effectiveMoment}'`);
    
    // Replace $EventLiteTypeID with its value
    const eventLiteTypeID = jsonData.EventLiteTypeID || '';
    processedExpression = processedExpression.replace(/\$EventLiteTypeID/g, `"${eventLiteTypeID}"`);
    
    // Replace $Event with its value
    const event = jsonData.Event || '';
    processedExpression = processedExpression.replace(/\$Event/g, `"${event}"`);
  }
  
  // Handle other $ references to jsonData properties
  const dollarRefs = processedExpression.match(/\$[a-zA-Z0-9_.]*/g) || [];
  for (const ref of dollarRefs) {
    if (ref === '$') continue; // Skip lone $ symbols
    
    const path = ref.substring(1); // Remove the $ prefix
    let value = jsonData;
    
    // Navigate the object path
    const pathParts = path.split('.');
    for (const part of pathParts) {
      value = value && typeof value === 'object' ? value[part] : undefined;
    }
    
    // Replace with the actual value, handling different types appropriately
    if (value === undefined) {
      processedExpression = processedExpression.replace(new RegExp('\\' + ref, 'g'), 'undefined');
    } else if (typeof value === 'string') {
      processedExpression = processedExpression.replace(new RegExp('\\' + ref, 'g'), `"${value}"`);
    } else if (typeof value === 'object') {
      processedExpression = processedExpression.replace(new RegExp('\\' + ref, 'g'), JSON.stringify(value));
    } else {
      processedExpression = processedExpression.replace(new RegExp('\\' + ref, 'g'), value);
    }
  }
  
  // Evaluate the processed expression
  try {
    // Use Function constructor to evaluate expression safely
    const result = new Function(`return ${processedExpression}`)();
    return result;
  } catch (error) {
    console.error("Error evaluating operator expression:", error);
    throw new Error(`Invalid expression: ${expression}`);
  }
};

// Handle standard JavaScript expressions
const evaluateJavaScriptExpression = (expression) => {
  try {
    // Use Function constructor to evaluate the JavaScript expression
    return new Function(`return ${expression}`)();
  } catch (error) {
    console.error("Error evaluating JavaScript expression:", error);
    throw new Error(`Invalid JavaScript expression: ${expression}`);
  }
};

// Handle standard expressions that may include custom functions
const evaluateStandardExpression = (expression, jsonData) => {
  try {
    // Create a function that has access to jsonData through the $ variable
    const func = new Function('$', `return ${expression}`);
    return func(jsonData);
  } catch (error) {
    console.error("Error evaluating standard expression:", error);
    throw new Error(`Invalid expression: ${expression}`);
  }
};
