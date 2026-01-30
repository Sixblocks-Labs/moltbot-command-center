'use client';

// A simple fixed overlay that iOS/WebKit tends to render more reliably than html/body pseudo-elements.
export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 aurora-shimmer" />
    </div>
  );
}
