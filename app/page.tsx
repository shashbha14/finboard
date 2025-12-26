"use client";

import { useState, useEffect } from "react";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { AddWidgetModal } from "@/components/dashboard/AddWidgetModal";
import { Button } from "@/components/ui/primitives";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prevent hydration errors by waiting for mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-background text-foreground p-6 transition-colors duration-300">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">FinBoard</h1>
          <p className="text-muted-foreground text-sm">Real-time customizable finance dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Add Widget
          </Button>
        </div>
      </header>

      <div className="bg-muted/30 rounded-xl border border-border min-h-[600px] p-4">
        <DashboardGrid />

        {/* Empty State Hint if needed */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-5">
          <span className="text-9xl font-bold text-foreground">FinBoard</span>
        </div>
      </div>

      <AddWidgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
