import { GoogleGenAI } from '@google/genai';
import { JACK_SYSTEM_PROMPT, YUNA_SUPPORT_PROMPT, LEO_RESEARCH_PROMPT } from '../utils/prompts.js';
import { logger } from '../utils/logger.js';

let genAIInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (genAIInstance) return genAIInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in your environment variables. Please provide your Gemini API Key in Settings.');
  }
  genAIInstance = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  return genAIInstance;
}

// Robust helper to execute Gemini API calls with retries and fallbacks
async function generateContentWithRetry(aiClient: GoogleGenAI, params: {
  contents: any;
  config?: any;
  model?: string;
}, maxRetries = 3) {
  const model = params.model || 'gemini-3.5-flash';
  
  // Try primary model, fallback to gemini-3.1-flash-lite, then gemini-flash-latest
  const modelsToTry = [model, 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        console.log(`Calling model ${modelName} (attempt ${attempt + 1}/${maxRetries})...`);
        const result = await aiClient.models.generateContent({
          ...params,
          model: modelName,
        });
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(`Attempt ${attempt + 1} failed for model ${modelName}:`, error.message || error);
        
        const isTransient = 
          error.status === 503 || 
          error.status === 429 || 
          (error.message && (
            error.message.includes('503') || 
            error.message.includes('429') || 
            error.message.includes('busy') || 
            error.message.includes('overload') || 
            error.message.includes('UNAVAILABLE') || 
            error.message.includes('high demand')
          ));

        if (!isTransient) {
          break;
        }

        attempt++;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.log(`Waiting ${Math.round(delay)}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    console.warn(`Model ${modelName} failed all attempts. Trying fallback...`);
  }

  throw lastError || new Error("Failed to generate content after trying multiple models");
}

// In-memory session store
interface ChatHistory {
  role: 'user' | 'model';
  text: string;
}

interface UserSession {
  history: ChatHistory[];
  createdAt: number;
  lastActivity: number;
}

const sessions = new Map<string, UserSession>();

export async function jackChat(message: string, sessionId: string) {
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message');
  }

  // Get or create session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { history: [], createdAt: Date.now(), lastActivity: Date.now() });
  }
  const session = sessions.get(sessionId)!;

  const ai = getGenAI();

  // Map history to correct API format
  const contents = [
    ...session.history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    })),
    {
      role: 'user',
      parts: [{ text: message }]
    }
  ];

  const result = await generateContentWithRetry(ai, {
    model: 'gemini-3.5-flash',
    contents: contents,
    config: {
      systemInstruction: JACK_SYSTEM_PROMPT,
      temperature: 0.7,
      maxOutputTokens: 500,
      responseMimeType: 'application/json',
    }
  });

  const rawText = (result.text || "").trim();

  // Parse JSON response
  let parsed: any;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    parsed = JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    logger.warn('Failed to parse JSON from Jack response, using fallback format', rawText);
    parsed = {
      message: rawText,
      assignedAgents: [],
      intent: 'general',
      nextStep: 'none',
    };
  }

  // Update history (keep last 20 messages)
  session.history.push({ role: 'user', text: message });
  session.history.push({ role: 'model', text: rawText });
  if (session.history.length > 20) {
    session.history.splice(0, 2);
  }
  session.lastActivity = Date.now();

  return parsed;
}

export async function yunaRespond(customerMessage: string, businessContext: string) {
  const ai = getGenAI();
  const result = await generateContentWithRetry(ai, {
    model: 'gemini-3.5-flash',
    contents: YUNA_SUPPORT_PROMPT(businessContext, customerMessage),
    config: {
      temperature: 0.8,
      maxOutputTokens: 200
    }
  });
  return (result.text || "").trim();
}

export async function leoResearch(niche: string, budget: string, market: string) {
  const ai = getGenAI();
  const result = await generateContentWithRetry(ai, {
    model: 'gemini-3.5-flash',
    contents: LEO_RESEARCH_PROMPT(niche, budget, market),
    config: {
      temperature: 0.4,
      maxOutputTokens: 1500,
      responseMimeType: 'application/json'
    }
  });

  const rawText = (result.text || "").trim();
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Leo research failed to return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

// Cleanup old sessions every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [id, session] of sessions.entries()) {
    if (session.lastActivity < oneHourAgo) {
      sessions.delete(id);
    }
  }
}, 3600000);
