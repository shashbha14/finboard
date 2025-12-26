
"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { AddWidgetModal } from "@/components/dashboard/AddWidgetModal";
import { Button } from "@/components/ui/primitives";
import { Plus, Download, Upload } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDashboardStore } from "@/lib/store";
import { DASHBOARD_TEMPLATES } from "@/lib/templates";

import { Widget } from "@/lib/types";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { widgets, layout, theme, addWidget, updateLayout, toggleTheme } = useDashboardStore();

  // Prevent hydration errors by waiting for mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleExport = () => {
    const config = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      widgets,
      layout,
      theme
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finboard - config - ${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        if (config.version && config.widgets) {
          // We need a way to bulk update. For now, we manually rebuild.
          // Ideally store should have a setFullState action.
          // Since we don't, we'll just reload the page after setting locallystorage?
          // Actually, let's use the actions we have or add a bulk setter. 
          // For safety without editing store type right now, we can try to hack it or just accept we might need to refresh.
          // Wait, I can just update the localStorage directly and reload!
          localStorage.setItem('finboard-storage', JSON.stringify({ state: { widgets: config.widgets, layout: config.layout, theme: config.theme }, version: 0 }));
          window.location.reload();
        } else {
          alert('Invalid configuration file');
        }
      } catch (err) {
        console.error('Import failed', err);
        alert('Failed to parse configuration file');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  if (!mounted) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-background text-foreground p-6 transition-colors duration-300">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">FinBoard</h1>
          <p className="text-muted-foreground text-sm">Real-time customizable finance dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="bg-muted text-xs border border-border rounded px-2 py-1 h-9 focus:outline-none focus:ring-1 focus:ring-primary"
            onChange={(e) => {
              const template = DASHBOARD_TEMPLATES.find(t => t.id === e.target.value);
              if (template) {
                if (confirm(`Load ${template.name} template? This will overwrite your current dashboard.`)) {
                  localStorage.setItem('finboard-storage', JSON.stringify({
                    state: {
                      widgets: template.widgets,
                      layout: template.layout,
                      theme: 'dark' // Default to dark for templates
                    },
                    version: 0
                  }));
                  window.location.reload();
                }
              }
              e.target.value = ""; // Reset
            }}
            defaultValue=""
          >
            <option value="" disabled>Load Template...</option>
            {DASHBOARD_TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <div className="w-px h-6 bg-border mx-2"></div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="icon" title="Import Config">
            <Upload className="w-4 h-4" />
          </Button>
          <Button onClick={handleExport} variant="outline" size="icon" title="Export Config">
            <Download className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-2"></div>
          <ThemeToggle />
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 ml-2">
            <Plus className="w-4 h-4" />
            Add Widget
          </Button>
        </div>
      </header>

      <div className="bg-muted/30 rounded-xl border border-border min-h-[600px] p-4">
        <DashboardGrid onEditWidget={(widget) => {
          setEditingWidget(widget);
          setIsModalOpen(true);
        }} />

        {/* Empty State Hint if needed */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-5">
          <span className="text-9xl font-bold text-foreground">FinBoard</span>
        </div>
      </div>

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWidget(null); // Clear editing state on close
        }}
        widgetToEdit={editingWidget}
      />
    </main>
  );
}
