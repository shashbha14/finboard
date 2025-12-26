'use client';

import { useDashboardStore } from '@/lib/store';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/primitives';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useDashboardStore();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9 border border-border bg-background hover:bg-accent text-foreground"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
    );
};
