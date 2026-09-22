import { ChatGroq } from '@langchain/groq';

/**
 * Creates and returns a configured ChatGroq instance
 * @param {object} options - Custom temperature or model overrides
 */
export function getGroqChatModel(options = {}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key' || apiKey.trim() === '') {
    console.warn('⚠️ [GroqService] GROQ_API_KEY is not set or using placeholder.');
  }

  return new ChatGroq({
    apiKey: apiKey || 'dummy-key-for-initialization',
    model: options.model || process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    temperature: options.temperature !== undefined ? options.temperature : 0.3,
    maxTokens: options.maxTokens || 2048
  });
}

/**
 * Helper to safely call Groq with error handling and simulated fallback if no API key
 */
export async function invokeGroq(messages, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key' || apiKey.trim() === '') {
    return {
      content: `[Demo Mode / API Key Required] To get live AI answers from Groq, please add your GROQ_API_KEY to the server/.env file. (Get a free key instantly at https://console.groq.com).\n\nHere is a preview response based on your query!`
    };
  }

  try {
    const model = getGroqChatModel(options);
    const response = await model.invoke(messages);
    return response;
  } catch (error) {
    console.error('Error invoking Groq:', error.message);
    throw error;
  }
}
