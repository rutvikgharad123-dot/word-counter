import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * OCR endpoint: extracts text from camera image / scanned book page
 */
app.post('/api/ocr', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    // Clean base64 data
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: 'Transcribe and extract ALL printed or handwritten text from this document image with exact word-for-word fidelity. Do not add conversational commentary, prefixes, or markdown code fences; output only the extracted document text directly.',
          },
        ],
      },
    });

    const extractedText = response.text || '';
    res.json({ text: extractedText });
  } catch (error: any) {
    console.error('OCR Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to extract text from document image',
    });
  }
});

/**
 * Fetch from URL endpoint: extracts readable article body
 */
app.post('/api/fetch-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Fetch the target URL
    const fetchRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!fetchRes.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${fetchRes.status}`);
    }

    const html = await fetchRes.text();

    // Use Gemini 3.8 Flash to extract article title and clean body text stripped of ads/nav
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          text: `You are an article reader and text extractor. Extract the main title and clean article body text from this HTML content. Strip away all navigation menus, footers, advertisements, cookie notices, and sidebar links.

Output the extracted text directly.

HTML Content (sample):
${html.slice(0, 40000)}`,
        },
      ],
    });

    const cleanArticle = response.text || '';
    
    // Derive a clean title
    let title = 'Extracted Web Article';
    try {
      const parsedUrl = new URL(url);
      title = parsedUrl.hostname + parsedUrl.pathname.replace(/\/$/, '');
    } catch {
      // keep fallback
    }

    res.json({
      title,
      text: cleanArticle,
    });
  } catch (error: any) {
    console.error('Fetch URL error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to fetch article from URL',
    });
  }
});

/**
 * Advanced Tone & Style AI audit
 */
app.post('/api/ai-audit', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          text: `Perform a concise linguistic and tone audit on the following excerpt (under 100 words total):
- Detected Tone (e.g. Professional / Academic, Casual, Technical)
- Clarity & Sentence Structure critique
- 1 concrete recommendation for pacing

Text:
"""
${text.slice(0, 3000)}
"""`,
        },
      ],
    });

    res.json({ audit: response.text });
  } catch (error: any) {
    console.error('AI Audit Error:', error);
    res.status(500).json({ error: error?.message || 'Failed to audit text' });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CountLab server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
