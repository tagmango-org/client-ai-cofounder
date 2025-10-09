// OpenAI API integration to replace Base44 calls
export const API_BASE_URL =  'https://ai-cofounder-backend.onrender.com/api';

// Type definitions for API functions
interface InvokeLLMParams {
  userMessage: string;
  conversationHistory: any[];
  discoveryAnswers: any;
}

interface GenerateTitleParams {
  userText: string;
  aiText?: string;
}

interface GeneratePhaseInsightsParams {
  phaseAnswers: string;
  phaseTitle?: string;
}

interface GenerateProfileSynthesisParams {
  answers: any;
}

// Main LLM function to replace InvokeLLM
export const InvokeLLM = async ({ userMessage, conversationHistory, discoveryAnswers }: InvokeLLMParams) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        conversationHistory,
        discoveryAnswers
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling InvokeLLM:', error);
    throw error;
  }
};

// Generate conversation title
export const GenerateTitle = async ({ userText, aiText }: GenerateTitleParams) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate/title`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userText,
        aiText
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const title = await response.json();
    return title;
  } catch (error) {
    console.error('Error generating title:', error);
    throw error;
  }
};

// Generate phase insights for discovery
export const GeneratePhaseInsights = async ({ phaseAnswers, phaseTitle }: GeneratePhaseInsightsParams) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phaseAnswers,
        phaseTitle
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const insights = await response.json();
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
};

// Generate profile synthesis
export const GenerateProfileSynthesis = async ({ answers }: GenerateProfileSynthesisParams) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate/synthesis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const synthesis = await response.json();
    return synthesis;
  } catch (error) {
    console.error('Error generating synthesis:', error);
    throw error;
  }
};

// Placeholder functions for other Base44 integrations that might be used
export const UploadFile = async (file: File): Promise<any> => {
  // TODO: Implement file upload to your backend
  console.warn('UploadFile not yet implemented');
  throw new Error('UploadFile not yet implemented');
};

export const ExtractDataFromUploadedFile = async (fileId: string): Promise<any> => {
  // TODO: Implement file data extraction
  console.warn('ExtractDataFromUploadedFile not yet implemented');
  throw new Error('ExtractDataFromUploadedFile not yet implemented');
};

