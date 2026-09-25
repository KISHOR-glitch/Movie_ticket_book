import axios from 'axios';
import { SYSTEM_PROMPT } from './prompts.js';
import { searchMovies, searchShows } from './tools.js';

// ─── Tool Declarations (OpenAI / OpenRouter function calling schema) ─────────

const tools = [
    {
        type: 'function',
        function: {
            name: 'search_movies',
            description: 'Search the QuickShow movie database by genre and/or title. Returns matching movies with their IDs.',
            parameters: {
                type: 'object',
                properties: {
                    genre: {
                        type: 'string',
                        description: 'Genre to filter by, e.g. "Comedy", "Action", "Drama", "Science Fiction". Case-insensitive.',
                    },
                    title: {
                        type: 'string',
                        description: 'Movie title keyword to search for. Case-insensitive partial match.',
                    },
                },
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'search_shows',
            description: 'Search upcoming movie shows by movie IDs, date, time range, and max ticket price. Returns shows with showId, movieId, title, showDateTime, price, and showDateStr for booking navigation.',
            parameters: {
                type: 'object',
                properties: {
                    movieIds: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Array of movie _id strings to find shows for. Get these from search_movies first.',
                    },
                    date: {
                        type: 'string',
                        description: 'Date for the show. Use "today", "tomorrow", or "YYYY-MM-DD" format.',
                    },
                    minTime: {
                        type: 'string',
                        description: 'Earliest allowed show start time in 24h HH:MM format. E.g. "19:00" for after 7 PM.',
                    },
                    maxTime: {
                        type: 'string',
                        description: 'Latest allowed show start time in 24h HH:MM format. Optional.',
                    },
                    maxPrice: {
                        type: 'number',
                        description: 'Maximum ticket price in the store currency. Filters shows where showPrice <= maxPrice.',
                    },
                    ticketCount: {
                        type: 'number',
                        description: 'Number of tickets/seats the user wants to book (1 to 5). Helps auto-recommend the best contiguous prime seats.',
                    },
                },
                required: ['date'],
            },
        },
    },
];

// ─── Tool Executor ───────────────────────────────────────────────────────────

async function executeTool(name, args) {
    switch (name) {
        case 'search_movies':
            return await searchMovies(args || {});
        case 'search_shows':
            return await searchShows(args || {});
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}

// ─── Main Agent Function ─────────────────────────────────────────────────────

/**
 * Runs the agent loop for a single user message using OpenRouter API.
 * Supports multi-turn function calling until the model returns a final text response.
 *
 * @param {string} userMessage - The user's natural language input
 * @param {Array}  history     - Prior conversation history in [{role, content}] format
 * @returns {{ message: string, shows: Array, history: Array }}
 */
export async function runAgent(userMessage, history = []) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const modelName = process.env.OPENROUTER_MODEL || 'openrouter/free';

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not configured in server/.env');
    }

    // Build the messages array for OpenAI/OpenRouter format
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: userMessage }
    ];

    let allShows = [];
    let finalMessage = '';

    // Loop up to 6 iterations for tool execution
    for (let iteration = 0; iteration < 6; iteration++) {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: modelName,
                messages: messages,
                tools: tools,
                tool_choice: 'auto',
                temperature: 0.2,
                max_tokens: 1024,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'QuickShow AI',
                },
                timeout: 30000,
            }
        );

        const choice = response.data.choices?.[0];
        const assistantMsg = choice?.message;

        if (!assistantMsg) {
            throw new Error('No response from AI model');
        }

        messages.push(assistantMsg);

        // Check if the model called any tools
        if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
            for (const toolCall of assistantMsg.tool_calls) {
                const name = toolCall.function.name;
                let parsedArgs = {};
                try {
                    parsedArgs = typeof toolCall.function.arguments === 'string'
                        ? JSON.parse(toolCall.function.arguments)
                        : (toolCall.function.arguments || {});
                } catch (e) {
                    parsedArgs = {};
                }

                let toolResult;
                try {
                    toolResult = await executeTool(name, parsedArgs);
                    if (name === 'search_shows' && Array.isArray(toolResult)) {
                        allShows = [...allShows, ...toolResult];
                    }
                } catch (err) {
                    toolResult = { error: err.message };
                }

                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: name,
                    content: JSON.stringify(toolResult),
                });
            }
        } else {
            // Final text response received
            finalMessage = assistantMsg.content || '';
            break;
        }
    }

    // Filter messages for compact client history storage
    const cleanHistory = messages
        .filter(m => m.role === 'user' || (m.role === 'assistant' && typeof m.content === 'string' && m.content.trim()))
        .map(m => ({ role: m.role, content: m.content }));

    return {
        message: finalMessage,
        shows: allShows,
        history: cleanHistory,
    };
}
