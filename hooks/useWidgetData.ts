import { useState, useEffect, useRef } from 'react';
import { WidgetConfig } from '@/lib/types';
import { fetchData } from '@/lib/api';

// Helper to access nested object property by string path "data.price" or "Global Quote['05. price']" or "Global Quote[\"05. price\"]"
export const getNestedValue = (obj: any, path: string) => {
    if (!path) return undefined;

    // Handle bracket notation: Global Quote["05. price"] or Global Quote['05. price']
    // Split by dot, but respect brackets ['...'] or ["..."]
    const parts: string[] = [];
    let current = '';
    let inBrackets = false;
    let bracketContent = '';
    let quoteChar = '';

    for (let i = 0; i < path.length; i++) {
        const char = path[i];

        if (char === '[' && !inBrackets) {
            // When we hit a bracket, save current part (could be "Global Quote" with space)
            if (current.trim()) {
                parts.push(current.trim());
                current = '';
            }
            inBrackets = true;
            bracketContent = '';
        } else if (char === ']' && inBrackets) {
            // Save bracket content as a part
            parts.push(`[${bracketContent}]`);
            bracketContent = '';
            inBrackets = false;
            quoteChar = '';
        } else if (inBrackets) {
            // Inside brackets, collect everything
            bracketContent += char;
        } else if (char === '.' && !inBrackets) {
            // Split on dots when not inside brackets
            if (current.trim()) {
                parts.push(current.trim());
                current = '';
            }
        } else {
            // Outside brackets, collect characters
            current += char;
        }
    }

    if (current.trim()) {
        parts.push(current.trim());
    }

    const result = parts.reduce((prev, curr, index) => {
        if (!prev) {
            console.log(`[getNestedValue] prev is null/undefined at part ${index}:`, curr);
            return undefined;
        }
        
        // Remove brackets and quotes if present
        let cleanKey = curr.startsWith('[')
            ? curr.replace(/^\[['"]|['"]\]$/g, '')
            : curr;
        
        // Trim whitespace from key
        cleanKey = cleanKey.trim();
        
        // Handle keys with dots and spaces (like "05. price" or "Global Quote")
        const value = prev[cleanKey];
        
        // Debug logging - always log for Alpha Vantage paths or when value is undefined
        if (value === undefined && prev && typeof prev === 'object') {
            const availableKeys = Object.keys(prev);
            if (path.includes('Global Quote') || path.includes('Alpha Vantage') || availableKeys.length < 20) {
                console.log(`[getNestedValue] Key "${cleanKey}" not found at step ${index} in path "${path}". Available keys:`, availableKeys);
                console.log(`[getNestedValue] Current object (first 3 keys):`, Object.keys(prev).slice(0, 3).map(k => `${k}: ${typeof prev[k]}`));
            }
        }
        
        return value;
    }, obj);
    
    // Final debug log
    if (result === undefined && path.includes('Global Quote')) {
        console.log(`[getNestedValue] Final result is undefined for path: "${path}"`);
        console.log(`[getNestedValue] Root object keys:`, obj ? Object.keys(obj) : 'obj is null');
    }
    
    return result;
};

export const useWidgetData = (config: WidgetConfig) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use a ref to keep track of the latest config without triggering re-runs if only simple props change
    // But strictly we likely want to re-run if API URL changes.

    useEffect(() => {
        let isMounted = true;
        const { apiUrl, refreshInterval } = config;

        if (!apiUrl) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                const result = await fetchData(apiUrl, refreshInterval);
                if (isMounted) {
                    // Debug logging for Alpha Vantage
                    if (apiUrl.includes('alphavantage') || apiUrl.includes('/api/alphavantage')) {
                        console.log('[useWidgetData] Alpha Vantage data received:', result);
                        if (result && result['Global Quote']) {
                            console.log('[useWidgetData] Global Quote keys:', Object.keys(result['Global Quote']));
                        }
                    }
                    setData(result);
                    setError(null);
                }
            } catch (err: any) {
                if (isMounted) {
                    console.error('[useWidgetData] Error:', err);
                    setError(err.message || 'Failed to fetch data');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        // Initial load
        load();

        // Set interval (refreshInterval is in seconds)
        const intervalId = setInterval(load, (refreshInterval || 60) * 1000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [config.apiUrl, config.refreshInterval]); // Only re-subscribe if URL or interval changes

    return { data, loading, error };
};
