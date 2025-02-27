
export function transformData(inputData, transformLogic) {
  try {
    const parsedInput = JSON.parse(inputData);
    
    // Create a new function with the transform logic
    // This allows executing the user's transformation code safely
    const transformFunction = new Function('data', 'console', `
      ${transformLogic}
      return transform(data);
    `);
    
    // Execute the transformation function with the parsed input data
    return transformFunction(parsedInput, console);
  } catch (error) {
    console.error("Transformation error:", error);
    throw {
      error: "Transformation Error",
      message: error.message,
      hint: "Check input format and script syntax"
    };
  }
}

// Sample test data
export const sampleData = [
  {
    EffectiveMoment: "2024-04-10T10:00:00Z",
    EventLiteTypeID: "Time Off Entry",
    Event: "Time Off Entry"
  },
  {
    EffectiveMoment: "2025-04-15T10:00:00Z", // Future date
    EventLiteTypeID: "Request Time Off",
    Event: "Request Time Off"
  },
  {
    EffectiveMoment: "2024-04-08T10:00:00Z",
    EventLiteTypeID: "Timesheet Review Event",
    Event: null
  },
  {
    EffectiveMoment: "2024-04-09T10:00:00Z",
    EventLiteTypeID: null,
    Event: "Correct Time Off"
  }
];

// Sample transformation functions
export const sampleTransformations = {
  dateComparison: `
    function transform(data) {
      return data.filter(item => Date.parse(item.EffectiveMoment) <= Date.now());
    }
  `,
  
  eventTypeCheck: `
    function transform(data) {
      return data.filter(item => 
        (item.EventLiteTypeID === "Time Off Entry" || 
         item.EventLiteTypeID === "Request Time Off" ||
         item.EventLiteTypeID === "Timesheet Review Event" ||
         item.EventLiteTypeID === "Correct Time Off" ||
         item.Event === "Time Off Entry" ||
         item.Event === "Request Time Off" ||
         item.Event === "Timesheet Review Event" ||
         item.Event === "Correct Time Off")
      );
    }
  `,
  
  complexCondition: `
    function transform(data) {
      return data.filter(item => {
        const validDate = Date.parse(item.EffectiveMoment) <= Date.now();
        const validEventType = 
          item.EventLiteTypeID === "Time Off Entry" || 
          item.EventLiteTypeID === "Request Time Off" ||
          item.EventLiteTypeID === "Timesheet Review Event" ||
          item.EventLiteTypeID === "Correct Time Off" ||
          item.Event === "Time Off Entry" ||
          item.Event === "Request Time Off" ||
          item.Event === "Timesheet Review Event" ||
          item.Event === "Correct Time Off";
          
        return validDate && validEventType;
      });
    }
  `
};
