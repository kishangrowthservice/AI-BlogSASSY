import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface MiniAuthNavProps {
  rightContent?: React.ReactNode;
}

/**
 * Minimal header for auth-flow pages: login, signup, forgot-password, reset-password.
 * Keeps the full PublicNavbar out of authenticated contexts while maintaining brand consistency.
 */
export function MiniAuthNav({ rightContent }: MiniAuthNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <div className="h-full w-full rounded-[10px] bg-background flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-foreground text-sm leading-none">
              AI Blog SaaS
            </span>
            <span className="text-[9px] text-muted-foreground font-medium mt-0.5 tracking-widest hidden sm:block">
              AUTONOMOUS ORGANIC GROWTH
            </span>
          </div>
        </Link>

        {/* Optional right slot */}
        {rightContent && (
          <div className="text-xs text-muted-foreground">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}

/** Simple footer for auth pages */
export function MiniAuthFooter() {
  return (
    <footer className="border-t border-border/40 py-4 px-4 text-center text-xs text-muted-foreground">
      <div className="max-w-md mx-auto flex items-center justify-between flex-wrap gap-2">
        <span>&copy; {new Date().getFullYear()} AI Blog SaaS Platform.</span>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        </div>
      </div>
    </footer>
  );
}
