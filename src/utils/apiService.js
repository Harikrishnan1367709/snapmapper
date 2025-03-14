
import axios from 'axios';

// Configure base API client
const apiClient = axios.create({
  baseURL: 'https://api.snaplogic.com', // Replace with actual SnapLogic API URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Function to execute script directly (without validation)
export const executeScript = async (input, script) => {
  try {
    // Execute the script
    const response = await apiClient.post('/execute', {
      input,
      script
    });
    
    return {
      success: true,
      data: response.data,
      error: null
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message || 'Unknown error occurred'
    };
  }
};
