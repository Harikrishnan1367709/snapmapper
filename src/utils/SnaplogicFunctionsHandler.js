import { JSONPath } from 'jsonpath-plus';

export default class SnapLogicFunctionsHandler {
  executeScript(script, data) {
    try {
      if (script.startsWith('$')) {
        return this.executeJSONPath(script, data);
      } else if (script.includes('match')) {
        return this.executeMatch(script, data);
      } else {
        // For general JavaScript transformations
        const transformFunction = new Function('data', script);
        return transformFunction(data);
      }
    } catch (error) {
      return { 
        error: error.message,
        script: script,
        data: data
      };
    }
  }

  executeJSONPath(path, data) {
    try {
      const result = JSONPath({ path, json: data });
      return result.length === 0 ? null : result;
    } catch (error) {
      return { 
        error: `JSONPath Error: ${error.message}`,
        path: path,
        data: data
      };
    }
  }

  executeMatch(script, data) {
    try {
      const matchFunction = new Function('data', `
        const match = (value, patterns) => {
          for (const pattern of patterns) {
            if (pattern.when(value)) {
              return pattern.then(value);
            }
          }
          return value;
        };
        ${script}
        return match(data);
      `);
      return matchFunction(data);
    } catch (error) {
      return {
        error: `Match Error: ${error.message}`,
        script: script,
        data: data
      };
    }
  }
}
