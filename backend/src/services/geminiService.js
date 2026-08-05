const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

const SYSTEM_PROMPT = `You are CodeSense AI, a senior staff engineer performing rigorous code review.

Analyse the submitted code for:
1. Correctness bugs and logic errors
2. Security vulnerabilities (injection, unsafe eval, secrets, auth flaws, unsafe deserialisation)
3. Performance problems (complexity, N+1, allocations, blocking I/O)
4. Readability and maintainability
5. Language-specific best practices and idioms

Rules:
- Respond with a SINGLE JSON object and nothing else. No markdown fences, no prose.
- "line" must be the 1-based line number in the submitted code, or null if unknown.
- Be specific and actionable. Never invent issues that are not in the code.
- overallScore is 1-10 where 10 is production-ready, secure and idiomatic.

JSON shape:
{
  "overallScore": number,
  "summary": string,
  "issues": [{ "severity": "critical" | "warning" | "info", "line": number | null, "message": string, "suggestion": string }],
  "improvements": [{ "title": string, "description": string, "codeSnippet": string }],
  "strengths": [string]
}`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    overallScore: { type: 'number' },
    summary: { type: 'string' },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['critical', 'warning', 'info'] },
          line: { type: 'number' },
          message: { type: 'string' },
          suggestion: { type: 'string' },
        },
        required: ['severity', 'message'],
      },
    },
    improvements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          codeSnippet: { type: 'string' },
        },
        required: ['title', 'description'],
      },
    },
    strengths: { type: 'array', items: { type: 'string' } },
  },
  required: ['overallScore', 'summary', 'issues', 'improvements', 'strengths'],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function extractJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

const clampScore = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return 5;
  return Math.min(10, Math.max(1, Math.round(num * 10) / 10));
};

function normaliseResult(raw) {
  const severities = new Set(['critical', 'warning', 'info']);
  return {
    overallScore: clampScore(raw.overallScore),
    summary: String(raw.summary || '').slice(0, 4000),
    issues: (Array.isArray(raw.issues) ? raw.issues : []).slice(0, 100).map((i) => ({
      severity: severities.has(i?.severity) ? i.severity : 'info',
      line: Number.isFinite(Number(i?.line)) ? Number(i.line) : null,
      message: String(i?.message || '').slice(0, 1000),
      suggestion: String(i?.suggestion || '').slice(0, 2000),
    })).filter((i) => i.message),
    improvements: (Array.isArray(raw.improvements) ? raw.improvements : []).slice(0, 25).map((i) => ({
      title: String(i?.title || '').slice(0, 200),
      description: String(i?.description || '').slice(0, 2000),
      codeSnippet: String(i?.codeSnippet || '').slice(0, 4000),
    })).filter((i) => i.title),
    strengths: (Array.isArray(raw.strengths) ? raw.strengths : [])
      .slice(0, 25)
      .map((s) => String(s).slice(0, 500))
      .filter(Boolean),
  };
}

function buildUserPrompt({ code, language, title, context }) {
  const numbered = code
    .split('\n')
    .map((line, idx) => `${idx + 1}: ${line}`)
    .join('\n');

  return [
    `Language: ${language}`,
    title ? `Title: ${title}` : null,
    context ? `Additional context from the author: ${context}` : null,
    '',
    'Code (line-numbered, the numbers are NOT part of the source):',
    '```',
    numbered,
    '```',
  ]
    .filter(Boolean)
    .join('\n');
}

