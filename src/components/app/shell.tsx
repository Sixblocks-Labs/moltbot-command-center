'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { PanelLeft, PanelRight } from 'lucide-react';

export type AppTab = 'dashboard' | 'chat' | 'brain';

export function Shell({
  tab,
  connected,
  onTabChange,
  left,
  main,
  right,
  footerLeft,
  footerRight,
}: {
  tab: AppTab;
  connected: boolean;
  onTabChange: (t: AppTab) => void;
  left: React.ReactNode;
  main: React.ReactNode;
  right: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
}) {
  return (
    <div className="min-h-[100svh] min-h-dvh bg-background text-foreground overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex items-center justify-between gap-3">
            <Logo />

            {/* Mobile: sidebar drawers */}
            <div className="flex items-center gap-2 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" aria-label="Open task tracker">
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[92vw] max-w-sm">
                  <SheetHeader>
                    <SheetTitle>Task Tracker</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">{left}</div>
                </SheetContent>
              </Sheet>

              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" aria-label="Open tool output">
                    <PanelRight className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[92vw] max-w-sm">
                  <SheetHeader>
                    <SheetTitle>Tool Output</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">{right}</div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Tabs: scrollable on mobile */}
          <div className="-mx-1 overflow-x-auto px-1 md:overflow-visible">
            <Tabs value={tab} onValueChange={(v) => onTabChange(v as AppTab)}>
              <TabsList className="min-w-max">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="brain">Brain</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center justify-between gap-2 md:justify-end">
            <div className="flex items-center gap-2">
              <span
                className={
                  connected
                    ? 'h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.12)] animate-pulse'
                    : 'h-2.5 w-2.5 rounded-full bg-rose-300/40 shadow-[0_0_0_6px_rgba(244,63,94,0.06)]'
                }
                aria-hidden
              />
              <Badge
                className={
                  connected
                    ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20'
                    : 'bg-white/5 text-slate-300 border-white/10'
                }
                variant="outline"
              >
                {connected ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Layout: 1 col (<md), 2 cols (md), 3 cols (lg+) */}
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_360px]">
        <div className="hidden md:block">{left}</div>
        <div>{main}</div>
        <div className="hidden lg:block">{right}</div>
      </div>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-1 px-4 py-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="truncate">{footerLeft}</div>
          <div className="truncate">{footerRight}</div>
        </div>
      </footer>
    </div>
  );
}
