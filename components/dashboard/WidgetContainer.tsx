import React from 'react';
import { useDashboardStore } from '@/lib/store';
import { Settings, X, GripVertical, Pencil, RefreshCw } from 'lucide-react';
import { Widget } from '@/lib/types';
import { Card } from '../ui/primitives';

interface WidgetContainerProps {
    widget: Widget;
    children: React.ReactNode;
    onRemove: () => void;
    onEdit?: () => void;
    isLoading?: boolean;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
    widget,
    children,
    onRemove,
    onEdit,
    isLoading
}) => {
    return (
        <Card className="h-full flex flex-col overflow-hidden relative group bg-card border-border text-card-foreground shadow-sm">
            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30 grab-handle cursor-move">
                <h3 className="font-semibold text-sm truncate text-card-foreground">
                    {widget.config.title}
                </h3>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />}
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="Edit Widget"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onRemove}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove Widget"
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
