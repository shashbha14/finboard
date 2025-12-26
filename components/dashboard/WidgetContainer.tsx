import React from 'react';
import { Card } from '../ui/primitives';
import { X, Settings, RefreshCw } from 'lucide-react';
import { Widget } from '@/lib/types';
import { useDashboardStore } from '@/lib/store';
import { cn } from '@/components/ui/primitives';

interface WidgetContainerProps {
    widget: Widget;
    children: React.ReactNode;
    onRemove: () => void;
    isLoading?: boolean;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
    widget,
    children,
    onRemove,
    isLoading
}) => {
    return (
        <Card className="h-full flex flex-col overflow-hidden relative group">
            <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-900/50">
                <h3 className="font-semibold text-sm truncate text-gray-200">
                    {widget.config.title}
                </h3>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Placeholder for settings/refresh */}
                    {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />}
                    <button
                        onClick={onRemove}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-auto min-h-0 relative">
                {children}
            </div>
        </Card>
    );
};
