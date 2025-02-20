
import { ScriptHandler } from './scriptHandler';

export function transformData(inputData, transformLogic) {
  try {
    const parsedInput = JSON.parse(inputData);
    const scriptHandler = new ScriptHandler(parsedInput);
    
    // Wrap the transform logic in a function that has access to the scriptHandler
    const transformFunction = new Function('data', 'scriptHandler', `
      with (data) {
        ${transformLogic}
        return transform(data);
      }
    `);
    
    return transformFunction(parsedInput, scriptHandler);
  } catch (error) {
    console.error('Transform error:', error);
    throw error;
  }
}
