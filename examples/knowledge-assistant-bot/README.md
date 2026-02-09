# Internal Knowledge Assistant Bot

A command-line knowledge assistant that connects to your company's documentation via Aiden's RAG capabilities. Demonstrates how to build an internal helpdesk bot that can be adapted for Slack, Microsoft Teams, or any messaging platform.

## What it does

- Connects to a notebook containing your internal documentation
- Answers employee questions using RAG (retrieval-augmented generation)
- Streams responses in real-time with thinking indicators
- Maintains conversation context across follow-up questions

## Setup

```bash
cp .env.example .env
# Edit .env with your Aiden API key and notebook ID

npm install
npm start
```

## Adapting for Slack / Teams

The core pattern is the same -- replace the readline interface with your messaging platform's SDK:

```typescript
// Slack example (pseudo-code)
app.message(async ({ message, say }) => {
  const stream = await client.knowledge.thinkInNotebook(NOTEBOOK_ID, {
    message: message.text,
    sessionId: getSessionForUser(message.user),
  });

  let response = '';
  for await (const event of stream) {
    if (event.type === 'delta') response += event.data.content;
  }

  await say(response);
});
```
