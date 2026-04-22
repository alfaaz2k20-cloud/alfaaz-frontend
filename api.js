/**
 * A custom fetch that automatically retries if the Render server is asleep.
 */
async function fetchWithRetry(url, options = {}, maxRetries = 6, delayMs = 5000) {
    try {
        const response = await fetch(url, options);
        
        // 502 or 504 means Render is waking up
        if ((response.status === 502 || response.status === 504) && maxRetries > 0) {
            console.warn(`[Cold Start] Server asleep. Retrying in ${delayMs / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            return fetchWithRetry(url, options, maxRetries - 1, delayMs);
        }
        
        return response;
    } catch (error) {
        // Network errors catch issues before the server is even reachable
        if (maxRetries > 0) {
             console.warn(`[Network Error] Retrying in ${delayMs / 1000}s...`);
             await new Promise(resolve => setTimeout(resolve, delayMs));
             return fetchWithRetry(url, options, maxRetries - 1, delayMs);
        }
        throw error;
    }
}