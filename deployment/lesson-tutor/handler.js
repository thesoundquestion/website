import bank from '../../assets/lesson-tutor/approved-answers.json' with { type: 'json' };
import { asksAboutGraph, blockedReason, cleanQuestion, getContext, isInScope, matchQuestion, normalizeQuestion } from '../../assets/lesson-tutor/core.js';
import { answerSection, buildMessages, validatedOutput } from './grounding.js';
import { digestId, identityKeys, networkPrefix, readFollowUp, sealFollowUp, visitorIdentity } from './identity.js';
import { MAX_MESSAGE_BYTES, workersAIProvider } from './provider.js';
import { DAY_MS, finishQuota, reserveQuota } from './quota.js';

const ALLOWED_FIELDS = new Set(['question', 'lesson', 'section', 'plot', 'example', 'followUp']);
const MAX_BODY_BYTES = 4_096;
const FOLLOW_UP_MS = 10 * 60_000;
const UNAVAILABLE = 'AI help is unavailable right now. The prepared answers and lesson examples are still available.';
const LIMIT_REACHED = 'AI help is busy or has reached a usage limit. You can still use all the prepared answers.';
const OFF_TOPIC = 'Try a question about this lesson, its examples or a closely related audio topic.';

function reply(body, status = 200, cookie = null) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
  if (cookie) headers['Set-Cookie'] = cookie;
  return Response.json(body, { status, headers });
}

function unavailable(status = 503, cookie = null) {
  return reply({ kind: 'unavailable', message: UNAVAILABLE }, status, cookie);
}

function enabled(env) {
  return env.TUTOR_ENABLED === 'true' && env.TUTOR_WORKERS_PLAN === 'free' &&
    /^https:\/\/[a-z0-9.-]+$/i.test(env.TUTOR_ORIGIN ?? '') &&
    typeof env.TUTOR_SECRET === 'string' && /^[a-f0-9]{64}$/i.test(env.TUTOR_SECRET) &&
    typeof env.TUTOR_AI?.run === 'function' && typeof env.TUTOR_DB?.batch === 'function';
}

async function readBody(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let json = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      json += decoder.decode(value, { stream: true });
    }
    return JSON.parse(json + decoder.decode());
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

async function answerWithin(work, timeoutMs) {
  let timer;
  try {
    return await Promise.race([
      work,
      new Promise(resolve => { timer = setTimeout(resolve, timeoutMs, null); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export async function handleTutorRequest(request, env, { now = Date.now(), timeoutMs = 8_500, waitUntil = () => {} } = {}) {
  if (request.method !== 'POST') return unavailable(405);
  if (!enabled(env)) return unavailable();
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (new URL(request.url).origin !== env.TUTOR_ORIGIN ||
      request.headers.get('Origin') !== env.TUTOR_ORIGIN ||
      (fetchSite && fetchSite !== 'same-origin')) return unavailable(403);
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') ?? '')) return unavailable(415);

  const body = await readBody(request);
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(key => !ALLOWED_FIELDS.has(key))) return unavailable(400);
  const question = cleanQuestion(body.question);
  const context = getContext(bank, body);
  if (!question || !context ||
      (body.section != null && !context.section) ||
      (body.plot != null && !context.plot) ||
      (body.example != null && !context.example) ||
      (body.followUp != null && typeof body.followUp !== 'string')) return unavailable(400);

  const blocked = blockedReason(question);
  if (blocked === 'safety') {
    return reply({ kind: 'declined', message: 'Powered amplifiers and mains circuits can be dangerous. Have a qualified technician handle internal testing or repairs.' }, 422);
  }
  if (blocked) return reply({ kind: 'declined', message: OFF_TOPIC }, 422);
  const prepared = matchQuestion(context, question);
  if (prepared) return reply({ kind: 'answer', source: 'prepared', text: prepared.text, href: prepared.href });
  if (asksAboutGraph(question) && !context.example) {
    return reply({ kind: 'declined', message: 'Choose a graph example in the lesson and use “Ask about this example” to give the tutor the right context.' }, 422);
  }
  if (!isInScope(bank, context, question, body.followUp != null)) {
    return reply({ kind: 'declined', message: OFF_TOPIC }, 422);
  }

  let cookie;
  try {
    const prefix = networkPrefix(request.headers.get('CF-Connecting-IP'));
    if (!prefix) return unavailable(403);
    const day = Math.floor(now / DAY_MS);
    const { macKey, sealKey } = await identityKeys(env.TUTOR_SECRET);
    const { id: visitor, cookie: newCookie } = await visitorIdentity(request, macKey, day, now);
    const contextKey = JSON.stringify([context.slug, context.section, context.plotId, context.exampleId]);
    const previous = body.followUp == null ? null : await readFollowUp(sealKey, body.followUp);
    if (body.followUp != null && (!previous || previous.visitor !== visitor ||
        previous.day !== day || previous.expiresAt <= now || previous.context !== contextKey)) {
      return reply({ kind: 'declined', message: 'That clarification has expired or belongs to a different example. You can still use the prepared answers.' }, 422);
    }

    const { evidence, messages } = buildMessages(bank, context, question, previous?.exchange);
    if (new TextEncoder().encode(JSON.stringify(messages)).length > MAX_MESSAGE_BYTES) return unavailable(400);
    const [network, questionHash] = await Promise.all([
      digestId(macKey, 'network', day, prefix),
      digestId(macKey, 'question', day, context.slug, context.plotId, context.exampleId, normalizeQuestion(question)),
    ]);
    const id = crypto.randomUUID();
    const reserved = await reserveQuota(env.TUTOR_DB, {
      id, day, now, visitor, network, questionHash,
      interaction: previous?.id ?? id,
      turn: previous ? 1 : 0,
    });
    if (!reserved) return reply({ kind: 'unavailable', message: LIMIT_REACHED }, 429);
    cookie = newCookie;

    const generate = workersAIProvider(env.TUTOR_AI);
    const work = generate(messages).catch(() => null)
      .finally(() => finishQuota(env.TUTOR_DB, id, Date.now()).catch(() => {}));
    waitUntil(work);
    const text = validatedOutput(await answerWithin(work, timeoutMs), evidence);
    if (!text || blockedReason(text) === 'safety') return unavailable(503, cookie);
    const result = { kind: 'answer', source: 'ai', text, href: answerSection(context, question) };
    if (!previous) {
      const token = await sealFollowUp(sealKey, {
        id, day, visitor, expiresAt: now + FOLLOW_UP_MS, context: contextKey,
        exchange: { question, answer: text },
      });
      if (token.length <= 3_000) result.followUp = token;
    }
    return reply(result, 200, cookie);
  } catch {
    return unavailable(503, cookie);
  }
}
