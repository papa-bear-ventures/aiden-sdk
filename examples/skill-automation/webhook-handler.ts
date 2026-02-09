/**
 * Webhook Handler
 *
 * Express server that receives incoming support tickets via webhook
 * and processes them using Aiden Skills.
 *
 * In production, this would be triggered by your ticketing system
 * (Zendesk, Freshdesk, Jira Service Desk, etc.).
 *
 * Usage:
 *   npm start
 *
 * Test with:
 *   curl -X POST http://localhost:3001/webhook/ticket \
 *     -H "Content-Type: application/json" \
 *     -d '{"id":"T-100","from":"test@example.com","subject":"Test","body":"My drill is broken"}'
 */

import 'dotenv/config';
import express from 'express';
import { AidenClient, AidenError } from '@aiden-ai/sdk';

// ============================================================================
// Configuration
// ============================================================================

const PORT = parseInt(process.env.PORT ?? '3001', 10);

const client = new AidenClient({
  apiKey: process.env.AIDEN_API_KEY!,
  baseUrl: process.env.AIDEN_BASE_URL!,
  userId: process.env.AIDEN_USER_ID ?? 'webhook-handler',
});

const CLASSIFY_SKILL = process.env.CLASSIFY_SKILL_ID!;

// ============================================================================
// Express App
// ============================================================================

const app = express();
app.use(express.json());

/**
 * POST /webhook/ticket
 *
 * Receives a new support ticket and kicks off async processing.
 * Returns immediately with a 202 Accepted.
 */
app.post('/webhook/ticket', async (req, res) => {
  const { id, from, subject, body } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ error: 'subject and body are required' });
  }

  console.log(`\n📩 Received ticket: ${id ?? 'unknown'} — ${subject}`);

  // Return immediately -- process asynchronously
  res.status(202).json({
    accepted: true,
    ticketId: id,
    message: 'Ticket received, processing started.',
  });

  // Process in background
  processTicketAsync({ id, from, subject, body }).catch((err) => {
    console.error(`❌ Failed to process ticket ${id}:`, err.message);
  });
});

/**
 * GET /health
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'skill-automation-webhook' });
});

// ============================================================================
// Async Ticket Processing
// ============================================================================

async function processTicketAsync(ticket: {
  id?: string;
  from?: string;
  subject: string;
  body: string;
}) {
  try {
    // Step 1: Classify the ticket
    console.log(`  📊 Classifying ticket ${ticket.id}...`);
    const exec = await client.skills.run(CLASSIFY_SKILL, {
      inputs: {
        subject: ticket.subject,
        body: ticket.body,
        from: ticket.from,
      },
    });

    console.log(`  ⏳ Execution started: ${exec.data._id}`);
    console.log(`  Status: ${exec.data.status}`);

    // In a real system, you would:
    // 1. Store the execution ID in your database
    // 2. Use a webhook or poll to check for completion
    // 3. Trigger follow-up skills (summarize, draft reply)
    // 4. Route the enriched ticket to the appropriate team

    if (exec.data.status === 'completed') {
      console.log(`  ✅ Classification result:`, exec.data.outputs);
    } else {
      console.log(`  ⏳ Running... check execution ${exec.data._id} for results.`);
    }
  } catch (error) {
    if (error instanceof AidenError) {
      console.error(`  ❌ [${error.code}] ${error.message} (request: ${error.requestId})`);
    } else {
      throw error;
    }
  }
}

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n  Skill Automation Webhook Handler`);
  console.log(`  ────────────────────────────────`);
  console.log(`  Listening on: http://localhost:${PORT}`);
  console.log(`  Webhook URL:  POST http://localhost:${PORT}/webhook/ticket`);
  console.log(`\n  Test with:`);
  console.log(`  curl -X POST http://localhost:${PORT}/webhook/ticket \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"id":"T-100","subject":"Broken drill","body":"My X500 stopped working"}'`);
  console.log(`\n  Press Ctrl+C to stop.\n`);
});
