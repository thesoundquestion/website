/* App-first Spotify navigation for the Curator's Listening Room.
 * Keep ordinary HTTPS links in the HTML so users without JavaScript,
 * assistive technology, and platforms handling Spotify universal links
 * still have a usable destination.
 */
(() => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) return; // HTTPS links are OS-associated app/universal links on mobile.

  function appUri(href) {
    let url;
    try { url = new URL(href); } catch { return null; }
    if (url.hostname !== 'open.spotify.com') return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'playlist' || parts[0] === 'album' || parts[0] === 'track') {
      return /^[A-Za-z0-9]+$/.test(parts[1] || '') ? 'spotify:' + parts[0] + ':' + parts[1] : null;
    }
    if (parts[0] === 'search' && parts.length > 1) {
      return 'spotify:search:' + parts.slice(1).join('/');
    }
    return null;
  }

  document.addEventListener('click', event => {
    const anchor = event.target.closest?.('a[href^="https://open.spotify.com/"]');
    if (!anchor || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        anchor.hasAttribute('download')) return;

    const uri = appUri(anchor.href);
    if (!uri) return;
    event.preventDefault();
    const webUrl = anchor.href;
    let leftPage = false;
    const onLeave = () => { leftPage = true; };
    const onVisibility = () => { if (document.visibilityState === 'hidden') leftPage = true; };
    window.addEventListener('blur', onLeave, { once: true });
    document.addEventListener('visibilitychange', onVisibility);

    // An installed desktop client handles spotify: URIs. Browsers cannot
    // reliably detect installation, so a delayed HTTPS fallback is best-effort.
    window.location.href = uri;
    window.setTimeout(() => {
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      if (!leftPage && document.visibilityState !== 'hidden') {
        window.location.assign(webUrl);
      }
    }, 1800);
  });
})();
