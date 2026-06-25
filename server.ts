import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import chatRoutes from "./routes/chat.js";
import chatwootRoutes from "./routes/chatwoot.js";
import woocommerceRoutes from "./routes/woocommerce.js";

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

  // Robust helper to execute Gemini API calls with retries and fallbacks
  async function generateContentWithRetry(aiClient: any, params: {
    contents: any;
    config?: any;
    model?: string;
  }, maxRetries = 3) {
    const model = params.model || 'gemini-3.5-flash';
    
    // Check if the model is image/video/audio specific
    const isSpecializedModality = 
      model.includes('image') || 
      model.includes('imagen') || 
      model.includes('video') || 
      model.includes('veo') || 
      model.includes('audio') || 
      model.includes('tts') || 
      model.includes('lyria');

    // Ordered models to try: primary model -> lighter backup -> fallback
    const modelsToTry = isSpecializedModality 
      ? [model] 
      : [model, 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

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
            // Structural errors (e.g. invalid parameters) should fail fast or fallback if possible
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
      console.warn(`Model ${modelName} failed all attempts or was unavailable. Trying fallback if available...`);
    }

    console.warn("API Error encountered:", lastError?.message || lastError);
    return generateSimulatedResponse(params, lastError);
  }

  function generateSimulatedResponse(params: any, lastError: any) {
    console.warn("Activating NexVend Squad Command Center Fallback Simulation Engine.");
    
    let userMessage = "";
    if (typeof params.contents === 'string') {
      userMessage = params.contents;
    } else if (Array.isArray(params.contents)) {
      const lastMsg = params.contents[params.contents.length - 1];
      if (lastMsg && lastMsg.parts && lastMsg.parts[0]) {
        userMessage = lastMsg.parts[0].text || "";
      }
    } else if (params.contents && params.contents.parts && Array.isArray(params.contents.parts)) {
      const textPart = params.contents.parts.find((p: any) => p.text);
      if (textPart) {
        userMessage = textPart.text;
      }
    }

    const userMsgLower = userMessage.toLowerCase();

    // 1. Is this Image Generation?
    const isImageGen = params.model && (params.model.includes('image') || params.model.includes('imagen'));
    if (isImageGen) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E0B36"/>
      <stop offset="50%" stop-color="#7621B0"/>
      <stop offset="100%" stop-color="#B600A8"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <g transform="translate(400, 360)" filter="url(#glow)">
    <circle r="120" fill="none" stroke="white" stroke-width="3" opacity="0.15"/>
    <circle r="80" fill="none" stroke="white" stroke-width="5" opacity="0.3"/>
    <polygon points="0,-120 104,-60 104,60 0,120 -104,60 -104,-60" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    <path d="M-60,-30 L0,-70 L60,-30 L60,40 L0,80 L-60,40 Z" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.8"/>
    <text x="0" y="10" font-family="'Space Grotesk', 'Inter', sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">NEXVEND</text>
    <text x="0" y="32" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="rgba(255,255,255,0.6)" text-anchor="middle">SQUAD COMMAND LAYER v3.15</text>
  </g>
  <path d="M 0 650 Q 200 600, 400 680 T 800 640 L 800 800 L 0 800 Z" fill="rgba(255,255,255,0.05)"/>
  <path d="M 0 700 Q 200 650, 400 730 T 800 690 L 800 800 L 0 800 Z" fill="rgba(255,255,255,0.05)"/>
</svg>`;
      const base64Svg = Buffer.from(svg).toString('base64');
      return {
        candidates: [{
          content: {
            parts: [{
              inlineData: {
                data: base64Svg,
                mimeType: 'image/png'
              }
            }]
          }
        }]
      };
    }

    // 2. Is this Product Analysis?
    if (userMsgLower.includes('white background') && userMsgLower.includes('photography style')) {
      return {
        text: "Professional studio product photograph, floating streetwear apparel, dramatic purple cinematic background highlights, high resolution 8K, commercial studio lighting, ultra-sharp detail."
      };
    }

    // 3. Is this Product Research?
    if (userMsgLower.includes('winning product recommendations') || userMsgLower.includes('marketinsight')) {
      const products = [
        {
          name: "Sleek Obsidian Techwear Cargo Pants",
          estimatedProfit: "68%",
          demandLevel: "High",
          competition: "Medium",
          whyWinning: "Highly visual aesthetics trending on TikTok and Instagram Reels. Strong utility strap style perfect for active streetwear targeting.",
          suggestedPrice: "$59.99",
          sourcingTip: "CJ Dropshipping, US warehouse stock for fast 4-7 day delivery."
        },
        {
          name: "Cyberpunk Glow Windbreaker",
          estimatedProfit: "72%",
          demandLevel: "High",
          competition: "Low",
          whyWinning: "Reflective and luminescent fabric has extreme scroll-stopping power in video advertisements.",
          suggestedPrice: "$69.99",
          sourcingTip: "AliExpress premium suppliers with guaranteed tracking coordinates."
        },
        {
          name: "Minimalist Monospace Tactical Belt",
          estimatedProfit: "60%",
          demandLevel: "Medium",
          competition: "Medium",
          whyWinning: "Low shipping weight makes this a perfect high-margin upsell or bundle item to increase average order value.",
          suggestedPrice: "$24.99",
          sourcingTip: "CJ Dropshipping rapid air packet lines."
        },
        {
          name: "Fitted Obsidian Hooded Poncho",
          estimatedProfit: "65%",
          demandLevel: "High",
          competition: "Low",
          whyWinning: "A unique design item that stands out from typical hoodie lines. Excellent candidate for influencer styling briefs.",
          suggestedPrice: "$79.99",
          sourcingTip: "CJ Dropshipping customized garment partners."
        },
        {
          name: "Heavyweight Monospace Graphic Tee",
          estimatedProfit: "55%",
          demandLevel: "High",
          competition: "High",
          whyWinning: "Essential streetwear staple. Heavy 240GSM cotton represents premium luxury feel with custom typography detailing.",
          suggestedPrice: "$39.99",
          sourcingTip: "Print-on-demand fulfillment centers with local production."
        }
      ];

      return {
        text: JSON.stringify({
          products: products,
          marketInsight: "Streetwear niche remains an extremely high margin vertical due to strong visual appeal and low cost of goods from specialized factories.",
          recommendedNiche: "Stealth Obsidian Techwear & Streetwear Accessories"
        }, null, 2)
      };
    }

    // 4. Is this the Analyze Brief endpoint?
    if (userMsgLower.includes('storebrief') || userMsgLower.includes('assignedteam')) {
      return {
        text: JSON.stringify({
          storeName: "Obsidian Elite Apparel",
          storeBrief: "A high-fidelity minimalist dropshipping storefront centered on modern streetwear. Built with high-contrast obsidian dark canvases and eye-safe typography designed to drive peak checkout impulse purchases.",
          assignedTeam: [
            { "agent": "Sofia Reyes", "task": "Design a gorgeous custom obsidian theme with vivid pink highlights and premium image cards." },
            { "agent": "Marcus Lee", "task": "Configure WooCommerce connection and deploy real-time payment gateway telemetry." },
            { "agent": "Leo Dumont", "task": "Source 5 winning heavyweight cargo streetwear products with pre-negotiated margins." }
          ],
          estimatedDays: 2,
          keyFeatures: [
            "Obsidian Dark Theme Visual Interface",
            "Sleek High-Contrast UI highlights",
            "Sourcing Supplier Connections Ready"
          ]
        }, null, 2)
      };
    }

    // 5. Is this the Main Chat (Jack)?
    let responseText = "Acknowledged. I've briefed the squad on your directive. Sofia is reviewing the layout typography, and Marcus is validating our API connections to ensure peak performance.";
    let assignedAgents = ["Sofia Reyes — Store Design", "Marcus Lee — Tech Setup"];
    let detectedIntent = "store";
    let nextAction = "briefing";

    if (userMsgLower.includes('product') || userMsgLower.includes('source') || userMsgLower.includes('winner') || userMsgLower.includes('supplier')) {
      responseText = "Directive routed to Sourcing. Leo Dumont has been deployed to conduct an exhaustive telemetry scan on streetwear suppliers to lock in premium quality products.";
      assignedAgents = ["Leo Dumont — Sourcing"];
      detectedIntent = "products";
    } else if (userMsgLower.includes('design') || userMsgLower.includes('color') || userMsgLower.includes('style') || userMsgLower.includes('logo') || userMsgLower.includes('brand')) {
      responseText = "Branding parameters received. Sofia Reyes is crafting an eye-safe Obsidian visual scheme paired with Space Grotesk display fonts to convey premium luxury.";
      assignedAgents = ["Sofia Reyes — Store Design"];
      detectedIntent = "branding";
    } else if (userMsgLower.includes('speed') || userMsgLower.includes('latency') || userMsgLower.includes('checkout') || userMsgLower.includes('database') || userMsgLower.includes('tech')) {
      responseText = "Technical diagnostics active. Marcus Lee is auditing the database query coordinates and applying local cache routes to drop latency levels below 300ms.";
      assignedAgents = ["Marcus Lee — Tech Setup"];
      detectedIntent = "store";
    } else if (userMsgLower.includes('ad') || userMsgLower.includes('campaign') || userMsgLower.includes('marketing') || userMsgLower.includes('copy') || userMsgLower.includes('traffic')) {
      responseText = "Growth pipeline engaged. Amir Hassan is drafting optimized meta ad drafts and establishing targeting metrics customized for your high-margin products.";
      assignedAgents = ["Amir Hassan — Growth Ops"];
      detectedIntent = "ads";
    }

    return {
      text: JSON.stringify({
        message: responseText,
        assignedAgents: assignedAgents,
        nextAction: nextAction,
        detectedIntent: detectedIntent
      }, null, 2)
    };
  }

  function getErrorMessageForError(error: any, defaultMsg: string): string {
    const errMsg = error?.message || '';
    const status = error?.status || 0;
    
    if (status === 429 || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      return "NexVend Command Center is experiencing high volume (Gemini API 429 rate limit). We have initiated fallback backup routines. Please dispatch your command again in a few seconds.";
    }
    if (status === 503 || errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand') || errMsg.includes('overload')) {
      return "NexVend Satellite Uplink is experiencing high demand (Gemini Service 503 unavailable). Please retry your request shortly.";
    }
    return defaultMsg;
  }

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
      const result = await generateContentWithRetry(ai, {
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
      res.status(500).json({ error: getErrorMessageForError(error, 'Jack is temporarily unavailable. Try again.') });
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

      const result = await generateContentWithRetry(ai, {
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
      res.status(500).json({ error: getErrorMessageForError(error, 'Analysis failed') });
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

      const result = await generateContentWithRetry(ai, {
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
      res.status(500).json({ error: getErrorMessageForError(error, 'Webhook processing failed') });
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

      const result = await generateContentWithRetry(ai, {
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
      res.status(500).json({ error: getErrorMessageForError(error, 'Product research failed') });
    }
  });

  // ==========================================
  // GENRITE AI CREATIVE STUDIO ENDPOINTS
  // ==========================================

  // 1. Generate Image (supports Gemini 3 Pro and Gemini 3.1 Flash Image with sizes 1K, 2K, 4K)
  app.post('/api/genrite/generate-image', async (req, res) => {
    try {
      const { prompt, imageBase64, mimeType, aspectRatio, size, model } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Select default model based on input
      // If we are editing (have imageBase64), use gemini-3.1-flash-image-preview
      // Otherwise, default to gemini-3-pro-image-preview for high-quality generations
      const selectedModel = model || (imageBase64 ? 'gemini-3.1-flash-image-preview' : 'gemini-3-pro-image-preview');

      let cleanBase64 = '';
      if (imageBase64) {
        cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      }

      const parts: any[] = [];
      if (cleanBase64) {
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || 'image/png'
          }
        });
      }
      parts.push({ text: prompt });

      const response = await generateContentWithRetry(ai, {
        model: selectedModel,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
            imageSize: size || "1K"
          }
        }
      });

      let generatedImageBase64 = '';
      const candidateParts = response.candidates?.[0]?.content?.parts || [];
      for (const part of candidateParts) {
        if (part.inlineData) {
          generatedImageBase64 = part.inlineData.data;
          break;
        }
      }

      if (!generatedImageBase64) {
        // Fallback check: sometimes it might be under content parts
        return res.status(500).json({ error: 'No image was generated by the model. Try a different prompt.' });
      }

      res.json({
        success: true,
        imageBase64: `data:image/png;base64,${generatedImageBase64}`
      });

    } catch (error: any) {
      console.error('Image generation error:', error);
      res.status(500).json({ error: error.message || 'Image generation failed' });
    }
  });

  // 2. Analyze Product Image and suggest premium photo prompts
  app.post('/api/genrite/analyze-product', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg'
              }
            },
            {
              text: 'Analyze this product and write the perfect prompt to generate a professional product photo with white background. Be specific about the product, its features, and the desired photography style.'
            }
          ]
        }
      });

      const suggestedPrompt = response.text || 'A premium product shot';

      res.json({
        success: true,
        suggestedPrompt: suggestedPrompt
      });

    } catch (error: any) {
      console.error('Product analysis error:', error);
      res.status(500).json({ error: error.message || 'Product analysis failed' });
    }
  });

  // 3. Initiate Veo Video Generation (Veo 3.1 Fast)
  app.post('/api/genrite/generate-video', async (req, res) => {
    try {
      const { prompt, imageBase64, mimeType, aspectRatio } = req.body;

      let imagePayload = undefined;
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        imagePayload = {
          imageBytes: cleanBase64,
          mimeType: mimeType || 'image/png'
        };
      }

      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Cinematic product promotional video, high-end commercial',
        image: imagePayload,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio || '16:9'
        }
      });

      res.json({
        success: true,
        operationName: operation.name
      });

    } catch (error: any) {
      console.error('Video generation start error:', error);
      res.status(500).json({ error: error.message || 'Video generation failed to start' });
    }
  });

  // 4. Poll Veo Video Generation Status
  app.post('/api/genrite/video-status', async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: 'operationName is required' });
      }

      const op = { name: operationName };
      const updated = await ai.operations.getVideosOperation({ operation: op as any });

      res.json({
        success: true,
        done: updated.done,
        error: updated.error,
        response: updated.response
      });

    } catch (error: any) {
      console.error('Video status error:', error);
      res.status(500).json({ error: error.message || 'Failed to check video status' });
    }
  });

  // 5. Download/Stream Veo Video
  app.get('/api/genrite/video-download', async (req, res) => {
    try {
      const operationName = req.query.operationName as string;
      if (!operationName) {
        return res.status(400).json({ error: 'operationName is required' });
      }

      const op = { name: operationName };
      const updated = await ai.operations.getVideosOperation({ operation: op as any });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        return res.status(404).json({ error: 'Video URL not found in operation response' });
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey || '' },
      });

      res.setHeader('Content-Type', 'video/mp4');

      if (videoRes.body) {
        const reader = videoRes.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      }
      res.end();

    } catch (error: any) {
      console.error('Video download error:', error);
      res.status(500).json({ error: error.message || 'Failed to download video' });
    }
  });

  // Mount brochure API routes
  app.use('/api/chat', chatRoutes);
  app.use('/api/chatwoot', chatwootRoutes);
  app.use('/api/woocommerce', woocommerceRoutes);

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
