// =====================================================
// ALFAAZ API LAYER
// Pre-warm + fetchWithRetry pattern
// =====================================================

const ALFAAZ_API = "https://alfaaz-project.onrender.com";

// ── 1. Start warming the server IMMEDIATELY (before DOM ready) ──────────────
// This runs the moment the browser parses this <script> tag.
// By the time the 2-second preloader finishes, we've already
// been knocking on the server's door for those 2 seconds.
let _serverReady = false;
let _serverReadyResolve;
const serverReadyPromise = new Promise(res => { _serverReadyResolve = res; });

(async function preWarm() {
  const MAX_WAIT_MS = 90_000; // 90 seconds total patience
  const PING_INTERVAL_MS = 3_000;
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`${ALFAAZ_API}/ping`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        _serverReady = true;
        _serverReadyResolve(true);
        return;
      }
    } catch (_) {
      // Server still waking — keep pinging silently
    }
    await new Promise(r => setTimeout(r, PING_INTERVAL_MS));
  }

  // Give up after 90s — resolve anyway so the UI doesn't hang forever
  _serverReadyResolve(false);
})();

// ── 2. fetchWithRetry (handles mid-session 502/504) ────────────────────────
async function fetchWithRetry(url, options = {}, maxRetries = 5, delayMs = 4000) {
  try {
    const response = await fetch(url, options);
    if ((response.status === 502 || response.status === 504) && maxRetries > 0) {
      await new Promise(r => setTimeout(r, delayMs));
      return fetchWithRetry(url, options, maxRetries - 1, delayMs);
    }
    return response;
  } catch (err) {
    if (maxRetries > 0) {
      await new Promise(r => setTimeout(r, delayMs));
      return fetchWithRetry(url, options, maxRetries - 1, delayMs);
    }
    throw err;
  }
}

// ── 3. Export a warm fetch — waits for the server to be alive first ─────────
// Any module that uses this will automatically wait for the pre-warm to resolve.
async function warmFetch(url, options = {}) {
  await serverReadyPromise;
  return fetchWithRetry(url, options);
}