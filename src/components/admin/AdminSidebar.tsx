"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  Layers,
  Activity,
  ShieldCheck,
  Gauge,
  KeyRound,
  BookOpen,
  ChevronDown,
  ChevronsUpDown,
  Plus,
  Radio,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
  badgeVariant?: "default" | "secondary" | "outline" | "destructive" | "groq" | "gemini"
}

const mainNav: NavItem[] = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Tenants & Sites",
    href: "/admin?tab=tenants",
    icon: Building2,
  },
  {
    title: "Content Studio",
    href: "/preview",
    icon: Sparkles,
    badge: "Live",
    badgeVariant: "groq",
  },
  {
    title: "Async Queue",
    href: "/admin?tab=queue",
    icon: Layers,
    badge: "Cron",
  },
  {
    title: "Observability Logs",
    href: "/admin?tab=logs",
    icon: Activity,
  },
]

const infraNav: NavItem[] = [
  {
    title: "Circuit Breakers",
    href: "/admin?tab=circuits",
    icon: ShieldCheck,
  },
  {
    title: "Rate Limits",
    href: "/admin?tab=ratelimits",
    icon: Gauge,
  },
  {
    title: "API Keys & SDK",
    href: "/admin?tab=apikeys",
    icon: KeyRound,
  },
]

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex flex-col w-64 border-r border-border/70 bg-card/40 backdrop-blur-md h-screen sticky top-0 shrink-0 select-none",
        className
      )}
    >
      {/* Workspace / Tenant Selector */}
      <div className="p-4 border-b border-border/60">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between px-3 h-12 bg-background/50 hover:bg-accent/40 border-border/70"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-border flex items-center justify-center text-foreground font-bold text-xs shadow-xs">
                  GS
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-none tracking-tight text-foreground">
                    Growth Service
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    Multi-Tenant SaaS
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Workspaces & Orgs
            </DropdownMenuLabel>
            <DropdownMenuItem className="gap-2 text-xs font-medium cursor-pointer">
              <div className="w-5 h-5 rounded bg-secondary text-foreground flex items-center justify-center font-bold text-[10px]">
                GS
              </div>
              Growth Service Production
              <Badge variant="outline" className="ml-auto text-[9px] px-1 py-0">
                Active
              </Badge>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs text-muted-foreground cursor-pointer">
              <div className="w-5 h-5 rounded bg-muted text-muted-foreground flex items-center justify-center font-bold text-[10px]">
                TF
              </div>
              TechFlow Media Group
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-xs text-foreground cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              Register New Organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Platform Engine
          </div>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group",
                    isActive
                      ? "bg-secondary text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-105",
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant || "secondary"}
                      className="text-[9px] px-1.5 py-0 font-bold"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Infrastructure & Resiliency
          </div>
          <nav className="space-y-1">
            {infraNav.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:scale-110" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Quick Links */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Developer Resources
          </div>
          <nav className="space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                <span>API Gateway Hero</span>
              </div>
            </Link>
            <Link
              href="/preview"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                <span>Interactive Studio</span>
              </div>
            </Link>
          </nav>
        </div>
      </div>

      {/* System Status Pill & Footer */}
      <div className="p-3 border-t border-border/60 bg-card/20">
        <div className="rounded-lg p-2.5 bg-background/60 border border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Cluster Active</span>
            </div>
            <Badge variant="outline" className="text-[9px] px-1 py-0 text-emerald-400 border-emerald-500/30">
              Healthy
            </Badge>
          </div>
          <div className="text-[10px] text-muted-foreground flex justify-between">
            <span>Groq → Gemini Failover</span>
            <span className="font-mono text-[9px] text-foreground">99.8%</span>
          </div>
        </div>

        {/* User profile strip */}
        <div className="flex items-center justify-between pt-3 px-1">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 border border-border">
              <AvatarFallback className="bg-secondary text-foreground font-bold text-[10px]">
                SA
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-semibold leading-tight text-foreground">
                Senior Admin
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Enterprise Tier
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
