'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/lib/store';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const { theme } = useDashboardStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    if (!mounted) return null;

    return <>{children}</>;
};
