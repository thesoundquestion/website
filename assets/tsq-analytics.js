/* Deliberate opt-in, minimal event payload. No SDK, cookies or autocapture. */
(() => {
  'use strict';
  const config = document.currentScript?.dataset;
  if (!config || location.origin !== 'https://thesoundquestion.com' ||
      config.host !== 'https://us.i.posthog.com' ||
      !/^phc_[a-zA-Z0-9]+$/.test(config.token || '') ||
      !/^\/[a-zA-Z0-9_./-]*$/.test(config.page || '')) return;
  const prefKey = 'tsq-analytics-choice-v1', idKey = 'tsq-analytics-session-v1';
  const get = (storage, key) => { try { return window[storage].getItem(key); } catch { return null; } };
  const set = (storage, key, value) => { try { window[storage].setItem(key, value); return true; } catch { return false; } };
  const remove = (storage, key) => { try { window[storage].removeItem(key); } catch {} };
  const blocked = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  const onPrivacy = config.page === '/privacy/';
  let choice = get('localStorage', prefKey), sent = false;
  const refSource = () => {
    const map = { 'youtube.com':'youtube', 'youtu.be':'youtube', 'instagram.com':'instagram', 'tiktok.com':'tiktok',
      'google.com':'google', 'google.ca':'google', 'bing.com':'bing', 'duckduckgo.com':'duckduckgo',
      'reddit.com':'reddit', 'facebook.com':'facebook', 'threads.net':'threads' };
    const utm = new URLSearchParams(location.search).get('utm_source')?.toLowerCase();
    if (Object.values(map).includes(utm)) return utm;
    if (!document.referrer) return 'direct_or_unknown';
    try {
      const host = new URL(document.referrer).hostname.toLowerCase();
      if (host === location.hostname) return 'internal';
      for (const [domain, source] of Object.entries(map)) if (host === domain || host.endsWith('.' + domain)) return source;
    } catch {}
    return 'other';
  };
  const track = () => {
    if (blocked || choice !== 'allow' || sent || typeof crypto.randomUUID !== 'function') return;
    let session = null;
    try { session = JSON.parse(get('sessionStorage', idKey)); } catch {}
    const now = Date.now();
    if (!session || !/^[0-9a-f-]{36}$/i.test(session.id || '') || !Number.isFinite(session.last) || now < session.last || now - session.last > 1800000) session = {id:crypto.randomUUID(),last:now};
    session.last = now;
    set('sessionStorage', idKey, JSON.stringify(session));
    sent = true;
    // Static build path only; never transmit query strings, fragments, form input, or full referrers.
    const data = {api_key:config.token, event:'$pageview', distinct_id:session.id,
      properties:{'$current_url':location.origin + config.page,'$pathname':config.page,
        '$host':location.hostname,'$process_person_profile':false,tsq_source:refSource(),tsq_schema:1}};
    try {
      fetch(config.host + '/i/v0/e/', {method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true}).catch(() => {});
    } catch {}
  };
  const panel = document.createElement('aside');
  panel.className = 'tsq-analytics-choice';
  panel.setAttribute('aria-label','Optional website analytics');
  const msg = document.createElement('p');
  const allow = document.createElement('button'), deny = document.createElement('button');
  allow.type = deny.type = 'button';
  allow.textContent = 'Allow analytics';
  deny.textContent = 'No thanks';
  const details = document.createElement('a');
  details.href = '/privacy/'; details.textContent = 'Privacy details';
  const render = () => {
    if (blocked) { msg.textContent = 'Your browser privacy preference is respected. Analytics are off.'; allow.hidden = deny.hidden = true; }
    else {
      msg.textContent = choice === 'allow' ? 'Optional analytics are enabled.' : choice === 'deny' ?
        'Optional analytics are disabled.' : 'Help us improve these lessons with optional, limited website analytics. No forms or recordings are tracked.';
      allow.hidden = choice === 'allow'; deny.hidden = choice === 'deny';
    }
    panel.hidden = !onPrivacy && (blocked || choice === 'allow' || choice === 'deny');
  };
  const choose = value => {
    if (blocked) return;
    choice = value; set('localStorage', prefKey, value);
    if (value === 'deny') remove('sessionStorage', idKey);
    render();
    if (value === 'allow') track();
  };
  allow.addEventListener('click', () => choose('allow'));
  deny.addEventListener('click', () => choose('deny'));
  panel.append(msg, allow, deny, details);
  const mount = onPrivacy ? document.getElementById('tsq-analytics-preferences') : null;
  (mount || document.body).append(panel);
  render(); track();
})();
