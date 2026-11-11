import { DAY_MS } from './quota.js';

const COOKIE_NAME = '__Secure-tsq-tutor';
const COOKIE_PATH = '/api/lesson-tutor';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function encode(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid token encoding');
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0));
}

export async function identityKeys(secret) {
  const hashKey = purpose => crypto.subtle.digest('SHA-256', encoder.encode(purpose + '\0' + secret));
  const [macKey, sealKey] = await Promise.all([
    hashKey('tsq tutor quota v1').then(key => crypto.subtle.importKey(
      'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'],
    )),
    hashKey('tsq tutor follow-up v1').then(key => crypto.subtle.importKey(
      'raw', key, 'AES-GCM', false, ['encrypt', 'decrypt'],
    )),
  ]);
  return { macKey, sealKey };
}

export async function digestId(macKey, ...values) {
  return encode(await crypto.subtle.sign('HMAC', macKey, encoder.encode(JSON.stringify(values))));
}

export function networkPrefix(value) {
  if (typeof value !== 'string') return null;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    const bytes = value.split('.').map(Number);
    return bytes.every(byte => byte <= 255) ? bytes.join('.') : null;
  }
  if (!/^[a-f0-9:]{3,39}$/i.test(value) || !value.includes(':')) return null;
  try {
    const canonical = new URL('http://[' + value + ']/').hostname.slice(1, -1);
    const [left, right] = canonical.split('::');
    const head = left ? left.split(':') : [];
    const tail = right ? right.split(':') : [];
    const groups = right === undefined ? head : [...head, ...Array(8 - head.length - tail.length).fill('0'), ...tail];
    return groups.slice(0, 4).join(':') + '::/64';
  } catch {
    return null;
  }
}

export async function visitorIdentity(request, macKey, day, now) {
  const cookie = request.headers.get('Cookie')?.split(/;\s*/).find(value => value.startsWith(COOKIE_NAME + '='));
  const match = cookie && /^([a-f0-9-]{36})\.([A-Za-z0-9_-]{43})$/.exec(cookie.slice(COOKIE_NAME.length + 1));
  if (match) {
    const valid = await crypto.subtle.verify(
      'HMAC', macKey, decode(match[2]), encoder.encode(JSON.stringify(['cookie', day, match[1]])),
    );
    if (valid) return { id: await digestId(macKey, 'visitor', day, match[1]), cookie: null };
  }

  const randomId = crypto.randomUUID();
  const mac = await digestId(macKey, 'cookie', day, randomId);
  const maxAge = Math.ceil(((day + 1) * DAY_MS - now) / 1000);
  return {
    id: await digestId(macKey, 'visitor', day, randomId),
    cookie: COOKIE_NAME + '=' + randomId + '.' + mac +
      '; Max-Age=' + maxAge + '; Path=' + COOKIE_PATH + '; HttpOnly; Secure; SameSite=Strict',
  };
}

export async function sealFollowUp(sealKey, data) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const body = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sealKey, encoder.encode(JSON.stringify(data)));
  return encode(iv) + '.' + encode(body);
}

export async function readFollowUp(sealKey, token) {
  if (typeof token !== 'string' || token.length > 3_000) return null;
  try {
    const [iv, body, extra] = token.split('.');
    if (!iv || !body || extra !== undefined || iv.length !== 16) return null;
    const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(iv) }, sealKey, decode(body));
    return JSON.parse(decoder.decode(data));
  } catch {
    return null;
  }
}
