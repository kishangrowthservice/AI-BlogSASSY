"use client";

import React, { useState, Suspense } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Persistent Sidebar */}
      <Suspense fallback={<div className="w-64 border-r border-border/70 hidden lg:flex h-screen bg-card/40" />}>
        <AdminSidebar className="hidden lg:flex" />
      </Suspense>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-card border-border/70">
          <Suspense fallback={<div className="w-full h-full bg-card/40" />}>
            <AdminSidebar
              className="h-full border-r-0 w-full"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </Suspense>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
