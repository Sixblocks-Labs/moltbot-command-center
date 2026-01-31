export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400/80 to-violet-500/80 shadow" />
      <div className="leading-tight">
        <div className="text-sm font-semibold font-display tracking-[0.01em]">Moltbot</div>
        <div className="text-[11px] text-muted-foreground">Command Center</div>
      </div>
    </div>
  );
}
