// Optional analytics configuration is supplied only at release build time.
export function analyticsConfig(env) {
  const token = env.TSQ_POSTHOG_PROJECT_TOKEN || '';
  const host = env.TSQ_POSTHOG_HOST || '';
  if (!token && !host) return null;
  if (!/^phc_[a-zA-Z0-9]+$/.test(token) || host !== 'https://us.i.posthog.com') {
    throw new Error('Invalid or incomplete TSQ PostHog build configuration');
  }
  return {token, host};
}
export function injectAnalytics(html, entry, config) {
  if (!config || entry === '404.html' || !entry.endsWith('.html')) return html;
  if (!/^[a-zA-Z0-9_./-]+$/.test(entry)) throw new Error('Unsafe analytics page path');
  const page = '/' + entry.replace(/(^|\/)index\.html$/, '$1');
  const markup = '<link rel="stylesheet" href="/assets/tsq-analytics.css">\n' +
    '<script defer src="/assets/tsq-analytics.js" data-token="' + config.token +
    '" data-host="' + config.host + '" data-page="' + page + '"></script>\n';
  if (html.includes('/assets/tsq-analytics.js') || !/<\/head>/i.test(html)) throw new Error('Unexpected analytics injection target: ' + entry);
  return html.replace(/<\/head>/i, markup + '</head>');
}
