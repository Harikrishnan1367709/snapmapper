
import axios from 'axios';

// Configure base API client
const apiClient = axios.create({
  baseURL: 'https://api.snaplogic.com', // Replace with actual SnapLogic API URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// ChatGPT API client
const openaiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to validate script with ChatGPT
export const validateScriptWithGPT = async (script) => {
  try {
    // You'll need to provide an API key for OpenAI
    const apiKey = process.env.OPENAI_API_KEY || localStorage.getItem('OPENAI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        data: null,
        error: 'OpenAI API key is missing. Please add it in the application settings.'
      };
    }

    const response = await openaiClient.post('/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a script validator for SnapLogic expressions. Analyze the script for syntax errors or logical issues. Return a JSON response with "valid" (boolean) and "error" (string or null) properties.'
        },
        {
          role: 'user',
          content: `Validate this script: \n\n${script}`
        }
      ],
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    try {
      // Try to parse the AI response as JSON
      const responseContent = response.data.choices[0].message.content;
      const validationResult = JSON.parse(responseContent);
      
      if (!validationResult.valid && validationResult.error) {
        return {
          success: false,
          data: null,
          error: validationResult.error
        };
      }
      
      return {
        success: true,
        data: { message: "Script validation passed" },
        error: null
      };
    } catch (parseError) {
      // If unable to parse AI response, return the raw text
      const responseText = response.data.choices[0].message.content;
      if (responseText.toLowerCase().includes('error') || responseText.toLowerCase().includes('invalid')) {
        return {
          success: false,
          data: null,
          error: responseText
        };
      }
      return {
        success: true,
        data: { message: "Script validation passed" },
        error: null
      };
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message || 'Error validating script with GPT'
    };
  }
};

export const executeScript = async (input, script) => {
  try {
    // First validate the script with GPT
    const validationResult = await validateScriptWithGPT(script);
    
    // If validation fails, return the error
    if (!validationResult.success) {
      return validationResult;
    }
    
    // If validation passes, execute the script
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
