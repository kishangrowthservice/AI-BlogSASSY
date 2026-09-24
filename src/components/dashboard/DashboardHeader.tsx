"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Globe, ChevronDown, Check, Plus, LogOut, BookOpen, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { SafeSiteProfile } from "@/lib/sanitize";
import type { UserSiteSummary } from "@/lib/serverActions";
import { getPlanTier } from "@/lib/billing";

interface DashboardHeaderProps {
  profile: SafeSiteProfile;
  userSites: UserSiteSummary[];
  currentUserEmail?: string | null;
  onOpenGenerateModal: () => void;
  onOpenMobileMenu?: () => void;
}

export function DashboardHeader({
  profile,
  userSites,
  currentUserEmail,
  onOpenGenerateModal,
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  const currentPlan = getPlanTier(profile.plan_tier);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Toggle + Logo + Site Switcher */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileMenu}
            className="md:hidden h-9 w-9 text-muted-foreground"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* SaaS Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-sm group-hover:shadow-indigo-500/20 transition-shadow">
              <div className="h-full w-full rounded-[6px] bg-background flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="font-bold tracking-tight text-sm sm:text-base hidden sm:inline text-foreground">
              AI Blog SaaS
            </span>
          </Link>

          <Separator orientation="vertical" className="h-4 bg-border/60 mx-1 hidden sm:block" />

          {/* Multi-Site Switcher Dropdown */}
          {userSites && userSites.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border/70 hover:bg-muted/40 transition-colors text-left bg-card/60 backdrop-blur-md">
                  <div className="h-5 w-5 rounded-md bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Globe className="h-3 w-3 text-indigo-400" />
                  </div>
                  <div className="truncate max-w-[120px] sm:max-w-[180px]">
                    <div className="text-xs font-semibold text-foreground truncate flex items-center gap-1">
                      {profile.site_name}
                      <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground truncate">{profile.domain}</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-card/95 backdrop-blur-xl border-border/80">
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Websites ({userSites.length})
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userSites.map((s) => (
                  <DropdownMenuItem key={s.id} asChild className="cursor-pointer">
                    <Link
                      href={`/dashboard?siteId=${s.id}`}
                      className={`flex items-center justify-between text-xs py-2 ${
                        s.id === profile.id ? "font-bold text-primary bg-primary/10" : "text-foreground"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{s.site_name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono truncate">{s.domain}</div>
                      </div>
                      {s.id === profile.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/onboard?new=true"
                    className="flex items-center gap-2 text-xs text-indigo-400 py-1.5 font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Connect Another Website
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{profile.site_name}</span>
              <Badge variant="outline" className="font-mono text-[9px] text-muted-foreground">
                {profile.domain}
              </Badge>
            </div>
          )}
        </div>

        {/* Right: Quick Action + Plan Badge + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action: Generate Post */}
          <Button
            size="sm"
            onClick={onOpenGenerateModal}
            className="h-8 px-3 text-xs font-semibold gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm shadow-purple-500/20"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden xs:inline">Generate Post</span>
          </Button>

          {/* Plan Badge */}
          <Badge
            variant="outline"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-400 border-emerald-500/30 bg-emerald-500/5 px-2.5 py-0.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {currentPlan.name}
          </Badge>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border/60 p-1 hover:border-primary/50 transition-colors">
                <div className="h-7 w-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300 uppercase">
                  {currentUserEmail ? currentUserEmail.charAt(0) : "U"}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/80">
              <DropdownMenuLabel className="text-xs">
                <div className="font-medium text-foreground">Signed in as</div>
                <div className="font-mono text-[11px] text-muted-foreground truncate">{currentUserEmail || "User"}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer text-xs">
                <Link href="/docs" target="_blank" className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  API Documentation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer text-xs">
                <Link href="/preview" className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  Live Preview Studio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer text-xs text-red-400 focus:text-red-400">
                <Link href="/auth/signout" className="flex items-center gap-2">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
