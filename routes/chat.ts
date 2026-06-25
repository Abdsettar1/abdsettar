import { Router } from 'express';
import { body } from 'express-validator';
import { jackChat, leoResearch } from '../services/gemini.js';
import { validateRequest } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';

const router = Router();

// POST /api/chat/jack — Main Jack chat endpoint
router.post('/jack',
  body('message').isString().trim().notEmpty().isLength({ max: 2000 }),
  body('sessionId').isString().trim().notEmpty(),
  validateRequest,
  async (req, res) => {
    const { message, sessionId } = req.body;

    try {
      const response = await jackChat(message, sessionId);
      res.json({ success: true, response, timestamp: new Date().toISOString() });
    } catch (error: any) {
      logger.error('Jack chat error:', error);
      res.status(500).json({
        error: 'Jack is temporarily unavailable',
        fallback: {
          message: "The squad is being briefed. Give me a moment and try again.",
          assignedAgents: [],
          intent: 'general',
          nextStep: 'none',
        },
      });
    }
  }
);

// POST /api/chat/research — Leo's product research
router.post('/research',
  body('niche').isString().trim().notEmpty(),
  body('budget').isString().trim().notEmpty(),
  body('market').isString().trim().notEmpty(),
  validateRequest,
  async (req, res) => {
    const { niche, budget, market } = req.body;

    try {
      const research = await leoResearch(niche, budget, market);
      res.json({ success: true, research, timestamp: new Date().toISOString() });
    } catch (error: any) {
      logger.error('Leo research error:', error);
      res.status(500).json({ error: 'Product research temporarily unavailable' });
    }
  }
);

export default router;
