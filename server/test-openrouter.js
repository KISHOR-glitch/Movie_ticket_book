import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const tools = [
  {
    type: 'function',
    function: {
      name: 'search_movies',
      description: 'Search movies by genre or title keyword.',
      parameters: {
        type: 'object',
        properties: {
          genre: { type: 'string', description: 'Genre name' },
          title: { type: 'string', description: 'Movie title keyword' }
        }
      }
    }
  }
];

async function testTools() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: process.env.OPENROUTER_MODEL || 'openrouter/free',
      messages: [
        { role: 'system', content: 'You are a movie booking assistant. Call search_movies when the user asks for movies.' },
        { role: 'user', content: 'Find comedy movies' }
      ],
      tools: tools,
      tool_choice: 'auto'
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'QuickShow'
      }
    }
  );

  console.log("Response message:", JSON.stringify(res.data.choices[0].message, null, 2));
}

testTools().catch(e => console.error("Error:", e.response?.data || e.message));
