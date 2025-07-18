import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/custom/sidebar/admin-sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { Bell, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-50/50 dark:from-blue-950/50 dark:via-slate-950 dark:to-blue-950/50">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <SidebarTrigger />
                    <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Bell className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 p-6">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex flex-col min-h-screen pb-20">
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Mobile Content */}
          <main className="flex-1 p-4">
            {children}
          </main>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
} 