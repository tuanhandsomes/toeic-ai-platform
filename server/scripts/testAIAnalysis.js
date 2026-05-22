/**
 * Manual test script for AI analysis wire.
 * Usage: cd server && node scripts/testAIAnalysis.js
 *
 * - Finds the most recent full-test Result in DB
 * - Deletes any existing AIAnalysis for it
 * - Calls aiAnalysisService.generateForResult to force a fresh OpenAI call
 * - Prints out the result so you can verify isFallback / tokensUsed
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { Result } from '../src/models/Result.js';
import { AIAnalysis } from '../src/models/AIAnalysis.js';
import { aiAnalysisService } from '../src/services/aiAnalysisService.js';

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  const result = await Result.findOne({ testType: 'full' })
    .sort({ createdAt: -1 })
    .lean();

  if (!result) {
    console.error('✗ No full-test Result found in DB. Submit a full test first.');
    process.exit(1);
  }

  console.log(`✓ Found result: ${result._id}`);
  console.log(`  scoreTotal=${result.scoreTotal}, L=${result.scoreListening}, R=${result.scoreReading}`);

  const deleted = await AIAnalysis.deleteOne({ resultId: result._id });
  console.log(`✓ Cleared existing analysis (deleted=${deleted.deletedCount})`);

  console.log(`→ Calling generateForResult... (this may take 5-15s)`);
  const t0 = Date.now();
  const analysis = await aiAnalysisService.generateForResult(result._id);
  const elapsed = Date.now() - t0;

  if (!analysis) {
    console.error('✗ generateForResult returned null');
    process.exit(1);
  }

  console.log(`\n=== AI ANALYSIS (took ${elapsed}ms) ===`);
  console.log(`model        : ${analysis.model}`);
  console.log(`isFallback   : ${analysis.isFallback}`);
  console.log(`tokensUsed   : ${analysis.tokensUsed}`);
  console.log(`promptVersion: ${analysis.promptVersion}`);
  console.log(`\nstrengths (${analysis.strengths.length}):`);
  analysis.strengths.forEach((s) => console.log(`  - ${s}`));
  console.log(`\nweaknesses (${analysis.weaknesses.length}):`);
  analysis.weaknesses.forEach((w) => console.log(`  - ${w}`));
  console.log(`\nrecommendations (${analysis.recommendations.length}):`);
  analysis.recommendations.forEach((r) => {
    console.log(`  [${r.priority.toUpperCase()}] ${r.topic} → ${r.action}`);
  });
  console.log(`\nestimatedTargetWeeks: ${analysis.estimatedTargetWeeks}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
