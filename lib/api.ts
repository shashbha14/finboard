import axios from 'axios';

interface CacheEntry {
    data: any;
    timestamp: number;
}

const apiCache = new Map<string, CacheEntry>();

export const fetchData = async (url: string, refreshInterval: number = 0) => {
    const now = Date.now();
    const cached = apiCache.get(url);

    // If cached data exists and is "fresh" (within refresh interval), return it
    // refreshInterval is in seconds, so multiply by 1000
    if (cached && (now - cached.timestamp < refreshInterval * 1000)) {
        console.log(`[Cache Hit] ${url}`);
        return cached.data;
    }

    try {
        // Check if this is a Finnhub or Alpha Vantage URL and route through proxy to avoid CORS issues
        let requestUrl = url;
        
        // Handle proxy URLs (already proxied) or external URLs
        if (url.startsWith('/api/')) {
            // Already a proxy URL, use as-is
            requestUrl = url;
        } else if (url.includes('finnhub.io')) {
            const urlObj = new URL(url);
            const symbol = urlObj.searchParams.get('symbol');
            if (symbol) {
                // Use the Next.js API proxy route
                requestUrl = `/api/finnhub?symbol=${encodeURIComponent(symbol)}`;
            }
        } else if (url.includes('alphavantage.co')) {
            const urlObj = new URL(url);
            const symbol = urlObj.searchParams.get('symbol');
            const functionType = urlObj.searchParams.get('function') || 'GLOBAL_QUOTE';
            if (symbol) {
                // Use the Next.js API proxy route
                requestUrl = `/api/alphavantage?symbol=${encodeURIComponent(symbol)}&function=${encodeURIComponent(functionType)}`;
            }
        } else if (url.includes('stock.indianapi.in')) {
            const urlObj = new URL(url);
            const name = urlObj.searchParams.get('name');
            if (name) {
                // Use the Next.js API proxy route
                requestUrl = `/api/indianapi?name=${encodeURIComponent(name)}`;
            }
        }

        const response = await axios.get(requestUrl);
        const data = response.data;

        // Update cache (use original URL as key for consistency)
        apiCache.set(url, {
            data,
            timestamp: now
        });

        return data;
    } catch (error) {
        console.error(`[API Error] ${url}`, error);
        throw error;
    }
};
