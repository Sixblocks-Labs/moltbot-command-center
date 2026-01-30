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
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            <Badge variant={connected ? 'default' : 'secondary'}>
              {connected ? 'Connected' : 'Offline'}
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-screen-2xl grid-cols-[280px_1fr_360px] gap-4 px-4 py-4">
        {children}
      </div>

      <footer className="border-t">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 text-xs text-muted-foreground">
          <div>{footerLeft}</div>
          <div>{footerRight}</div>
        </div>
      </footer>
    </div>
  );
}
