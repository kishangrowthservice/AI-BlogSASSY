"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  Sparkles,
  ChevronRight,
  Shield,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/70 bg-background/80 px-6 backdrop-blur-xl">
      {/* Breadcrumb path */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/admin"
          className="hover:text-foreground font-medium transition-colors"
        >
          Growth Service
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="font-semibold text-foreground">Admin Console</span>
        <Badge
          variant="outline"
          className="ml-2 text-[10px] uppercase font-mono tracking-wider text-emerald-400 border-emerald-500/30"
        >
          Live Cluster
        </Badge>
      </div>

      {/* Center / Search bar */}
      <div className="hidden md:flex items-center w-full max-w-sm mx-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tenants, logs, domains, or keys..."
            className="w-full pl-8 pr-12 h-8 text-xs bg-muted/30 border-border/70 focus:bg-background"
          />
          <kbd className="pointer-events-none absolute right-2 top-2 hidden h-4 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground sm:flex">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Provider Fallback Status */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/40 border border-border/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="text-muted-foreground text-[11px]">Groq:</span>
            <span className="font-mono text-[11px] text-foreground font-medium">Primary</span>
          </div>
          <span className="text-muted-foreground/60">→</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-muted-foreground text-[11px]">Gemini:</span>
            <span className="font-mono text-[11px] text-foreground font-medium">Fallback</span>
          </div>
        </div>

        <Button
          asChild
          size="sm"
          className="h-8 text-xs gap-1.5 shadow-xs font-medium"
        >
          <Link href="/preview">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Preview Studio</span>
          </Link>
        </Button>

        <LogoutButton />
      </div>
    </header>
  )
}

function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 text-xs gap-1 border-border/70 text-muted-foreground hover:text-foreground"
      onClick={handleLogout}
    >
      <Shield className="h-3 w-3" />
      Logout
    </Button>
  );
}
