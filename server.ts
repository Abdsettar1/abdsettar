import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });
  app.use(express.json());

  // Initialize Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Conversation history per session
  const sessions = new Map<string, { role: "user" | "model"; text: string }[]>();

  // System Prompt for squad operations commander "Jack"
  const JACK_SYSTEM_PROMPT = `
You are Jack, the Squad Leader of NexVend — a premium e-commerce agency.
You speak with confidence, clarity, and professionalism.
You are talking to merchants who need help with their online stores.

Your squad:
- Sofia Reyes (Spanish) — Store Design & Branding
- Marcus Lee (American) — Tech Setup & Integrations  
- Amir Hassan (Egyptian) — Ad Campaigns (Meta, TikTok)
- Yuna Park (Korean) — Customer Support (WhatsApp, Telegram, Facebook)
- Leo Dumont (French) — Product Research & Winning Products

Your job:
1. Understand what the merchant needs
2. Give a clear, confident response
3. Always mention which squad member will handle the task
4. Keep responses concise (2-4 sentences max)
5. End with a clear next step or question

Rules:
- Never say you are an AI or language model
- Always respond as Jack
- Use professional but human language
- Never use emojis in your response text
- If merchant asks about pricing, say "Let's discuss your needs first, then we'll tailor a package for you"
- Detect language: if merchant writes in Arabic, respond in Arabic. Otherwise respond in English (or the merchant's language).

Response format (always return valid JSON):
{
  "message": "Jack's response text here",
  "assignedAgents": ["Sofia — Store Design", "Marcus — Tech Setup"],
  "nextAction": "collecting-info" | "briefing" | "executing" | "clarifying",
  "detectedIntent": "store" | "products" | "ads" | "support" | "branding" | "general"
}
`;

  // POST /api/chat — main chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, sessionId } = req.body;

      if (!message || !sessionId) {
        return res.status(400).json({ error: 'message and sessionId required' });
      }

      // Get or create session history
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, []);
      }
      const history = sessions.get(sessionId)!;

      // Build the contents array for multi-turn chat
      const contents = [
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      // Call Gemini API using modern SDK patterns
      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: JACK_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        }
      });

      const rawText = result.text || "{}";

      // Parse JSON response
      let parsed;
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {
          message: rawText,
          assignedAgents: [],
          nextAction: "general",
          detectedIntent: "general"
        };
      } catch {
        parsed = {
          message: rawText,
          assignedAgents: [],
          nextAction: "general",
          detectedIntent: "general"
        };
      }

      // Save user input and model raw interaction to history
      history.push({ role: 'user', text: message });
      history.push({ role: 'model', text: rawText });

      // Keep history manageable (last 20 messages)
      if (history.length > 20) {
        history.splice(0, 2);
      }

      res.json({
        success: true,
        response: parsed,
        sessionId
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Jack is temporarily unavailable. Try again.' });
    }
  });

  // POST /api/analyze — analyze merchant's store/product request
  app.post('/api/analyze', async (req, res) => {
    try {
      const { storeName, niche, colorTheme, language } = req.body;

      const prompt = `
      A merchant wants to build an e-commerce store with these details:
      - Store Name: ${storeName}
      - Niche/Products: ${niche}
      - Color Theme: ${colorTheme}
      - Language: ${language}

      As Jack (NexVend Squad Leader), create a brief store brief in JSON:
      {
        "storeBrief": "2-3 sentence description of what we'll build",
        "assignedTeam": [
          { "agent": "Sofia Reyes", "task": "specific design task" },
          { "agent": "Marcus Lee", "task": "specific tech task" },
          { "agent": "Leo Dumont", "task": "specific product research task" }
        ],
        "estimatedDays": number,
        "keyFeatures": ["feature1", "feature2", "feature3"]
      }
      Return only valid JSON, do not wrap in markdown blocks.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = result.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      res.json({ success: true, brief: parsed });

    } catch (error) {
      console.error('Analyze error:', error);
      res.status(500).json({ error: 'Analysis failed' });
    }
  });

  // POST /webhook/chatwoot — Chatwoot Integration
  app.post('/webhook/chatwoot', async (req, res) => {
    try {
      const { event, data } = req.body;

      // Only handle new incoming messages
      if (event !== 'message_created' || data.message_type !== 'incoming') {
        return res.json({ status: 'ignored' });
      }

      const customerMessage = data.content;
      const conversationId = data.conversation_id;

      const yunaPrompt = `
      You are Yuna Park, a professional customer support agent for an e-commerce store.
      You are friendly, helpful, and efficient.
      A customer sent this message: "${customerMessage}"
      
      Respond naturally as a customer support agent would.
      Keep response under 3 sentences.
      If they ask about order status, say you'll check and get back to them shortly.
      If they want to buy something, help them complete their purchase.
      Detect their language and respond in the same language.
      Return only the response text, no JSON needed.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: yunaPrompt,
      });

      const yunaResponse = result.text || "";

      // Send response back via Chatwoot API if token is configured
      if (process.env.CHATWOOT_URL && process.env.CHATWOOT_API_TOKEN && process.env.CHATWOOT_ACCOUNT_ID) {
        await fetch(`${process.env.CHATWOOT_URL}/api/v1/accounts/${process.env.CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_access_token': process.env.CHATWOOT_API_TOKEN
          },
          body: JSON.stringify({
            content: yunaResponse,
            message_type: 'outgoing',
            private: false
          })
        });
      }

      res.json({ status: 'response sent', response: yunaResponse });

    } catch (error) {
      console.error('Chatwoot webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // POST /api/research-products — Product Research Leo's Engine
  app.post('/api/research-products', async (req, res) => {
    try {
      const { niche, budget, targetMarket } = req.body;

      const leoPrompt = `
      You are Leo Dumont, an expert e-commerce product researcher.
      A merchant wants to sell in this niche: ${niche}
      Their budget: ${budget}
      Target market: ${targetMarket}

      Research and provide 5 winning product recommendations in JSON:
      {
        "products": [
          {
            "name": "product name",
            "estimatedProfit": "profit margin %",
            "demandLevel": "High/Medium/Low",
            "competition": "High/Medium/Low",
            "whyWinning": "brief reason",
            "suggestedPrice": "price range",
            "sourcingTip": "where to source it"
          }
        ],
        "marketInsight": "2 sentence market overview",
        "recommendedNiche": "most specific sub-niche to target"
      }
      Return only valid JSON.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: leoPrompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = result.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      res.json({ success: true, research: parsed });

    } catch (error) {
      console.error('Product research error:', error);
      res.status(500).json({ error: 'Product research failed' });
    }
  });

  // GET /api/health — health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'Jack is online', timestamp: new Date().toISOString() });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Clear old sessions every hour
  setInterval(() => {
    if (sessions.size > 100) {
      const keys = Array.from(sessions.keys()).slice(0, 50);
      keys.forEach(k => sessions.delete(k));
    }
  }, 3600000);

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NexVend Fullstack Backend running on port ${PORT}`);
  });
}

startServer();
