import OpenAI from 'openai';
import { env } from './env.js';

let _client = null;

/**
 * Lazy singleton OpenAI client.
 * Returns null when OPENAI_API_KEY is missing — callers must handle the
 * null case to fall back to heuristic analysis.
 *
 * maxRetries=2: SDK auto-retries on 408/409/429/5xx with exponential backoff.
 * timeout=30s : AI analysis runs inside POST /results (synchronous), must
 *               not stall the request beyond 30s; longer than that we'd
 *               rather fail and let the heuristic fallback kick in.
 */
export function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) return null;
  if (!_client) {
    _client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      maxRetries: 2,
      timeout: 30_000,
    });
  }
  return _client;
}
