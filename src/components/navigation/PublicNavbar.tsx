"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  ArrowRight,
  Menu,
  ShieldCheck,
  User,
  LogOut,
  LayoutDashboard,
  ExternalLink,
  Code2,
  Calculator,
  HelpCircle,
  Zap,
} from "lucide-react";

interface PublicNavbarProps {
  initialEmail?: string | null;
}

export function PublicNavbar({ initialEmail }: PublicNavbarProps = {}) {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(initialEmail || null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const supabase = createClient();
      if (!initialEmail) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user?.email) setUserEmail(user.email);
        }).catch(() => {});
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserEmail(session?.user?.email || null);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // Fallback
    }
  }, [initialEmail]);

  const navLinks = [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Integrations", href: "/integrations" },
    { label: "Docs", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <div className="h-full w-full rounded-[10px] bg-background flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-foreground text-base leading-none">
              AI Blog SaaS
            </span>
            <span className="text-[10px] text-muted-foreground font-medium mt-0.5 tracking-wider">
              AUTONOMOUS ORGANIC GROWTH
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* SLA Badge */}
          <div className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span>99.98% SLA Live</span>
          </div>

          {/* Interactive Playground Link */}
          <Button
            asChild
            variant={pathname === "/preview" ? "secondary" : "ghost"}
            size="sm"
            className="text-xs gap-1.5"
          >
            <Link href="/preview">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Studio Sandbox</span>
            </Link>
          </Button>

          {/* Auth State */}
          {userEmail ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-xs h-8 pl-1 pr-2 rounded-full border border-border/60">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                        {userEmail.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate text-muted-foreground font-mono text-[11px]">
                      {userEmail}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground truncate">
                    Signed in as <strong className="text-foreground block truncate">{userEmail}</strong>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer gap-2 text-xs">
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Client Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/onboard?new=true" className="cursor-pointer gap-2 text-xs">
                      <Zap className="h-3.5 w-3.5 text-indigo-400" />
                      Add New Website
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/preview" className="cursor-pointer gap-2 text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      Generation Studio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/auth/signout" className="cursor-pointer gap-2 text-xs text-red-400 hover:text-red-300">
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-xs font-semibold gap-1.5 h-8">
                <Link href="/dashboard">
                  Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-xs h-8">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>

              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-xs font-semibold gap-1.5 h-8">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Trigger (shadcn Sheet) */}
        <div className="flex lg:hidden items-center gap-2">
          {userEmail ? (
            <Button asChild size="sm" className="text-xs h-8">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="text-xs h-8">
              <Link href="/signup">Free Trial</Link>
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Open Mobile Menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] bg-background/95 backdrop-blur-xl border-border flex flex-col justify-between">
              <div className="space-y-6 pt-4">
                <SheetHeader className="text-left pb-2 border-b border-border/40">
                  <SheetTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    AI Blog SaaS
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Links */}
                <div className="flex flex-col space-y-3">
                  {navLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground py-1.5 transition-colors border-b border-border/20"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/preview"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-purple-400 hover:text-purple-300 py-1.5 flex items-center justify-between border-b border-border/20"
                  >
                    <span>Studio Sandbox</span>
                    <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30">
                      Live
                    </Badge>
                  </Link>
                </div>
              </div>

              {/* Mobile Auth Actions */}
              <div className="space-y-3 pt-6 border-t border-border/60">
                {userEmail ? (
                  <>
                    <div className="text-xs text-muted-foreground truncate">
                      Signed in as <span className="font-semibold text-foreground">{userEmail}</span>
                    </div>
                    <Button asChild className="w-full text-xs font-semibold" onClick={() => setMobileOpen(false)}>
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full text-xs" onClick={() => setMobileOpen(false)}>
                      <Link href="/auth/signout">Sign Out</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="w-full text-xs font-semibold" onClick={() => setMobileOpen(false)}>
                      <Link href="/signup">Start 14-Day Free Trial</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full text-xs" onClick={() => setMobileOpen(false)}>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
