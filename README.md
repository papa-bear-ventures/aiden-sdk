# Aiden SDK

Official TypeScript SDK for the [Aiden AI](https://github.com/papa-bear-ventures/aiden-sdk) API. Provides type-safe access to chat, knowledge/RAG, skills, notebooks, and 15+ other resources with built-in streaming, retry logic, and error handling.

```bash
npm install @aiden-ai/sdk
```

## Quick Start

```typescript
import { AidenClient } from '@aiden-ai/sdk';

const client = new AidenClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.your-aiden-instance.com',
  userId: 'user-123', // optional, for user-scoped operations
});

// List notebooks
const notebooks = await client.notebooks.list({ page: 1, limit: 10 });
console.log(notebooks.data); // Notebook[]

// Streaming AI chat with knowledge (RAG)
const stream = await client.knowledge.think({
  message: 'What do we know about product X?',
  notebookId: 'nb-123',
});

for await (const event of stream) {
  if (event.type === 'delta') {
    process.stdout.write(event.data.content);
  }
}
```

## Features

- **Type-safe** -- full TypeScript types for all requests, responses, and entities
- **Streaming** -- SSE streaming via async iterators or callbacks
- **Retry & rate limiting** -- automatic exponential backoff on 429 and 5xx errors
- **All resources** -- notebooks, knowledge/RAG, chat, skills, billing, prompts, artifacts, models, users, agents, documents, flows, slides, credentials, experts, tasks, monitoring
- **Lightweight** -- zero runtime dependencies, uses native `fetch`
- **Node.js 18+** -- works with Node.js, Deno, and Bun

## Authentication

Get an API key from your Aiden dashboard. The SDK sends it as a `Bearer` token:

```typescript
const client = new AidenClient({
  apiKey: process.env.AIDEN_API_KEY!,
  baseUrl: process.env.AIDEN_BASE_URL!,
});
```

For user-scoped operations (notebooks, chat, documents), provide a `userId`:

```typescript
const client = new AidenClient({
  apiKey: process.env.AIDEN_API_KEY!,
  baseUrl: process.env.AIDEN_BASE_URL!,
  userId: 'user-456', // sent as X-User-ID header
});

// Or per-request:
await client.notebooks.list({}, { userId: 'user-789' });
```

## Streaming

The Aiden API streams responses via Server-Sent Events (SSE). The SDK provides two consumption patterns:

### Async Iterator

```typescript
const stream = await client.knowledge.think({
  message: 'Explain our product line',
  notebookId: 'nb-123',
});

for await (const event of stream) {
  switch (event.type) {
    case 'thinking_start':
      console.log('Thinking...');
      break;
    case 'rag_search_result':
      console.log('Found sources:', event.data);
      break;
    case 'delta':
      process.stdout.write(event.data.content);
      break;
    case 'complete':
      console.log('\nDone!');
      break;
  }
}
```

### Callbacks

```typescript
const stream = await client.knowledge.think({
  message: 'Summarize our research',
  notebookId: 'nb-123',
});

await stream.subscribe({
  onDelta: (content) => process.stdout.write(content),
  onComplete: (data) => console.log('\nDone:', data.sessionId),
  onThinking: (event) => console.log('Thinking:', event.type),
  onError: (err) => console.error('Error:', err.message),
});
```

### Collect full text

```typescript
const stream = await client.knowledge.think({ message: 'Hello' });
const fullText = await stream.text();
```

## Error Handling

All API errors are thrown as typed exceptions:

```typescript
import {
  AidenError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
} from '@aiden-ai/sdk';

try {
  await client.notebooks.get('invalid-id');
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log('Not found:', err.message);
    console.log('Request ID:', err.requestId); // for support
  } else if (err instanceof RateLimitError) {
    console.log(`Rate limited. Retry in ${err.retryAfter}ms`);
  } else if (err instanceof AuthenticationError) {
    console.log('Check your API key');
  } else if (err instanceof AidenError) {
    console.log(`API error [${err.code}]: ${err.message}`);
  }
}
```

### Error hierarchy

| Class | Status | When |
|---|---|---|
| `ValidationError` | 400 | Invalid request parameters |
| `AuthenticationError` | 401 | Invalid/expired API key |
| `ForbiddenError` | 403 | Insufficient scope or license |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Duplicate resource |
| `RateLimitError` | 429 | Too many requests |
| `InternalError` | 500 | Server error |
| `BadGatewayError` | 502 | Upstream LLM failure |
| `ServiceUnavailableError` | 503 | Service unavailable |
| `GatewayTimeoutError` | 504 | Upstream timeout |
| `ConnectionError` | - | Network failure |
| `TimeoutError` | - | Request timeout |

## Resources

### Knowledge & RAG

```typescript
// Thinking chat (full decision layer + RAG)
const stream = await client.knowledge.think({ message, notebookId });

// RAG question answering
const answer = await client.knowledge.ragAsk(notebookId, { question: 'What is...?' });

// RAG streaming
const stream = await client.knowledge.ragAskStream(notebookId, { question: '...' });

// Hybrid search
const results = await client.knowledge.ragSearch(notebookId, { query: 'search term' });

// Chat sessions
const session = await client.knowledge.createNotebookSession(notebookId);
const stream = await client.knowledge.streamNotebookMessage(notebookId, sessionId, { message });
```

### Notebooks

```typescript
const nb = await client.notebooks.create({ name: 'Research' });
const notebooks = await client.notebooks.list({ page: 1, limit: 20 });
await client.notebooks.update(id, { name: 'Updated' });
await client.notebooks.delete(id);

// Knowledge assets
await client.notebooks.createAsset(notebookId, { name: 'Doc', content: '...' });
const assets = await client.notebooks.listAssets(notebookId);

// Auto-paginate
for await (const notebook of client.notebooks.listAll()) {
  console.log(notebook.name);
}
```

### Skills

```typescript
// Execute a skill
const exec = await client.skills.run(skillId, { inputs: { text: '...' } });

// Poll for completion
const result = await client.skills.getExecution(skillId, exec.data._id);

// List executions
const execs = await client.skills.listExecutions(skillId);
```

### Documents

```typescript
// Upload (Node.js)
import { readFileSync } from 'fs';
const doc = await client.documents.upload({
  file: readFileSync('./report.pdf'),
  filename: 'report.pdf',
});

// Download
const response = await client.documents.download(docId);
```

### All available resources

| Resource | Access | Description |
|---|---|---|
| `client.notebooks` | Notebooks, knowledge assets, cells |
| `client.knowledge` | RAG, chat, search, research |
| `client.chat` | Public widget chat, feedback |
| `client.skills` | Skills/workflows, execution |
| `client.billing` | Usage, invoices, limits |
| `client.prompts` | Prompt templates |
| `client.artifacts` | Documents, versioning |
| `client.models` | AI model config |
| `client.users` | Tenant users, groups |
| `client.agents` | Agent builder, MicroApps |
| `client.documents` | File upload/download |
| `client.flows` | Workflow runs, streaming |
| `client.slides` | Presentation designer |
| `client.credentials` | Integration credentials |
| `client.experts` | Expert discovery |
| `client.tasks` | Human-in-the-loop tasks |
| `client.monitoring` | Usage statistics |

## Configuration

```typescript
const client = new AidenClient({
  apiKey: 'sk-...',           // Required
  baseUrl: 'https://...',     // Required
  userId: 'user-123',         // Optional: X-User-ID header
  timeout: 30_000,            // Optional: request timeout (default 30s)
  maxRetries: 3,              // Optional: retry count (default 3)
  fetch: customFetch,         // Optional: custom fetch implementation
});
```

## Examples

| Example | Description |
|---|---|
| [eCatalog AI Search](./examples/ecatalog-ai-search/) | Product catalogue with integrated AI search bar and chat |
| [Knowledge Assistant Bot](./examples/knowledge-assistant-bot/) | Internal helpdesk bot with RAG over company docs |
| [Skill Automation](./examples/skill-automation/) | Automated ticket processing with AI skills |

## Requirements

- Node.js 18+ (for native `fetch`)
- An Aiden API key

## License

MIT
