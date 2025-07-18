import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Timeout for API calls (15 seconds)
const API_TIMEOUT = 15000;

// Create a timeout promise
const timeoutPromise = (ms: number) => 
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timed out')), ms)
  );

const SYSTEM_PROMPT = `You are a helpful assistant specializing in Indian government schemes and women's safety programs. Be concise and direct in your responses. Your role is to:

1. Help users find relevant government schemes
2. Guide through application process
3. Provide eligibility criteria
4. Share contact information
5. Explain documentation needs
6. Give step-by-step guidance

Focus on schemes for:
- Women's safety
- Legal aid
- Financial assistance
- Education
- Healthcare
- Employment

Keep responses under 150 words and action-oriented.`;

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function generateResponse(messages: ChatMessage[]) {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Get the model with optimized settings
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro', // Using gemini-pro for better reliability
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 1024, // Reduced for faster responses
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    
    // Format history - only keep last 5 messages for context
    const recentMessages = messages.slice(-5);
    const chatHistory = recentMessages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Start chat with optimized settings
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });

    // If this is the first message, send a shortened system prompt
    if (!messages.find(m => m.role === 'system')) {
      const systemResult = await Promise.race([
        chat.sendMessage(SYSTEM_PROMPT),
        timeoutPromise(API_TIMEOUT)
      ]);
      
      if (!systemResult) {
        throw new Error('System prompt timeout');
      }
    }

    // Send the user's message with timeout
    const messageResult = await Promise.race([
      chat.sendMessage(messages[messages.length - 1].content),
      timeoutPromise(API_TIMEOUT)
    ]);

    if (!messageResult || !('response' in messageResult)) {
      throw new Error('Response timeout or invalid response');
    }

    const response = await messageResult.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from AI');
    }

    return text;
  } catch (error) {
    console.error('Error generating response:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Response took too long. Please try again.');
      }
      if (error.message.includes('API key')) {
        throw new Error('API key configuration error. Please check your environment variables.');
      }
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      throw new Error(`AI Error: ${error.message}`);
    }
    
    throw new Error('Failed to generate response. Please try again.');
  }
}

export async function searchSchemes(query: string) {
  const searchPrompt = `Briefly describe government schemes related to: ${query}
Include:
1. Name
2. Description
3. Eligibility
4. How to apply
5. Documents needed
6. Contact info

Keep response concise and clear.`;

  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro', // Using gemini-pro for better reliability
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    // Race between API call and timeout
    const result = await Promise.race([
      model.generateContent(searchPrompt),
      timeoutPromise(API_TIMEOUT)
    ]);

    if (!result || !('response' in result)) {
      throw new Error('Response timeout or invalid response');
    }

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from AI');
    }

    return text;
  } catch (error) {
    console.error('Error searching schemes:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Search took too long. Please try again.');
      }
      if (error.message.includes('API key')) {
        throw new Error('API key configuration error. Please check your environment variables.');
      }
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      throw new Error(`Search Error: ${error.message}`);
    }
    
    throw new Error('Failed to search schemes. Please try again.');
  }
} 