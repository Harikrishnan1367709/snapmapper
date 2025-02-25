
export const handleJSON = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return { error: "Invalid JSON format" };
  }
};
