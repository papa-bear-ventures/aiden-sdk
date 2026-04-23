# Aiden SDK

TypeScript client for the **Aiden external API**: authenticated REST under **`/api/v1`**, OpenAI-compatible **`/v1`**, and public **`/api/version`** / **`/api-docs.json`**.

```bash
npm install @aiden-ai/sdk
```

**v1.0** is a full rewrite: paths match the current external API router (AIHub-derived tenant routes). Prefer this package version with the rebuilt external API.

## Quick start

```typescript
import { AidenClient, OpenAIChatStream } from '@aiden-ai/sdk';

const client = new AidenClient({
  apiKey: process.env.AIDEN_API_KEY!,
  baseUrl: process.env.AIDEN_BASE_URL!, // e.g. https://test.ext-api.aiden-tech.eu
  userId: 'optional-user', // sent as X-User-ID when set
});

const index = await client.apiV1Index();
console.log(index.data.openai_compatible);

// RAG / “thinking” chat (SSE)
const stream = await client.knowledge.thinkInNotebook(notebookId, {
  message: 'What is covered in our docs?',
  sessionId: existingSessionId,
});
for await (const event of stream) {
  if (event.type === 'delta') {
    process.stdout.write((event.data as { content: string }).content);
  }
}

// OpenAI-compatible chat (same origin as baseUrl)
const completion = await client.openai.chatCompletions({
  model: 'openai/gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello' }],
});
```

## Layout

| Export | Role |
|--------|------|
| `AidenClient` | Facade; holds all domain clients + `version()` / `apiV1Index()` |
| `client.openai` | `OpenAIClient` — `/v1/chat/completions`, models, audio |
| `client.knowledge` | RAG, `think` / `thinkInNotebook`, sessions, research |
| `client.notebooks` | Notebooks, cells, knowledge assets |
| `client.skills` | Skills CRUD, `run`, executions, logs, node registry |
| `client.models` | Tenant model list, services, allowlist (no legacy priorities/services PUT) |
| `client.documents` | GridFS upload/list/download |
| `client.flows` | Flows, instances, runs, run SSE stream |
| `client.billing` | Status, usage, invoices (admin-gated server-side) |
| `client.users` | Users + `users.groups.*` |
| `client.agents` | Agent builder + microapps |
| `client.slides` | Slide designer (incl. `htmlPreview`, message stream helpers) |
| `client.credentials` | Integration credentials |
| `client.experts` | List / get / find |
| `client.tasks` | Human-in-the-loop tasks |
| `client.artifacts` | User artifacts + versions |
| `client.prompts` | Prompt templates |
| `client.monitoring` | Usage / tools |
| `client.voice` | Native **`/api/v1/tts`** and **`/api/v1/stt`** |
| `client.context` | Org context settings |
| `client.tenantAdmin` | Selected admin calls (often **raw JSON**, not `{ data, meta }`) |

Domain methods return **`ApiResponse<unknown>`** unless you pass a generic (e.g. `skills.run<SkillExecution>(...)`).

## Streaming

- **Aiden thinking / RAG streams:** `AidenStream` (`for await`, `.text()`, `.subscribe()`).
- **OpenAI `stream: true`:** `OpenAIChatStream`.

## Contract

The OpenAPI document at **`GET {baseUrl}/api-docs.json`** (when enabled) is the source of truth. See `aihub_external_api/docs/SDK_REGENERATION.md` in the platform repo.

## Examples

| Path | Description |
|------|-------------|
| [examples/ecatalog-ai-search](./examples/ecatalog-ai-search/) | Catalogue + server-side chat |
| [examples/knowledge-assistant-bot](./examples/knowledge-assistant-bot/) | CLI bot over a notebook |
| [examples/skill-automation](./examples/skill-automation/) | Skills run + webhook |

## Requirements

- Node.js **18+** (global `fetch`)

## License

MIT
