import React, { useMemo } from 'react';
import { Widget } from '@/lib/types';
import { useWidgetData, getNestedValue } from '@/hooks/useWidgetData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartWidgetProps {
    widget: Widget;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget }) => {
    const { data, loading, error } = useWidgetData(widget.config);
    const { listPath, xAxisPath, yAxisPath } = widget.config.dataMapping || {};

    const chartData = useMemo(() => {
        if (!data) {
            console.log('[ChartWidget] No data available');
            return [];
        }
        
        // For Alpha Vantage with Global Quote paths, get values directly from data
        if ((xAxisPath && xAxisPath.includes('Global Quote')) || (yAxisPath && yAxisPath.includes('Global Quote'))) {
            // For single object data like Alpha Vantage, get values directly
            const xValue = xAxisPath ? getNestedValue(data, xAxisPath) : 'Value';
            const yValue = yAxisPath ? getNestedValue(data, yAxisPath) : 0;
            
            console.log('[ChartWidget] Alpha Vantage paths:', { 
                xAxisPath, 
                yAxisPath, 
                xValue, 
                yValue,
                hasGlobalQuote: !!data['Global Quote'],
                dataKeys: Object.keys(data)
            });
            
            // Parse string values to numbers if possible
            let parsedY = yValue;
            if (typeof yValue === 'string') {
                const numValue = parseFloat(yValue);
                if (!isNaN(numValue) && isFinite(numValue)) parsedY = numValue;
            }
            
            // Format date if needed
            let formattedX = xValue;
            if (typeof xValue === 'number' && xValue > 1000000000) {
                formattedX = new Date(xValue * 1000).toLocaleTimeString();
            }
            
            return [{ x: formattedX || 'N/A', y: parsedY || 0 }];
        }
        
        // If listPath is provided, use it to get array. Otherwise assume data is array or single object.
        const list = listPath ? getNestedValue(data, listPath) : data;
        
        // Handle single object by wrapping it in an array
        const dataArray = Array.isArray(list) ? list : (list ? [list] : []);

        return dataArray.map((item: any) => {
            let xValue = xAxisPath ? getNestedValue(item, xAxisPath) : item.date || item.time || item.t || 'Value';
            let yValue = yAxisPath ? getNestedValue(item, yAxisPath) : item.value || item.price || item.c || item.y || 0;
            
            // Parse string values to numbers if possible (Alpha Vantage returns strings)
            if (typeof yValue === 'string') {
                const numValue = parseFloat(yValue);
                if (!isNaN(numValue) && isFinite(numValue)) yValue = numValue;
            }
            
            // Format Unix timestamp if it's a number
            if (typeof xValue === 'number' && xValue > 1000000000) {
                xValue = new Date(xValue * 1000).toLocaleTimeString();
            }
            
            return { x: xValue || 'N/A', y: yValue || 0 };
        });
    }, [data, listPath, xAxisPath, yAxisPath]);

    if (loading && !data) return <div className="p-4 animate-pulse">Loading...</div>;
    if (error) return <div className="p-4 text-red-400 text-xs">Error: {error}</div>;
    if (!chartData.length) return <div className="p-4 text-gray-500 text-xs">No Data</div>;

    return (
        <div className="h-full w-full p-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#888' }} domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="y" stroke="#3b82f6" dot={false} strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
