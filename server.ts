import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High body limit to support base64 uploads of lecture slides and handwritten notebook images/PDFs
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Flashcard Generation API endpoint
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { topic, notesText, scope, files, customApiKey } = req.body;

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(400).json({
        error: 'NO_API_KEY',
        message: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is present or provide one in Settings.'
      });
      return;
    }

    if (!notesText && (!files || files.length === 0)) {
      res.status(400).json({
        error: 'EMPTY_INPUT',
        message: 'Please provide either typed notes or upload note files (images/PDFs).'
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const isDeepDive = scope === 'deep';
    const targetCount = isDeepDive ? '16 to 24' : '8 to 12';

    const systemInstruction = `You are ExamVault AI, an elite academic exam preparation specialist and cognitive learning tutor.
Your core mission is to transform raw, messy study notes (including notebook photos, slides, syllabus excerpts, and typed jottings) into high-yield, active recall flashcards strictly anchored in the user's provided materials.

CRITICAL RULES:
1. Strict Grounding: Every card must be 100% grounded in the provided notes/files. Do not invent external theories, dates, formulas, or concepts not present in the material.
2. Shorthand & Acronym Expansion: If the notes contain fragmented shorthand, arrows, incomplete sentences, or abbreviations (e.g., "mito = powerhouse", "pyr -> ac-CoA", "O2 debt"), expand them into clean, precise academic prose on the back.
3. Extra Context Contract: Whenever you expand shorthand, fill in inferred connections, or clarify messy syntax, you MUST explain the clarification in "extraContext" (e.g., "Expanded 'mito' to mitochondria and detailed aerobic phosphorylation chain mentioned in bullet 2"). If the card definition is direct verbatim from notes without modification, set "extraContext" to null.
4. Hybrid 50/50 Balance: Produce approximately 50% direct definitions/terms ("type": "definition") and 50% high-yield conceptual exam check questions ("type": "concept").
5. High Yield Only: Target core exam-worthy principles, mechanism steps, definitions, contrasting pairs, and synthesis questions.
6. Target Count: Produce exactly ${targetCount} flashcards.`;

    const userPromptText = `Topic: "${topic || 'General Exam Revision'}"
Deck Scope: ${isDeepDive ? 'Deep Dive (comprehensive coverage of all key terms and conceptual links)' : 'Quick Review (top high-yield concepts and definitions)'}

Notes / Context provided:
${notesText ? notesText.trim() : '(Refer to uploaded documents/images)'}

Extract ${targetCount} high-yield flashcards adhering strictly to the required schema. Ensure clear, unambiguous question/term prompts on the "front" and rigorous, memorable explanations on the "back".`;

    // Construct parts: base64 inlineData for files, followed by prompt text
    const parts: any[] = [];

    if (files && Array.isArray(files)) {
      for (const file of files) {
        if (file.data && file.mimeType) {
          const cleanBase64 = file.data.replace(/^data:[^;]+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: file.mimeType,
              data: cleanBase64,
            }
          });
        }
      }
    }

    parts.push({
      text: userPromptText
    });

    // Generate flashcards using resilient multi-model cascade with retry & backoff
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    const modelConfig = {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        description: 'List of high-yield study flashcards',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER, description: 'Sequential card number' },
            type: {
              type: Type.STRING,
              enum: ['definition', 'concept'],
              description: 'Whether this card tests a terminology definition or a conceptual exam question'
            },
            front: {
              type: Type.STRING,
              description: 'Term or High-Yield Question prompt'
            },
            back: {
              type: Type.STRING,
              description: 'Clear, authoritative definition or answer strictly anchored in the provided notes'
            },
            extraContext: {
              type: Type.STRING,
              description: 'Brief explanation if shorthand was expanded, or null if direct from notes'
            }
          },
          required: ['id', 'type', 'front', 'back']
        }
      }
    };

    let responseText = '';
    let lastError: any = null;

    for (const model of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config: modelConfig,
          });
          if (response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          if (attempt === 1) {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
      }
      if (responseText) break;
    }

    if (!responseText) {
      throw lastError || new Error('Received empty response from Gemini model');
    }

    // Sanitize in case backticks or wrapped json is returned
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const cards = JSON.parse(cleanJson);

    if (!Array.isArray(cards) || cards.length === 0) {
      throw new Error('Parsed response is not a non-empty flashcard array');
    }

    // Normalize IDs and properties
    const normalizedCards = cards.map((card, idx) => ({
      id: card.id || idx + 1,
      type: card.type === 'concept' ? 'concept' : 'definition',
      front: String(card.front || '').trim(),
      back: String(card.back || '').trim(),
      extraContext: card.extraContext && card.extraContext !== 'null' ? String(card.extraContext).trim() : null
    })).filter(c => c.front.length > 0 && c.back.length > 0);

    res.json({
      success: true,
      cards: normalizedCards,
      meta: {
        topic: topic || 'Exam Notes',
        cardCount: normalizedCards.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    let friendlyMessage = 'Unable to generate flashcards right now. Please verify your notes and try again.';
    if (err?.message) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.error?.message) {
          friendlyMessage = parsed.error.message;
        } else {
          friendlyMessage = err.message;
        }
      } catch {
        friendlyMessage = err.message;
      }
    }

    res.status(500).json({
      error: 'GENERATION_FAILED',
      message: friendlyMessage
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const http = await import('http');
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`ExamVault AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
