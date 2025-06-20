"use client"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 border text-muted-foreground">AppShell placeholder
      <div>{children}</div>
    </div>
  )
} 