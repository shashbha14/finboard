import React, { useState, useMemo } from 'react';
import { Widget } from '@/lib/types';
import { useWidgetData, getNestedValue } from '@/hooks/useWidgetData';
import { Input } from '@/components/ui/primitives';

interface TableWidgetProps {
    widget: Widget;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ widget }) => {
    const { data, loading, error } = useWidgetData(widget.config);
    const { listPath, columns } = widget.config.dataMapping || {};
    const [searchTerm, setSearchTerm] = useState('');

    const listData = useMemo(() => {
        if (!data) {
            console.log('[TableWidget] No data available');
            return [];
        }
        
        // If listPath is provided, use it. Otherwise use data directly.
        const list = listPath ? getNestedValue(data, listPath) : data;
        
        console.log('[TableWidget] Data processing:', {
            hasData: !!data,
            listPath,
            listType: typeof list,
            isArray: Array.isArray(list),
            listKeys: list && typeof list === 'object' ? Object.keys(list) : null,
            dataKeys: data ? Object.keys(data) : []
        });
        
        // Handle single object by wrapping it in an array
        if (Array.isArray(list)) return list;
        if (list && typeof list === 'object') return [list];
        return [];
    }, [data, listPath]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return listData;
        return listData.filter((item: any) =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [listData, searchTerm]);

    // Ensure we have columns or generate them - MUST be called before any early returns
    const tableColumns = useMemo(() => {
        if (columns && columns.length > 0) {
            return columns;
        }
        // Auto-generate columns from first item
        if (listData.length > 0 && listData[0]) {
            return Object.keys(listData[0]).slice(0, 10).map(key => ({
                header: key.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                path: key
            }));
        }
        return [];
    }, [columns, listData]);

    if (loading && !data) return <div className="p-4 animate-pulse">Loading...</div>;
    if (error) return <div className="p-4 text-red-400 text-xs">Error: {error}</div>;
    if (!listData.length) return <div className="p-4 text-gray-500 text-xs">No Data Found</div>;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-2 border-b border-gray-800">
                <Input
                    placeholder="Search..."
                    value={searchTerm || ''}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-7 text-xs"
                />
            </div>
            <div className="flex-1 overflow-auto">
                {tableColumns.length > 0 ? (
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-800 sticky top-0">
                            <tr>
                                {tableColumns.map((col, idx) => (
                                    <th key={idx} className="p-2 font-semibold text-gray-300 border-b border-gray-700">
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item: any, rowIdx: number) => (
                                <tr key={rowIdx} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    {tableColumns.map((col, colIdx) => {
                                        // Handle paths that start with brackets (e.g., '["01. symbol"]')
                                        // When listPath is used, the item is already the target object
                                        let value: any;
                                        const path = col.path;
                                        
                                        if (path.startsWith('[') && path.endsWith(']')) {
                                            // Extract the key from brackets: '["01. symbol"]' -> '01. symbol'
                                            const key = path.slice(1, -1).replace(/^['"]|['"]$/g, '');
                                            value = item[key];
                                        } else {
                                            // Use getNestedValue for nested paths or direct keys
                                            value = getNestedValue(item, path);
                                        }
                                        
                                        // Handle case where value is undefined or null
                                        if (value === undefined || value === null) {
                                            value = '';
                                        }
                                        
                                        // Handle objects and arrays - don't try to display them directly
                                        if (typeof value === 'object' && value !== null) {
                                            if (Array.isArray(value)) {
                                                value = value.length > 0 ? `${value.length} items` : '';
                                            } else {
                                                // For objects, try to get a meaningful string representation
                                                value = '';
                                            }
                                        }
                                        
                                        // Parse string values to numbers if possible (Alpha Vantage returns strings)
                                        if (typeof value === 'string' && value.trim() !== '' && !value.includes('%')) {
                                            const numValue = parseFloat(value);
                                            if (!isNaN(numValue) && isFinite(numValue)) {
                                                value = numValue;
                                            }
                                        }
                                        
                                        let formattedValue = String(value || '');
                                        
                                        // Format based on field name, path, or value type
                                        if (typeof value === 'number') {
                                            const pathLower = path.toLowerCase();
                                            const headerLower = col.header.toLowerCase();
                                            
                                            // Check if it's a price field
                                            if (path === 'c' || path === 'h' || path === 'l' || path === 'o' || path === 'pc' ||
                                                pathLower.includes('price') || pathLower.includes('high') || pathLower.includes('low') || 
                                                pathLower.includes('open') || pathLower.includes('close')) {
                                                // Price fields - format as currency
                                                formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
                                            } else if (path === 'dp' || pathLower.includes('change percent') || headerLower.includes('change %')) {
                                                // Percentage change
                                                formattedValue = `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
                                            } else if (path === 'd' || (pathLower.includes('change') && !pathLower.includes('percent'))) {
                                                // Dollar change (but not percentage)
                                                formattedValue = `${value >= 0 ? '+' : ''}${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}`;
                                            } else {
                                                formattedValue = value.toLocaleString();
                                            }
                                        } else if (typeof value === 'string' && value.includes('%')) {
                                            // Handle string percentages from Alpha Vantage (e.g., "0.2568%")
                                            formattedValue = value;
                                        }
                                        
                                        return (
                                            <td key={colIdx} className="p-2 text-gray-200" title={String(value || '')}>
                                                {formattedValue}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-4 text-gray-500 text-xs text-center">No columns configured</div>
                )}
            </div>
        </div>
    );
};
