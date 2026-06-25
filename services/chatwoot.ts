import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const BASE_URL = process.env.CHATWOOT_BASE_URL;
const TOKEN = process.env.CHATWOOT_API_TOKEN;
const ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;

if (!BASE_URL || !TOKEN || !ACCOUNT_ID) {
  logger.warn('Chatwoot credentials missing — customer support features disabled');
}

// Lazy helper to get Chatwoot API client
function getChatwootClient() {
  const url = process.env.CHATWOOT_BASE_URL || BASE_URL;
  const token = process.env.CHATWOOT_API_TOKEN || TOKEN;
  const accountId = process.env.CHATWOOT_ACCOUNT_ID || ACCOUNT_ID;

  if (!url || !token || !accountId) {
    throw new Error('Chatwoot credentials missing (CHATWOOT_BASE_URL, CHATWOOT_API_TOKEN, CHATWOOT_ACCOUNT_ID). Please check your environment configuration.');
  }

  return axios.create({
    baseURL: `${url}/api/v1/accounts/${accountId}`,
    headers: {
      'api_access_token': token,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
}

// Send a message to a conversation
export async function sendMessage(conversationId: string | number, content: string, isPrivate = false) {
  const client = getChatwootClient();
  const response = await client.post(
    `/conversations/${conversationId}/messages`,
    {
      content,
      message_type: 'outgoing',
      private: isPrivate,
    }
  );
  return response.data;
}

// Get conversation details
export async function getConversation(conversationId: string | number) {
  const client = getChatwootClient();
  const response = await client.get(`/conversations/${conversationId}`);
  return response.data;
}

// Assign agent to conversation
export async function assignAgent(conversationId: string | number, agentId: string | number) {
  const client = getChatwootClient();
  const response = await client.patch(
    `/conversations/${conversationId}/assignments`,
    { assignee_id: agentId }
  );
  return response.data;
}

// Get all inboxes (WhatsApp, Telegram, Facebook channels)
export async function getInboxes() {
  const client = getChatwootClient();
  const response = await client.get('/inboxes');
  return response.data;
}

// Get agent list
export async function getAgents() {
  const client = getChatwootClient();
  const response = await client.get('/agents');
  return response.data;
}

// Verify webhook signature
export function verifyWebhookSignature(payload: any, signature: string): boolean {
  const secret = process.env.CHATWOOT_WEBHOOK_SECRET;
  if (!secret) return true; // Skip if no secret configured
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return signature === expected;
}
