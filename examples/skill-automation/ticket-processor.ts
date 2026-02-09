/**
 * Ticket Processor
 *
 * Demonstrates how to use Aiden Skills to process support tickets:
 * 1. Classify the ticket (category, priority, sentiment)
 * 2. Summarize the customer's issue
 * 3. Draft a response
 *
 * This can be triggered by a webhook, cron job, or queue consumer.
 *
 * Usage:
 *   npm run process
 */

import 'dotenv/config';
import { AidenClient, AidenError, RateLimitError } from '@aiden-ai/sdk';
import type { SkillExecution } from '@aiden-ai/sdk';

// ============================================================================
// Configuration
// ============================================================================

const client = new AidenClient({
  apiKey: process.env.AIDEN_API_KEY!,
  baseUrl: process.env.AIDEN_BASE_URL!,
  userId: process.env.AIDEN_USER_ID ?? 'automation',
});

const CLASSIFY_SKILL = process.env.CLASSIFY_SKILL_ID!;
const SUMMARIZE_SKILL = process.env.SUMMARIZE_SKILL_ID!;
const DRAFT_REPLY_SKILL = process.env.DRAFT_REPLY_SKILL_ID!;

// ============================================================================
// Sample Tickets (in production, these come from your ticketing system)
// ============================================================================

const sampleTickets = [
  {
    id: 'TICKET-1042',
    from: 'customer@example.com',
    subject: 'Drill X500 stopped working after 2 weeks',
    body: `Hi, I purchased the ProLine Industrial Drill X500 two weeks ago. 
Yesterday it suddenly stopped working - the motor makes a buzzing noise 
but the chuck doesn't rotate. I've tried different batteries and the same 
issue persists. This is very frustrating as I need it for a project deadline 
next week. Can you help? Order #ORD-88421.`,
  },
  {
    id: 'TICKET-1043',
    from: 'workshop@metalworks.de',
    subject: 'Bulk order inquiry - LaserCut Pro LC-3000',
    body: `Hello, we are a metalworking workshop looking to purchase 5 units 
of the LaserCut Pro LC-3000 for our new facility. Could you provide a 
volume discount? We're also interested in the extended warranty option.
Please send us a quote at your earliest convenience.`,
  },
];

// ============================================================================
// Skill Execution with Polling
// ============================================================================

/**
 * Run a skill and poll until completion.
 * Returns the execution result.
 */
async function runSkillAndWait(
  skillId: string,
  inputs: Record<string, unknown>,
  maxWaitMs = 60_000,
): Promise<SkillExecution> {
  // Trigger the skill
  const exec = await client.skills.run(skillId, { inputs });
  const executionId = exec.data._id;

  console.log(`    ⏳ Execution started: ${executionId}`);

  // Poll for completion
  const startTime = Date.now();
  const pollInterval = 2_000; // 2 seconds

  while (Date.now() - startTime < maxWaitMs) {
    await sleep(pollInterval);

    const status = await client.skills.getExecution(skillId, executionId);

    if (status.data.status === 'completed') {
      console.log(`    ✅ Completed in ${Date.now() - startTime}ms`);
      return status.data;
    }

    if (status.data.status === 'failed') {
      console.log(`    ❌ Failed: ${status.data.error}`);
      throw new Error(`Skill execution failed: ${status.data.error}`);
    }

    // Still running
    console.log(`    ⏳ Status: ${status.data.status}...`);
  }

  throw new Error(`Skill execution timed out after ${maxWaitMs}ms`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Process a Single Ticket
// ============================================================================

async function processTicket(ticket: typeof sampleTickets[0]) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📩 Processing: ${ticket.id} — ${ticket.subject}`);
  console.log(`${'═'.repeat(60)}`);

  try {
    // Step 1: Classify
    console.log('\n  📊 Step 1: Classifying ticket...');
    const classification = await runSkillAndWait(CLASSIFY_SKILL, {
      subject: ticket.subject,
      body: ticket.body,
      from: ticket.from,
    });
    console.log('    Result:', JSON.stringify(classification.outputs, null, 2));

    // Step 2: Summarize
    console.log('\n  📝 Step 2: Summarizing issue...');
    const summary = await runSkillAndWait(SUMMARIZE_SKILL, {
      subject: ticket.subject,
      body: ticket.body,
    });
    console.log('    Result:', JSON.stringify(summary.outputs, null, 2));

    // Step 3: Draft reply
    console.log('\n  ✍️  Step 3: Drafting response...');
    const draftReply = await runSkillAndWait(DRAFT_REPLY_SKILL, {
      subject: ticket.subject,
      body: ticket.body,
      classification: classification.outputs,
      summary: summary.outputs,
      customerEmail: ticket.from,
    });
    console.log('    Result:', JSON.stringify(draftReply.outputs, null, 2));

    // Summary
    console.log(`\n  🎯 Ticket ${ticket.id} processed successfully.`);
    console.log(`     Classification: ${JSON.stringify(classification.outputs)}`);
    console.log(`     Summary: ${JSON.stringify(summary.outputs)}`);
    console.log(`     Draft reply ready for review.`);

    return {
      ticketId: ticket.id,
      classification: classification.outputs,
      summary: summary.outputs,
      draftReply: draftReply.outputs,
    };
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.error(`  ⏳ Rate limited on ${ticket.id}. Retry after ${error.retryAfter}ms`);
    } else if (error instanceof AidenError) {
      console.error(`  ❌ API Error on ${ticket.id}: [${error.code}] ${error.message}`);
    } else {
      console.error(`  ❌ Error on ${ticket.id}:`, error);
    }
    return null;
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Support Ticket Processor                   ║');
  console.log('║   Powered by Aiden Skills                    ║');
  console.log('╚══════════════════════════════════════════════╝');

  if (!CLASSIFY_SKILL || !SUMMARIZE_SKILL || !DRAFT_REPLY_SKILL) {
    console.error('\nMissing skill IDs. Set CLASSIFY_SKILL_ID, SUMMARIZE_SKILL_ID, DRAFT_REPLY_SKILL_ID in .env');
    process.exit(1);
  }

  const results = [];

  for (const ticket of sampleTickets) {
    const result = await processTicket(ticket);
    if (result) results.push(result);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ Processed ${results.length}/${sampleTickets.length} tickets successfully.`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch(console.error);
