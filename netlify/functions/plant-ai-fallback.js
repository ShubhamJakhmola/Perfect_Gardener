import { createResponse } from './utils/db.js';

/**
 * Perplexity AI Fallback for Plant Queries
 * Used when plant data is not found in local database
 * Uses PERPLEX_API environment variable
 */
export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return createResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { query, plantName, context } = body;

    if (!query && !plantName) {
      return createResponse(400, { error: 'Query or plantName is required' });
    }

    const perplexApiKey = process.env.PERPLEX_API;
    if (!perplexApiKey) {
      console.error('PERPLEX_API environment variable is not set');
      return createResponse(500, { 
        error: 'AI service is not configured. Please contact the administrator.' 
      });
    }

    // Build a helpful prompt based on the query
    const searchQuery = query || plantName;
    const contextInfo = context ? `Context: ${context}. ` : '';
    
    const prompt = `You are a horticulture and gardening expert specializing in Indian home gardening.

${contextInfo}User is asking about: "${searchQuery}"

Provide a helpful, user-friendly response about this plant or gardening topic. Include:
- Basic information about the plant/topic
- Growing tips relevant to Indian climate
- Common care requirements
- Any relevant advice for home gardeners

Keep the response concise (2-3 paragraphs), practical, and easy to understand.`;

    const response = await fetch(
      'https://api.perplexity.ai/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${perplexApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 500
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', response.status, errorData);
      return createResponse(500, { 
        error: 'Failed to get AI response. Please try again later.' 
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return createResponse(500, { 
        error: 'No response from AI service. Please try again.' 
      });
    }

    return createResponse(200, {
      success: true,
      response: aiResponse,
      source: 'ai_fallback'
    });
  } catch (error) {
    console.error('Plant AI Fallback error:', error);
    return createResponse(500, { 
      error: 'An error occurred while processing your request. Please try again later.',
      message: error.message 
    });
  }
};

