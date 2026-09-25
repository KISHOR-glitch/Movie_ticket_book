import { runAgent } from '../agent/agent.js';

/**
 * POST /api/agent/chat
 * Body: { message: string, history?: Array }
 *
 * Auth: Clerk token required (userId extracted server-side from req.auth())
 * The userId is NEVER taken from the request body for safety.
 */
export const agentChat = async (req, res) => {
    try {
        // Verify authenticated user (Clerk middleware populates req.auth())
        const auth = req.auth();
        if (!auth?.userId) {
            return res.json({ success: false, message: 'Authentication required.' });
        }

        const { message, history } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.json({ success: false, message: 'Message is required.' });
        }

        if (message.trim().length > 500) {
            return res.json({ success: false, message: 'Message too long (max 500 chars).' });
        }

        // Run the agent (read-only — no write operations permitted in tools)
        const result = await runAgent(message.trim(), history || []);

        return res.json({
            success: true,
            message: result.message,
            shows: result.shows,
            history: result.history,
        });

    } catch (error) {
        console.error('[AgentController] Error:', error.message);
        return res.json({ success: false, message: 'Agent error: ' + error.message });
    }
};
