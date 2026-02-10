/**
 * eCatalog AI Search -- Backend Server
 *
 * Thin Express server that:
 * 1. Serves the static frontend (product catalogue + chat widget)
 * 2. Proxies chat requests to the Aiden API via the SDK
 *
 * The API key stays server-side -- never exposed to the browser.
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { AidenClient } from '@aiden-ai/sdk';
import { products } from './products';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// Configuration
// ============================================================================

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const API_KEY = process.env.AIDEN_API_KEY;
const BASE_URL = process.env.AIDEN_BASE_URL;
const NOTEBOOK_ID = process.env.NOTEBOOK_ID;
const USER_ID = process.env.AIDEN_USER_ID ?? 'ecatalog-visitor';

if (!API_KEY || !BASE_URL || !NOTEBOOK_ID) {
  console.error('Missing required environment variables:');
  console.error('  AIDEN_API_KEY   - Your Aiden API key');
  console.error('  AIDEN_BASE_URL  - Aiden API base URL');
  console.error('  NOTEBOOK_ID     - Notebook ID with product knowledge');
  console.error('\nCopy .env.example to .env and fill in the values.');
  process.exit(1);
}

// ============================================================================
// Aiden SDK Client
// ============================================================================

const aiden = new AidenClient({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  userId: USER_ID,
  timeout: 60_000, // 60s for streaming requests
});

// ============================================================================
// Express App
// ============================================================================

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------------------------------------------------
// API: Get products (for the frontend to render)
// --------------------------------------------------------------------------

app.get('/api/products', (_req, res) => {
  res.json({ data: products });
});

// --------------------------------------------------------------------------
// API: Create a chat session
// --------------------------------------------------------------------------

app.post('/api/chat/session', async (_req, res) => {
  try {
    const session = await aiden.knowledge.createNotebookSession(NOTEBOOK_ID, {
      title: 'eCatalog Chat',
    });
    // API may return session id as sessionId, id, or _id
    const d = session.data as { sessionId?: string; id?: string; _id?: string };
    const sessionId = d.sessionId ?? d.id ?? d._id;
    if (!sessionId) {
      return res.status(500).json({ error: 'API did not return a session ID' });
    }
    res.json({ sessionId });
  } catch (error: any) {
    console.error('Failed to create session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------------------------------
// API: Send a message and stream the response (SSE)
// --------------------------------------------------------------------------

app.post('/api/chat/message', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId and message are required' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  try {
    // Use the thinking chat endpoint for rich responses with RAG
    const stream = await aiden.knowledge.thinkInNotebook(NOTEBOOK_ID, {
      message,
      sessionId,
    });

    // Relay SSE events to the browser
    for await (const event of stream) {
      const eventData = JSON.stringify(event);
      res.write(`data: ${eventData}\n\n`);
    }

    // Signal completion
    res.write(`data: ${JSON.stringify({ type: 'stream_end' })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Stream error:', error.message);
    res.write(`data: ${JSON.stringify({ type: 'error', data: { message: error.message } })}\n\n`);
    res.end();
  }
});

// --------------------------------------------------------------------------
// Start server
// --------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`\n  eCatalog AI Search Demo`);
  console.log(`  ──────────────────────`);
  console.log(`  Open: http://localhost:${PORT}`);
  console.log(`  API:  ${BASE_URL}`);
  console.log(`  Notebook: ${NOTEBOOK_ID}`);
  console.log(`\n  Press Ctrl+C to stop.\n`);
});