async function withTimeout(promise, ms) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Gemini request timed out')), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function reviewCode(payload, { retries = 2, timeoutMs = 45000 } = {}) {
  if (!env.GEMINI_API_KEY) {
    throw ApiError.internal('GEMINI_API_KEY is not configured on the server');
  }
  const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  // Prepare a list of candidate models to try. Start with configured, then fallbacks.
  const candidateModels = [env.GEMINI_MODEL].concat([
    'models/text-bison-001',
    'gemini-1.5',
    'gemini-1.0',
  ]).filter(Boolean);

  const prompt = buildUserPrompt(payload);
  let lastError;
  // Try each candidate model in turn. For each model, allow a few retries.
  for (const candidate of candidateModels) {
    const model = client.getGenerativeModel({
      model: candidate,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await withTimeout(model.generateContent(prompt), timeoutMs);
        const text = response?.response?.text?.() ?? '';
        const parsed = extractJson(text);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Gemini returned a non-JSON response');
        }
        // Success — log which model worked (debug only) and return.
        if (candidate !== env.GEMINI_MODEL) {
          console.warn(`[gemini] falling back to model ${candidate} (configured: ${env.GEMINI_MODEL})`);
        }
        return normaliseResult(parsed);
      } catch (err) {
        lastError = err;
        const status = err?.status || err?.response?.status;
        const message = String(err?.message || err?.toString());

        // If model not found (404) or explicitly mentioned, stop trying this candidate quickly.
        const modelNotFound = status === 404 || /not found/i.test(message) || /models\/.+not found/i.test(message);
        const retryable = !status || status === 429 || status >= 500 || /timed out/i.test(message);
        if (modelNotFound) {
          // try next candidate model immediately
          console.warn(`[gemini] model ${candidate} not available: ${message}`);
          break;
        }

        if (attempt === retries || !retryable) break;
        await sleep(2 ** attempt * 1000 + Math.floor(Math.random() * 300));
      }
    }
  }

  // Never leak the API key or raw provider payloads.
  console.error('[gemini] review failed:', lastError?.message);
  const status = lastError?.status || lastError?.response?.status;
  const msg = String(lastError?.message || lastError?.toString() || 'unknown error');

  // If provider authentication or model-not-found occurs, fall back to a local heuristic review
  const isAuthError = status === 401 || /unauthoriz/i.test(msg) || /invalid authentication/i.test(msg);
  const isModelNotFound = status === 404 || /not found/i.test(msg) || /is not found for API version/i.test(msg) || /models\/.+not found/i.test(msg);

  if (isAuthError || isModelNotFound) {
    console.warn('[gemini] provider unavailable — returning local heuristic review as fallback');
    // Local heuristic reviewer: detect obvious issues (eval, SQL template interpolation, TODOs)
    const code = String(payload.code || '');
    const issues = [];
    if (/\beval\s*\(/i.test(code)) {
      issues.push({ severity: 'critical', line: null, message: 'Use of eval() detected — unsafe execution of arbitrary code', suggestion: 'Avoid eval; use safer parsing or explicit logic' });
    }
    if (/SELECT\s+\*\s+FROM/i.test(code) && /\$\{.*\}/.test(code)) {
      issues.push({ severity: 'critical', line: null, message: 'Possibly unsafe SQL query with string interpolation', suggestion: 'Use parameterized queries to avoid SQL injection' });
    }
    if (/password|secret|api[_-]?key/i.test(code)) {
      issues.push({ severity: 'warning', line: null, message: 'Possible hard-coded secret found', suggestion: 'Move secrets to environment variables and secret stores' });
    }
    if (/TODO|FIXME/i.test(code)) {
      issues.push({ severity: 'info', line: null, message: 'TODO/FIXME markers present', suggestion: 'Address outstanding TODOs before production' });
    }
    if (issues.length === 0) {
      issues.push({ severity: 'info', line: null, message: 'No obvious issues detected by heuristic fallback', suggestion: 'Run with a real AI provider for a deeper review' });
    }

    const local = {
      overallScore: Math.max(1, 10 - issues.filter((i) => i.severity === 'critical').length * 3),
      summary: isAuthError
        ? 'AI provider authentication failed; showing an offline heuristic review. Fix GEMINI_API_KEY or provider permissions for full AI reviews.'
        : 'AI provider model not found; showing an offline heuristic review. Change GEMINI_MODEL or provider access for full AI reviews.',
      issues,
      improvements: [],
      strengths: [],
    };

    return normaliseResult(local);
  }

  throw ApiError.internal(`AI review failed: ${msg}`);
}

module.exports = { reviewCode, extractJson, normaliseResult };
