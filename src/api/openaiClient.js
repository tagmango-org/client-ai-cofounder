import OpenAI from 'openai';

// Initialize OpenAI client
// You'll need to set your OpenAI API key as an environment variable
// or replace this with your actual API key
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should use a backend proxy
});

// Check if API key is configured
if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-api-key-here') {
  console.warn('⚠️ OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your environment or update the openaiClient.js file.');
}

/**
 * Invoke OpenAI LLM with the provided payload
 * @param {Object} payload - The LLM payload
 * @param {string} payload.prompt - The prompt to send to the LLM
 * @param {Object} payload.response_json_schema - The JSON schema for the response
 * @returns {Promise<Object>} The LLM response
 */
export const InvokeLLM = async (payload) => {
  try {
    console.log('🚀 Invoking OpenAI LLM with payload:', payload);
    
    const { prompt, response_json_schema } = payload;
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Construct the system message to ensure JSON response
    const systemMessage = `You are a helpful AI assistant that responds in JSON format according to the provided schema. 
    
    Response Schema:
    ${JSON.stringify(response_json_schema, null, 2)}
    
    IMPORTANT: 
    - Your response must be valid JSON that conforms exactly to this schema
    - The "ai_response_text" field must contain the conversational response as a string
    - Do not include any text outside the JSON structure
    - Ensure all text responses are properly escaped for JSON
    
    Example response format:
    {
      "ai_response_text": "Your conversational response here as a string",
      "action": null,
      "course_creation_data": null,
      "coupon_creation_data": null,
      "post_creation_data": null,
      "service_creation_data": null,
      "workshop_creation_data": null
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4 Turbo for better performance and JSON mode support
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }, // Ensures JSON response
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content received from OpenAI');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
      console.log('✅ Parsed OpenAI response:', parsedResponse);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response:', content);
      
      // Return a fallback response structure instead of throwing
      return {
        ai_response_text: content || "I apologize, but I encountered an error processing your request.",
        action: null,
        course_creation_data: null,
        coupon_creation_data: null,
        post_creation_data: null,
        service_creation_data: null,
        workshop_creation_data: null
      };
    }

    // Validate the response structure
    if (typeof parsedResponse !== 'object' || parsedResponse === null) {
      console.error('❌ OpenAI returned non-object response:', parsedResponse);
      return {
        ai_response_text: "I apologize, but I encountered an error processing your request.",
        action: null,
        course_creation_data: null,
        coupon_creation_data: null,
        post_creation_data: null,
        service_creation_data: null,
        workshop_creation_data: null
      };
    }

    // Ensure ai_response_text is a string
    if (typeof parsedResponse.ai_response_text !== 'string') {
      console.warn('⚠️ ai_response_text is not a string:', parsedResponse.ai_response_text);
      parsedResponse.ai_response_text = String(parsedResponse.ai_response_text || "I'm not sure how to respond to that.");
    }

    console.log('✅ OpenAI LLM response received successfully');
    console.log('📊 Usage:', response.usage);
    
    return parsedResponse;

  } catch (error) {
    console.error('❌ OpenAI LLM invocation failed:', error);
    
    // Provide a helpful fallback response for common errors
    if (error.message?.includes('API key') || error.status === 401) {
      console.error('🔑 API Key Error: Please set a valid OpenAI API key');
      return {
        ai_response_text: "I'm currently unable to connect to OpenAI. Please check that a valid API key is configured.",
        action: null,
        course_creation_data: null,
        coupon_creation_data: null,
        post_creation_data: null,
        service_creation_data: null,
        workshop_creation_data: null
      };
    }
    
    // For other errors, provide a generic fallback
    return {
      ai_response_text: `I apologize, but I'm experiencing technical difficulties. Error: ${error.message || 'Unknown error'}`,
      action: null,
      course_creation_data: null,
      coupon_creation_data: null,
      post_creation_data: null,
      service_creation_data: null,
      workshop_creation_data: null
    };
  }
};

/**
 * Test function to verify OpenAI connection
 */
export const testOpenAIConnection = async () => {
  try {
    await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello! This is a test message." }],
      max_tokens: 50
    });
    
    console.log('✅ OpenAI connection test successful');
    return true;
  } catch (error) {
    console.error('❌ OpenAI connection test failed:', error);
    return false;
  }
};

// Export the OpenAI client for direct access if needed
export { openai };

// Debug logging
console.log('✅ OpenAI client initialized successfully');
console.log('🔑 API Key configured:', !!openai.apiKey);
