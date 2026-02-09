# eCatalog AI Search Bar

An integrated search bar with AI chat functionality for a product catalogue. Based on a real customer requirement: **"integrierte Suchleiste mit KI Chat-Funktionalität im eCatalog"**.

## What it does

- Displays a product catalogue with 10 industrial products
- Provides an AI-powered search bar that queries a notebook's knowledge base via RAG
- Supports conversational follow-up -- the search bar becomes a chat interface
- Streams responses in real-time with a clean, modern UI

## How it works

```
Browser (index.html)  →  Express Backend (server.ts)  →  Aiden API (via SDK)
                                                          ↓
  SSE streaming    ←  SSE relay                  ←  Knowledge + RAG
```

The API key stays server-side. The frontend communicates with the local Express backend, which proxies requests to the Aiden API using the SDK.

## Setup

1. **Configure your notebook**: Create a notebook in Aiden and add your product data as knowledge assets. The products in `products.ts` should match what's in your notebook.

2. **Set environment variables**:

```bash
cp .env.example .env
# Edit .env with your values:
#   AIDEN_API_KEY=your-api-key
#   AIDEN_BASE_URL=https://your-api-url.com
#   NOTEBOOK_ID=your-notebook-id
```

3. **Install and run**:

```bash
npm install
npm start
```

4. **Open**: http://localhost:3000

## Customization

- **Products**: Edit `products.ts` to match your catalogue
- **Styling**: Edit `public/styles.css` (CSS variables at the top)
- **Chat behavior**: The backend uses `knowledge.thinkInNotebook()` for RAG-powered responses. You can switch to simpler endpoints in `server.ts`.
