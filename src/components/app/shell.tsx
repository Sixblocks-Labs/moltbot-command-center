'use client';

import { PropsWithChildren } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';

export type AppTab = 'dashboard' | 'chat' | 'brain';

export function Shell({
  children,
  tab,
  connected,
  onTabChange,
  footerLeft,
  footerRight,
}: PropsWithChildren<{
  tab: AppTab;
  connected: boolean;
  onTabChange: (t: AppTab) => void;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3">
          <Logo />

          <Tabs value={tab} onValueChange={(v) => onTabChange(v as AppTab)}>
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="brain">Brain</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
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

      <div className="mx-auto grid max-w-screen-2xl grid-cols-[280px_1fr_360px] gap-4 px-4 py-4">
        {children}
      </div>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 text-xs text-muted-foreground">
          <div>{footerLeft}</div>
          <div>{footerRight}</div>
        </div>
      </footer>
    </div>
  );
}
