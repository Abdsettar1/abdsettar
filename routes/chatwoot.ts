import { Router } from 'express';
import { yunaRespond } from '../services/gemini.js';
import { sendMessage, getConversation, getInboxes } from '../services/chatwoot.js';
import { logger } from '../utils/logger.js';

const router = Router();

// POST /api/chatwoot/webhook
// This is the URL you register in Chatwoot Settings > Integrations > Webhooks
// Chatwoot sends events here when new messages arrive
router.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;

    // Only process incoming customer messages
    if (event !== 'message_created') return res.json({ status: 'ignored' });
    if (data.message_type !== 0) return res.json({ status: 'ignored' }); // 0 = incoming
    if (data.private) return res.json({ status: 'ignored' });

    const customerMessage = data.content;
    const conversationId = data.conversation?.id;

    if (!customerMessage || !conversationId) {
      return res.json({ status: 'ignored', reason: 'missing data' });
    }

    // Get conversation details for business context
    let businessContext = 'An online store';
    try {
      const conversation = await getConversation(conversationId);
      businessContext = conversation?.meta?.sender?.name
        ? `Customer: ${conversation.meta.sender.name}`
        : businessContext;
    } catch (err: any) {
      logger.warn('Could not fetch conversation details:', err.message);
    }

    // Generate Yuna's response
    const yunaResponse = await yunaRespond(customerMessage, businessContext);

    // Send response back to customer via Chatwoot
    await sendMessage(conversationId, yunaResponse);

    res.json({ success: true, response: yunaResponse });
  } catch (error: any) {
    logger.error('Chatwoot webhook error:', error);
    // Always return 200 to Chatwoot to prevent retry loops
    res.status(200).json({ error: error.message });
  }
});

// GET /api/chatwoot/inboxes — List connected channels
router.get('/inboxes', async (req, res) => {
  try {
    const inboxes = await getInboxes();
    res.json({ success: true, inboxes: inboxes.payload });
  } catch (error: any) {
    logger.error('Get inboxes error:', error);
    res.status(500).json({ error: 'Could not fetch inboxes' });
  }
});

export default router;
