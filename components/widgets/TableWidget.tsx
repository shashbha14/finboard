import React, { useState, useMemo, useEffect } from 'react';
import { Widget } from '@/lib/types';
import { useWidgetData, getNestedValue } from '@/hooks/useWidgetData';
import { Input } from '@/components/ui/primitives';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface TableWidgetProps {
    widget: Widget;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ widget }) => {
    const { data, loading: isLoading, error } = useWidgetData(widget.config);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

    // Handle string or object data
    const tableData = useMemo(() => {
        if (!data) return [];
        const rawList = widget.config.dataMapping?.listPath
            ? getNestedValue(data, widget.config.dataMapping.listPath)
            : data;

        if (Array.isArray(rawList)) return rawList;
        if (rawList && typeof rawList === 'object') return [rawList];
        return [];
    }, [data, widget.config.dataMapping?.listPath]);

    // 1. Filter
    const filteredData = useMemo(() => {
        if (!searchTerm) return tableData;
        return tableData.filter((item: any) =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [tableData, searchTerm]);

    // 2. Sort
    const sortedData = useMemo(() => {
        const sortableItems = [...filteredData];
        if (!sortConfig.key) return sortableItems;

        return sortableItems.sort((a, b) => {
            const column = widget.config.dataMapping?.columns?.find(c => c.header === sortConfig.key);
            const path = column ? column.path : sortConfig.key;

            const valA = getNestedValue(a, path);
            const valB = getNestedValue(b, path);

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig, widget.config.dataMapping?.columns]);

    // 3. Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize]);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSort = (header: string) => {
        setSortConfig(current => ({
            key: header,
            direction: current.key === header && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Auto-generate columns
    const tableColumns = useMemo(() => {
        const columnsConfig = widget.config.dataMapping?.columns;
        if (columnsConfig && columnsConfig.length > 0) {
            return columnsConfig;
        }
        const firstItem = tableData[0];
        if (firstItem) {
            return Object.keys(firstItem).slice(0, 10).map(key => ({
                header: key.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                path: key
            }));
        }
        return [];
    }, [widget.config.dataMapping?.columns, tableData]);

    if (isLoading) {
        return <div className="p-4 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>;
    }

    if (error) {
        return <div className="p-4 text-red-400 text-xs">Error: {error}</div>;
    }

    if (!tableData.length && !isLoading) {
        return <div className="p-4 text-gray-500 text-xs">No Data Found</div>;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-2 border-b border-border">
                <Input
                    placeholder="Search..."
                    value={searchTerm || ''}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-7 text-xs bg-background"
                />
            </div>
            <div className="flex-1 overflow-auto">
                {tableColumns.length > 0 ? (
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted sticky top-0 z-10">
                            <tr>
                                {tableColumns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        onClick={() => handleSort(col.header)}
                                        className="p-2 font-semibold text-muted-foreground border-b border-border cursor-pointer hover:bg-muted/80 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.header}
                                            {sortConfig.key === col.header && (
                                                sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((item: any, rowIdx: number) => (
                                <tr key={rowIdx} className="border-b border-border hover:bg-muted/50">
                                    {tableColumns.map((col, colIdx) => {
                                        const value = getNestedValue(item, col.path);
                                        let formattedValue: any = value;

                                        // 1. Handle Objects/Arrays
                                        if (typeof value === 'object' && value !== null) {
                                            if (Array.isArray(value)) {
                                                formattedValue = value.length > 0 ? `${value.length} items` : '';
                                            } else {
                                                formattedValue = '';
                                            }
                                        }
                                        // 2. Handle Booleans
                                        else if (typeof value === 'boolean') {
                                            formattedValue = value ? 'Yes' : 'No';
                                        }
                                        // 3. Handle Numbers/Strings
                                        else {
                                            // Ensure value is string for parsing check
                                            let valStr = String(value || '');
                                            let numVal = typeof value === 'number' ? value : parseFloat(valStr);

                                            // Check if it's a valid number and not a percentage string already
                                            const isNumber = !isNaN(numVal) && isFinite(numVal) && !valStr.includes('%');

                                            if (isNumber) {
                                                const pathLower = col.path.toLowerCase();
                                                const headerLower = col.header.toLowerCase();

                                                // Price Formatting
                                                if (['c', 'h', 'l', 'o', 'pc'].includes(col.path) ||
                                                    pathLower.includes('price') || pathLower.includes('close')) {
                                                    formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numVal);
                                                }
                                                // Percentage Formatting
                                                else if (col.path === 'dp' || pathLower.includes('percent')) {
                                                    formattedValue = `${numVal >= 0 ? '+' : ''}${numVal.toFixed(2)}%`;
                                                }
                                                // Change Formatting
                                                else if (col.path === 'd' || pathLower.includes('change')) {
                                                    formattedValue = `${numVal >= 0 ? '+' : ''}${numVal.toFixed(2)}`;
                                                }
                                                else {
                                                    formattedValue = valStr;
                                                }
                                            } else {
                                                formattedValue = valStr;
                                            }
                                        }

                                        return (
                                            <td key={colIdx} className="p-2 text-card-foreground" title={String(value || '')}>
                                                {formattedValue}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-4 text-gray-500 text-sm text-center">No data available</div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-2 border-t border-border flex items-center justify-between bg-muted/20">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4 text-foreground" />
                    </button>
                    <span className="text-xs text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="p-1 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4 text-foreground" />
                    </button>
                </div>
            )}
        </div>
    );
};
