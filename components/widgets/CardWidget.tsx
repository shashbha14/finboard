import React from 'react';
import { Widget } from '@/lib/types';
import { useWidgetData, getNestedValue } from '@/hooks/useWidgetData';

interface CardWidgetProps {
    widget: Widget;
}

export const CardWidget: React.FC<CardWidgetProps> = ({ widget }) => {
    const { data, loading, error } = useWidgetData(widget.config);
    const { valuePath, subtitlePath } = widget.config.dataMapping || {};

    if (loading && !data) return <div className="p-4 animate-pulse">Loading...</div>;
    if (error) return <div className="p-4 text-red-400 text-xs">Error: {error}</div>;
    if (!data) return <div className="p-4 text-gray-500 text-xs">No Data</div>;

    let value = valuePath ? getNestedValue(data, valuePath) : undefined;
    let subtitle = subtitlePath ? getNestedValue(data, subtitlePath) : undefined;

    // Debug logging - always log for Alpha Vantage issues
    if (!value && valuePath) {
        console.log('[CardWidget] Value not found:', { 
            valuePath, 
            hasData: !!data,
            dataKeys: data ? Object.keys(data) : [],
            globalQuote: data && data['Global Quote'] ? Object.keys(data['Global Quote']) : null,
            value 
        });
    }
    if (!subtitle && subtitlePath) {
        console.log('[CardWidget] Subtitle not found:', { 
            subtitlePath, 
            hasData: !!data,
            dataKeys: data ? Object.keys(data) : [],
            globalQuote: data && data['Global Quote'] ? Object.keys(data['Global Quote']) : null,
            subtitle 
        });
    }

    // Handle string values (e.g., Alpha Vantage returns strings)
    if (typeof value === 'string') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && isFinite(numValue)) value = numValue;
    }
    if (typeof subtitle === 'string') {
        // Handle percentage strings like "0.2568%" or numeric strings
        if (subtitle.includes('%')) {
            const numValue = parseFloat(subtitle.replace('%', '').trim());
            if (!isNaN(numValue) && isFinite(numValue)) subtitle = numValue;
        } else {
            const numValue = parseFloat(subtitle);
            if (!isNaN(numValue) && isFinite(numValue)) subtitle = numValue;
        }
    }

    const isPositive = typeof subtitle === 'number' && subtitle >= 0;
    const isNegative = typeof subtitle === 'number' && subtitle < 0;

    return (
        <div className="flex flex-col h-full justify-center p-4">
            <div className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">
                {widget.config.title}
            </div>

            <div className="text-3xl font-bold text-white tracking-tight" title={String(value)}>
                {typeof value === 'number'
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
                    : (value !== undefined ? String(value) : '--')}
            </div>

            {subtitle !== undefined && (
                <div className={`text-sm font-semibold mt-2 flex items-center gap-1 ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
                    }`}>
                    {typeof subtitle === 'number' && (isPositive ? '+' : '')}
                    {typeof subtitle === 'number'
                        ? `${subtitle.toFixed(2)}%` // Assuming strictly Finnhub 'dp' for now, or generally numeric change
                        : String(subtitle)
                    }
                </div>
            )}
        </div>
    );
};
