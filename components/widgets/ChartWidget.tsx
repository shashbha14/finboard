import React, { useMemo, useState } from 'react';
import { Widget } from '@/lib/types';
import { useWidgetData, getNestedValue } from '@/hooks/useWidgetData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';

interface ChartWidgetProps {
    widget: Widget;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget }) => {
    // Default hook data (generic API)
    const { data, loading: isLoading, error } = useWidgetData(widget.config);
    const [interval, setInterval] = useState<'D' | 'W' | 'M'>('D');
    const { dataPath, xAxisPath, yAxisPath } = widget.config.dataMapping || {};

    const chartData = useMemo(() => {
        if (isLoading || !data) return [];

        let processedData: any[] = [];

        // If dataPath is specified, extract the nested array first
        let sourceData = data;
        if (dataPath) {
            sourceData = getNestedValue(data, dataPath);
        }

        if (Array.isArray(sourceData)) {
            processedData = sourceData;
        } else if (typeof sourceData === 'object' && sourceData !== null) {
            const timeSeriesKey = Object.keys(sourceData).find(k => k.includes('Time Series') || k.includes('Daily') || k.includes('Weekly'));
            if (timeSeriesKey && typeof sourceData[timeSeriesKey] === 'object') {
                processedData = Object.entries(sourceData[timeSeriesKey]).map(([date, values]: [string, any]) => ({
                    date,
                    ...values
                })).reverse();
            } else {
                processedData = [{ date: 'Current', ...sourceData }];
            }
        }
        return processedData;
    }, [data, isLoading, dataPath]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2 p-4 h-full justify-center">
                <Skeleton className="h-[200px] w-full" />
            </div>
        );
    }

    if (error) {
        return <div className="flex items-center justify-center h-full text-destructive text-xs p-4 text-center">{error}</div>;
    }

    if (chartData.length === 0) {
        return <div className="p-4 text-muted-foreground text-xs text-center">No Data Available</div>;
    }

    return (
        <div className="flex flex-col h-full w-full p-2">
            {/* Header Controls */}
            <div className="flex justify-end items-center mb-2">
                {/* Interval Selector */}
                <div className="flex gap-1">
                    {(['D', 'W', 'M'] as const).map((t) => (
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
                            dataKey={yAxisPath || "close"}
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
