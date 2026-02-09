# Skill / Workflow Automation

Demonstrates how to use Aiden Skills to automate support ticket processing. Incoming tickets are classified, summarized, and a draft response is generated -- all programmatically via the SDK.

## Two entry points

### 1. Batch Processor (`ticket-processor.ts`)

Processes a batch of sample tickets sequentially. Good for understanding the skill execution flow.

```bash
npm run process
```

### 2. Webhook Handler (`webhook-handler.ts`)

Express server that receives tickets via webhook and processes them asynchronously. Simulates a real integration with a ticketing system.

```bash
npm start

# Test with curl:
curl -X POST http://localhost:3001/webhook/ticket \
  -H "Content-Type: application/json" \
  -d '{"id":"T-100","from":"test@example.com","subject":"Drill broken","body":"My X500 stopped working after 2 weeks"}'
```

## Setup

1. **Create skills** in your Aiden dashboard:
   - A classification skill (takes ticket subject/body, outputs category/priority/sentiment)
   - A summarization skill (takes ticket text, outputs concise summary)
   - A draft reply skill (takes ticket + classification + summary, outputs draft response)

2. **Configure environment**:

```bash
cp .env.example .env
# Fill in API key and skill IDs
```

3. **Run**:

```bash
npm install
npm run process   # batch mode
npm start         # webhook mode
```

## Architecture

```
Ticketing System  →  Webhook (POST /webhook/ticket)
                          ↓
                     Aiden SDK
                          ↓
                  Skill 1: Classify  →  { category, priority, sentiment }
                          ↓
                  Skill 2: Summarize →  { summary }
                          ↓
                  Skill 3: Draft     →  { draftReply }
                          ↓
                     Return to queue / send to agent
```

## Key SDK patterns demonstrated

- `client.skills.run()` -- trigger skill execution
- `client.skills.getExecution()` -- poll for results
- `client.skills.getExecutionLogs()` -- debug execution
- Error handling with `AidenError`, `RateLimitError`
