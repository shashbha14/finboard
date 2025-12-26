import React, { useMemo, useState } from 'react';
import { Widget } from '@/lib/types';
import { useWidgetData, getNestedValue } from '@/hooks/useWidgetData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartWidgetProps {
    widget: Widget;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget }) => {
    const { data, loading: isLoading, error } = useWidgetData(widget.config);
    const [interval, setInterval] = useState<'1D' | '1W' | '1M'>('1D');
    const { xAxisPath, yAxisPath } = widget.config.dataMapping || {};

    const chartData = useMemo(() => {
        if (isLoading || !data) return [];

        let processedData: any[] = [];

        if (Array.isArray(data)) {
            processedData = data;
        } else if (typeof data === 'object' && data !== null) {
            // Try to find the time series key for Alpha Vantage or similar APIs
            const timeSeriesKey = Object.keys(data).find(k => k.includes('Time Series') || k.includes('Daily') || k.includes('Weekly'));

            if (timeSeriesKey && typeof data[timeSeriesKey] === 'object') {
                // Convert { "2023-01-01": { ... } } to [ { date: "2023-01-01", ... } ]
                processedData = Object.entries(data[timeSeriesKey]).map(([date, values]: [string, any]) => ({
                    date,
                    ...values
                })).reverse(); // Sort oldest to newest
            } else {
                // Fallback for simple objects
                processedData = [{ date: 'Current', ...data }];
            }
        }

        return processedData;
    }, [data, isLoading]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full text-muted-foreground text-xs">Loading chart...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-full text-destructive text-xs p-4 text-center">{error}</div>;
    }

    if (chartData.length === 0) {
        return <div className="p-4 text-muted-foreground text-xs text-center">No Data Available</div>;
    }

    return (
        <div className="flex flex-col h-full w-full p-2">
            {/* Interval Selector */}
            <div className="flex justify-end gap-1 mb-2">
                {(['1D', '1W', '1M'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setInterval(t)}
                        className={`text-[10px] px-2 py-1 rounded transition-colors ${interval === t
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                        <XAxis
                            dataKey={xAxisPath || "date"}
                            hide={chartData.length > 20}
                            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            hide={true}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--color-popover)",
                                borderColor: "var(--color-border)",
                                color: "var(--color-popover-foreground)",
                                borderRadius: "8px",
                                fontSize: "12px"
                            }}
                            itemStyle={{ color: "var(--color-foreground)" }}
                        />
                        <Area
                            type="monotone"
                            dataKey={yAxisPath || "4. close"}
                            stroke="var(--color-primary)"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
