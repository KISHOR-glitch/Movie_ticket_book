import express from 'express';
import { agentChat } from '../controllers/agentController.js';

const agentRouter = express.Router();

// POST /api/agent/chat
// Requires Clerk auth (clerkMiddleware is applied globally in server.js)
agentRouter.post('/chat', agentChat);

export default agentRouter;
