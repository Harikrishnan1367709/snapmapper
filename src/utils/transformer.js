
import { ScriptHandler } from './scriptHandler';
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

export function transformData(inputData, transformLogic) {
  try {
    const parsedInput = JSON.parse(inputData);
    const scriptHandler = new ScriptHandler(parsedInput);
    
    // Wrap the transform logic in a function that has access to the scriptHandler
    const transformFunction = new Function('data', 'scriptHandler', 'dayjs', `
      with (data) {
        ${transformLogic}
        return transform(data);
      }
    `);
    
    return transformFunction(parsedInput, scriptHandler, dayjs);
  } catch (error) {
    console.error('Transform error:', error);
    throw error;
  }
}
