"use client";

import React, { useEffect, useState } from 'react';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useWidth } from '@/hooks/useWidth';
import { useDashboardStore } from '@/lib/store';
import { WidgetRenderer } from './WidgetRenderer';

export const DashboardGrid = () => {
    const { widgets, layout, updateLayout, removeWidget } = useDashboardStore();
    const [mounted, setMounted] = useState(false);
    const { ref, width } = useWidth();

    useEffect(() => {
        setMounted(true);
    }, []);

    const onLayoutChange = (currentLayout: any, allLayouts: any) => {
        // Only update if mounted to avoid hydration mismatch issues initially
        if (mounted) {
            updateLayout(currentLayout);
        }
    };

    if (!mounted) return null;

    return (
        <div ref={ref} className="w-full h-full">
            <Responsive
                width={width}
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={60}
                onLayoutChange={onLayoutChange}
                // @ts-expect-error type definition mismatch
                draggableHandle=".group" // Allow dragging by the card container
                isDraggable
                isResizable
            >
                {widgets.map((widget) => (
                    <div key={widget.id}>
                        <WidgetRenderer
                            widget={widget}
                            onRemove={() => removeWidget(widget.id)}
                        />
                    </div>
                ))}
            </Responsive>
        </div>
    );
};
