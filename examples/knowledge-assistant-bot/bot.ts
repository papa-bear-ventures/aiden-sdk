/**
 * Internal Knowledge Assistant Bot
 *
 * A command-line bot that connects to a notebook's knowledge base
 * and answers employee questions via streaming chat + RAG.
 *
 * This demonstrates how to build an internal helpdesk / knowledge assistant
 * that can be adapted for Slack, Teams, or any messaging platform.
 *
 * Usage:
 *   cp .env.example .env  # configure your API key and notebook
 *   npm start
 */

import 'dotenv/config';
import * as readline from 'readline';
import { AidenClient, AidenError, RateLimitError } from '@aiden-ai/sdk';
import type { StreamEvent, DeltaEventData, ChatSession } from '@aiden-ai/sdk';

// ============================================================================
// Configuration
// ============================================================================

const API_KEY = process.env.AIDEN_API_KEY;
const BASE_URL = process.env.AIDEN_BASE_URL;
const NOTEBOOK_ID = process.env.NOTEBOOK_ID;
const USER_ID = process.env.AIDEN_USER_ID ?? 'helpdesk-bot';

if (!API_KEY || !BASE_URL || !NOTEBOOK_ID) {
  console.error('Missing environment variables. Copy .env.example to .env and fill in:');
  console.error('  AIDEN_API_KEY, AIDEN_BASE_URL, NOTEBOOK_ID');
  process.exit(1);
}

// ============================================================================
// Aiden Client
// ============================================================================

const client = new AidenClient({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  userId: USER_ID,
  timeout: 120_000, // 2 min for long research queries
});

// ============================================================================
// Bot Logic
// ============================================================================

let sessionId: string | null = null;

async function ensureSession(): Promise<string> {
  if (sessionId) return sessionId;

  console.log('\n🔗 Creating knowledge session...');
  const session = await client.knowledge.createNotebookSession<ChatSession>(NOTEBOOK_ID!, {
    title: 'Knowledge Assistant',
  });
  const d = session.data;
  const id = d._id ?? d.id ?? d.sessionId;
  if (!id) {
    throw new Error('API did not return a session id');
  }
  sessionId = id;
  console.log(`📚 Connected to notebook (session: ${id})\n`);
  return id;
}

async function askQuestion(question: string): Promise<void> {
  const sid = await ensureSession();

  process.stdout.write('\n🤖 ');

  try {
    const stream = await client.knowledge.thinkInNotebook(NOTEBOOK_ID!, {
      message: question,
      sessionId: sid,
    });

    let hasContent = false;

    for await (const event of stream) {
      switch (event.type) {
        case 'thinking_start':
          process.stdout.write('(thinking...) ');
          break;

        case 'rag_search_start':
          process.stdout.write('(searching knowledge base...) ');
          break;

        case 'delta': {
          const delta = event.data as DeltaEventData;
          if (!hasContent) {
            // Clear the thinking indicators
            process.stdout.write('\r🤖 ');
            hasContent = true;
          }
          process.stdout.write(delta.content);
          break;
        }

        case 'rag_citation': {
          // Could display sources here
          break;
        }

        case 'complete':
          if (!hasContent) {
            process.stdout.write('(No response generated)');
          }
          break;

        case 'error': {
          const errData = event.data as { message: string };
          console.error(`\n❌ Error: ${errData.message}`);
          break;
        }
      }
    }

    console.log('\n');
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.log(`\n⏳ Rate limited. Retry in ${Math.ceil(error.retryAfter / 1000)}s\n`);
    } else if (error instanceof AidenError) {
      console.error(`\n❌ API Error [${error.code}]: ${error.message}\n`);
    } else {
      console.error(`\n❌ Error: ${error}\n`);
    }
  }
}

// ============================================================================
// Interactive CLI
// ============================================================================

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Internal Knowledge Assistant               ║');
  console.log('║   Ask questions about your documentation     ║');
  console.log('║   Type "quit" to exit                        ║');
  console.log('╚══════════════════════════════════════════════╝');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question('👤 You: ', async (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        prompt();
        return;
      }

      if (trimmed.toLowerCase() === 'quit' || trimmed.toLowerCase() === 'exit') {
        console.log('\nGoodbye! 👋\n');
        rl.close();
        process.exit(0);
      }

      if (trimmed.toLowerCase() === 'new') {
        sessionId = null;
        console.log('\n🔄 New session started.\n');
        prompt();
        return;
      }

      await askQuestion(trimmed);
      prompt();
    });
  };

  prompt();
}

main().catch(console.error);
