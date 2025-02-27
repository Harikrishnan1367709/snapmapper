export function transformData(inputData, transformLogic) {
    const parsedInput = JSON.parse(inputData)
    const transformFunction = new Function('data', transformLogic + '\nreturn transform(data);')
    return transformFunction(parsedInput)
  }
  
  