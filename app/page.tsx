"use client";

import { useState, useEffect } from "react";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { AddWidgetModal } from "@/components/dashboard/AddWidgetModal";
import { Button } from "@/components/ui/primitives";
import { Plus } from "lucide-react";
import { useDashboardStore } from "@/lib/store";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Ensure we are client-side for store access if needed, though grid handles it.
  const { theme } = useDashboardStore();

  // Basic theme application
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Prevent hydration errors by waiting for mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">FinBoard</h1>
          <p className="text-slate-400 text-sm">Real-time customizable finance dashboard</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-500">
          <Plus className="w-4 h-4" />
          Add Widget
        </Button>
      </header>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800 min-h-[600px] p-4">
        <DashboardGrid />

        {/* Empty State Hint if needed */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-10">
          <span className="text-9xl font-bold text-slate-800">FinBoard</span>
        </div>
      </div>

      <AddWidgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
