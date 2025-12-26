import React, { useState } from 'react';
import { Widget } from '@/lib/types';
import { useWidgetData } from '@/hooks/useWidgetData';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AccordionWidgetProps {
    widget: Widget;
}

// Helper function to format values
const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
        // Format large numbers with commas
        if (value > 1000) {
            return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        }
        return value.toString();
    }
    if (typeof value === 'string') {
        // Check if it's a number string
        const num = parseFloat(value);
        if (!isNaN(num) && isFinite(num)) {
            if (num > 1000) {
                return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
            }
        }
        return value;
    }
    if (Array.isArray(value)) {
        return `${value.length} item(s)`;
    }
    if (typeof value === 'object') {
        return 'Object';
    }
    return String(value);
};

// Recursive component to render nested objects
const NestedObjectRenderer: React.FC<{ 
    data: any; 
    level?: number; 
    maxLevel?: number;
    parentKey?: string;
}> = ({ data, level = 0, maxLevel = 5, parentKey = '' }) => {
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    if (!data || typeof data !== 'object') {
        return <span className="text-gray-300">{formatValue(data)}</span>;
    }

    if (Array.isArray(data)) {
        if (data.length === 0) {
            return <span className="text-gray-500 italic">Empty array</span>;
        }
        
        return (
            <div className="space-y-2">
                {data.map((item, idx) => {
                    const itemKey = `${parentKey}-${idx}`;
                    const isExpanded = expanded.has(itemKey);
                    
                    if (typeof item === 'object' && item !== null && level < maxLevel) {
                        return (
                            <div key={idx} className="border-l-2 border-gray-700 pl-3">
                                <button
                                    onClick={() => {
                                        const newExpanded = new Set(expanded);
                                        if (isExpanded) {
                                            newExpanded.delete(itemKey);
                                        } else {
                                            newExpanded.add(itemKey);
                                        }
                                        setExpanded(newExpanded);
                                    }}
                                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-1"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                    <span className="font-semibold">Item {idx + 1}</span>
                                </button>
                                {isExpanded && (
                                    <div className="ml-6 mt-1">
                                        <NestedObjectRenderer 
                                            data={item} 
                                            level={level + 1} 
                                            maxLevel={maxLevel}
                                            parentKey={itemKey}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    }
                    
                    return (
                        <div key={idx} className="text-sm text-gray-300 pl-4">
                            <span className="text-gray-500">[{idx}]:</span> {formatValue(item)}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Handle regular objects
    const keys = Object.keys(data);
    if (keys.length === 0) {
        return <span className="text-gray-500 italic">Empty object</span>;
    }

    return (
        <div className="space-y-1">
            {keys.map((key) => {
                const value = data[key];
                const itemKey = `${parentKey}-${key}`;
                const isExpanded = expanded.has(itemKey);
                const isComplex = typeof value === 'object' && value !== null && level < maxLevel;

                return (
                    <div key={key} className="text-sm">
                        {isComplex ? (
                            <div>
                                <button
                                    onClick={() => {
                                        const newExpanded = new Set(expanded);
                                        if (isExpanded) {
                                            newExpanded.delete(itemKey);
                                        } else {
                                            newExpanded.add(itemKey);
                                        }
                                        setExpanded(newExpanded);
                                    }}
                                    className="flex items-center gap-2 text-gray-300 hover:text-white w-full text-left py-1"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                    )}
                                    <span className="font-semibold capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </span>
                                </button>
                                {isExpanded && (
                                    <div className="ml-6 mt-1 border-l-2 border-gray-700 pl-3">
                                        <NestedObjectRenderer 
                                            data={value} 
                                            level={level + 1} 
                                            maxLevel={maxLevel}
                                            parentKey={itemKey}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-2 py-1">
                                <span className="font-medium text-gray-400 capitalize min-w-[120px]">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                </span>
                                <span className="text-gray-300 flex-1">{formatValue(value)}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const AccordionWidget: React.FC<AccordionWidgetProps> = ({ widget }) => {
    const { data, loading, error } = useWidgetData(widget.config);

    if (loading && !data) {
        return (
            <div className="p-4 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-400 text-xs">
                Error: {error}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-4 text-gray-500 text-xs">
                No Data
            </div>
        );
    }

    return (
        <div className="p-4 h-full overflow-auto">
            <div className="space-y-2">
                <NestedObjectRenderer data={data} />
            </div>
        </div>
    );
};

