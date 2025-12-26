
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Widget, Theme } from './types';
// import { Layout } from 'react-grid-layout'; // Types specific

interface DashboardState {
    widgets: Widget[];
    layout: any[];
    theme: Theme;

    // Actions
    addWidget: (widget: Widget) => void;
    removeWidget: (id: string) => void;
    updateWidgetConfig: (id: string, config: Partial<Widget['config']>) => void;
    updateLayout: (layout: any[]) => void;
    toggleTheme: () => void;
}

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set) => ({
            widgets: [],
            layout: [],
            theme: 'dark', // Default to dark as per design screenshots

            addWidget: (widget) => set((state) => ({
                widgets: [...state.widgets, widget],
                // Add a default layout item for the new widget
                layout: [...state.layout, { i: widget.id, x: 0, y: Infinity, w: 4, h: 4 }]
            })),

            removeWidget: (id) => set((state) => ({
                widgets: state.widgets.filter((w) => w.id !== id),
                layout: state.layout.filter((l) => l.i !== id)
            })),

            updateWidgetConfig: (id, config) => set((state) => ({
                widgets: state.widgets.map((w) =>
                    w.id === id ? { ...w, config: { ...w.config, ...config } } : w
                ),
            })),

            updateLayout: (layout) => set({ layout }),

            toggleTheme: () => set((state) => ({
                theme: state.theme === 'light' ? 'dark' : 'light'
            })),
        }),
        {
            name: 'finboard-storage',
        }
    )
);
